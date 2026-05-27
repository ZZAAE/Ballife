package com.prologue.ballife.service.news;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

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
 * 하이닥(hidoc) RSS 카드뉴스 수집 서비스 (MongoDB 영속화).
 *  - RSS(allArticle.xml) 최신 6건 수집
 *  - RSS에 썸네일이 없으므로 각 기사 페이지의 og:image를 보강
 *  - 24시간마다 갱신
 *  - 저작권 안전선: 제목/요약/썸네일/원문링크만 제공 (클릭 시 원문 이동)
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class NewsService {

    private final NewsCardRepository newsCardRepository;

    public static final String CATEGORY_ALL = "전체";

    private static final String RSS_URL = "https://news.hidoc.co.kr/rss/allArticle.xml";
    private static final String USER_AGENT =
            "Mozilla/5.0 (compatible; BallifeBot/1.0; +https://ballife.local)";
    private static final int SHOW_COUNT = 6;
    private static final int TIMEOUT_MS = 8000;

    public List<NewsCardDto> getCards() {
        return newsCardRepository.findByCategoryOrderBySeqAsc(CATEGORY_ALL)
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
        List<NewsCard> cards = fetchFromRss();
        if (cards.isEmpty()) {
            log.warn("[NewsService] 수집 0건 — 기존 데이터 유지");
            return;
        }
        newsCardRepository.deleteByCategory(CATEGORY_ALL);
        newsCardRepository.saveAll(cards);
        log.info("[NewsService] 카드뉴스 {}건 저장", cards.size());
    }

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
                if (result.size() >= SHOW_COUNT) break;

                String link = text(item, "link");
                if (link.isBlank()) continue;

                result.add(NewsCard.builder()
                        .category(CATEGORY_ALL)
                        .seq(result.size())
                        .title(text(item, "title"))
                        .link(link)
                        .thumbnail(fetchOgImage(link))
                        .summary(trim(text(item, "description")))
                        .pubDate(text(item, "pubDate"))
                        .fetchedAt(LocalDateTime.now())
                        .build());
            }
        } catch (Exception e) {
            log.warn("[NewsService] RSS 수집 실패: {}", e.getMessage());
        }
        return result;
    }

    /** 기사 페이지에서 og:image 추출 (없으면 null) */
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
