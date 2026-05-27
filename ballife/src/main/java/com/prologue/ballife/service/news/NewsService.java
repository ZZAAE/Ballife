package com.prologue.ballife.service.news;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

import org.jsoup.Jsoup;
import org.jsoup.nodes.Document;
import org.jsoup.nodes.Element;
import org.jsoup.parser.Parser;
import org.jsoup.select.Elements;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;

import com.prologue.ballife.domain.news.NewsCard;
import com.prologue.ballife.repository.newsMongo.NewsCardRepository;
import com.prologue.ballife.web.dto.news.NewsCardDto;

import jakarta.annotation.PostConstruct;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

/**
 * 하이닥(hidoc) 카드뉴스 수집 서비스 (MongoDB 영속화).
 *  - 전체: RSS(allArticle.xml) 최신 6건
 *  - 질환별(당뇨/고혈압/통풍/비만/골다공증/고지혈증): 검색 페이지 크롤링 각 6건
 *  - 24시간마다 갱신 (하이닥 부담 최소화)
 *  - 저작권 안전선: 제목/요약/썸네일/원문링크만 제공 (클릭 시 원문 이동)
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class NewsService {

    private final NewsCardRepository newsCardRepository;

    public static final String CATEGORY_ALL = "전체";
    // 질환 카테고리 = 검색 키워드 (전체는 RSS로 별도 처리)
    private static final List<String> DISEASE_CATEGORIES =
            List.of("당뇨", "고혈압", "통풍", "비만", "골다공증", "고지혈증");

    private static final String RSS_URL = "https://news.hidoc.co.kr/rss/allArticle.xml";
    private static final String SEARCH_URL = "https://news.hidoc.co.kr/news/articleList.html";
    private static final String USER_AGENT =
            "Mozilla/5.0 (compatible; BallifeBot/1.0; +https://ballife.local)";
    private static final int PER_CATEGORY = 6;
    private static final int TIMEOUT_MS = 8000;
    private static final long REQUEST_DELAY_MS = 600; // 카테고리 요청 간 간격 (매너)

    /** 카테고리별 카드뉴스 조회 (없으면 전체로 폴백) */
    public List<NewsCardDto> getCards(String category) {
        String cat = (category == null || category.isBlank()) ? CATEGORY_ALL : category;
        return newsCardRepository.findByCategoryOrderBySeqAsc(cat)
                .stream()
                .map(this::toDto)
                .toList();
    }

    @PostConstruct
    public void init() {
        refresh(); // 부팅 직후 1회 수집
    }

    @Scheduled(fixedRate = 24L * 60 * 60 * 1000) // 24시간마다
    public void refresh() {
        // 1. 전체 (RSS)
        saveCategory(CATEGORY_ALL, fetchFromRss());

        // 2. 질환별 (검색 크롤링)
        for (String keyword : DISEASE_CATEGORIES) {
            saveCategory(keyword, fetchFromSearch(keyword));
            sleep(REQUEST_DELAY_MS);
        }
    }

    /** 카테고리 데이터 교체 (기존 삭제 후 신규 저장) */
    private void saveCategory(String category, List<NewsCard> cards) {
        if (cards.isEmpty()) {
            log.warn("[NewsService] '{}' 수집 0건 — 기존 데이터 유지", category);
            return;
        }
        newsCardRepository.deleteByCategory(category);
        newsCardRepository.saveAll(cards);
        log.info("[NewsService] '{}' 카드뉴스 {}건 저장", category, cards.size());
    }

    /** 전체: RSS 파싱 */
    private List<NewsCard> fetchFromRss() {
        List<NewsCard> result = new ArrayList<>();
        try {
            Document rss = Jsoup.connect(RSS_URL)
                    .userAgent(USER_AGENT)
                    .timeout(TIMEOUT_MS)
                    .parser(Parser.xmlParser())
                    .get();

            Elements items = rss.select("item");
            for (Element item : items) {
                if (result.size() >= PER_CATEGORY) break;

                String link = text(item, "link");
                if (link.isBlank()) continue;

                String title = text(item, "title");
                String desc = text(item, "description");
                String pubDate = text(item, "pubDate");
                String thumbnail = fetchOgImage(link); // RSS엔 이미지 없음 → og:image 보강

                result.add(NewsCard.builder()
                        .category(CATEGORY_ALL)
                        .seq(result.size())
                        .title(title)
                        .link(link)
                        .thumbnail(thumbnail)
                        .summary(trim(desc))
                        .pubDate(pubDate)
                        .fetchedAt(LocalDateTime.now())
                        .build());
            }
        } catch (Exception e) {
            log.warn("[NewsService] RSS 수집 실패: {}", e.getMessage());
        }
        return result;
    }

    /** 질환별: 검색 결과 페이지 크롤링 (썸네일이 목록에 포함되어 추가요청 불필요) */
    private List<NewsCard> fetchFromSearch(String keyword) {
        List<NewsCard> result = new ArrayList<>();
        try {
            Document doc = Jsoup.connect(SEARCH_URL)
                    .data("sc_word", keyword)
                    .data("view_type", "sm")
                    .userAgent(USER_AGENT)
                    .timeout(TIMEOUT_MS)
                    .get();

            // 기사 링크 단위로 그룹핑 (썸네일 a + 제목 a 가 같은 idxno로 중복됨)
            Elements anchors = doc.select("a[href*=articleView.html]");
            Map<String, NewsCard.NewsCardBuilder> byLink = new LinkedHashMap<>();

            for (Element a : anchors) {
                String link = a.absUrl("href");
                if (link.isBlank()) link = a.attr("href");
                if (!link.contains("articleView.html")) continue;

                NewsCard.NewsCardBuilder b =
                        byLink.computeIfAbsent(link, k -> NewsCard.builder().link(k));

                // 썸네일 (이미지 들어있는 앵커)
                Element img = a.selectFirst("img");
                if (img != null) {
                    String src = !img.attr("src").isBlank() ? img.attr("src")
                            : img.attr("data-src");
                    if (!src.isBlank()) b.thumbnail(src);
                }
                // 제목 (텍스트 들어있는 앵커)
                String t = a.text().trim();
                if (!t.isBlank()) b.title(t);
            }

            int seq = 0;
            for (Map.Entry<String, NewsCard.NewsCardBuilder> e : byLink.entrySet()) {
                if (seq >= PER_CATEGORY) break;
                NewsCard card = e.getValue()
                        .category(keyword)
                        .seq(seq)
                        .fetchedAt(LocalDateTime.now())
                        .build();
                // 제목 없는 항목(이미지 전용 중복 등) 건너뜀
                if (card.getTitle() == null || card.getTitle().isBlank()) continue;
                result.add(card);
                seq++;
            }
        } catch (Exception e) {
            log.warn("[NewsService] '{}' 검색 수집 실패: {}", keyword, e.getMessage());
        }
        return result;
    }

    /** 기사 페이지에서 og:image 추출 (RSS 전체용) */
    private String fetchOgImage(String articleUrl) {
        try {
            Document doc = Jsoup.connect(articleUrl)
                    .userAgent(USER_AGENT)
                    .timeout(TIMEOUT_MS)
                    .get();
            Element og = doc.selectFirst("meta[property=og:image]");
            if (og != null && !og.attr("content").isBlank()) {
                return og.attr("content");
            }
        } catch (Exception e) {
            log.debug("[NewsService] og:image 실패 ({}): {}", articleUrl, e.getMessage());
        }
        return null;
    }

    private String text(Element item, String tag) {
        Element el = item.selectFirst(tag);
        return el != null ? el.text() : "";
    }

    private String trim(String desc) {
        return desc.length() > 90 ? desc.substring(0, 90) + "…" : desc;
    }

    private void sleep(long ms) {
        try {
            Thread.sleep(ms);
        } catch (InterruptedException e) {
            Thread.currentThread().interrupt();
        }
    }

    private NewsCardDto toDto(NewsCard card) {
        return NewsCardDto.builder()
                .title(card.getTitle())
                .link(card.getLink())
                .thumbnail(card.getThumbnail())
                .summary(card.getSummary())
                .pubDate(card.getPubDate())
                .build();
    }
}
