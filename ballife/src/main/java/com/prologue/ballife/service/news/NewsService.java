package com.prologue.ballife.service.news;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.HashMap;
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
    private final NewsTranslationClient newsTranslationClient;

    public static final String CATEGORY_ALL = "전체";

    private static final String RSS_URL = "https://news.hidoc.co.kr/rss/allArticle.xml";
    private static final String USER_AGENT =
            "Mozilla/5.0 (compatible; BallifeBot/1.0; +https://ballife.local)";
    private static final int SHOW_COUNT = 6;
    private static final int TIMEOUT_MS = 8000;

    // 제목을 사전번역할 대상 언어 (ko 는 원문 title 그대로 사용)
    private static final List<String> TRANSLATE_LANGS = List.of("en", "ja", "zh-CN");

    public List<NewsCardDto> getCards(String lang) {
        return newsCardRepository.findByCategoryOrderBySeqAsc(CATEGORY_ALL)
                .stream()
                .map(card -> toDto(card, lang))
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
        translateTitles(cards); // en/ja/zh-CN 사전번역 (실패해도 한국어로 동작)
        newsCardRepository.deleteByCategory(CATEGORY_ALL);
        newsCardRepository.saveAll(cards);
        log.info("[NewsService] 카드뉴스 {}건 저장", cards.size());
    }

    /** 카드 제목을 en/ja/zh-CN 으로 사전번역해 titleI18n 에 채운다. 실패 시 해당 언어만 건너뜀. */
    private void translateTitles(List<NewsCard> cards) {
        List<String> koTitles = cards.stream().map(NewsCard::getTitle).toList();
        for (String lang : TRANSLATE_LANGS) {
            List<String> translated = newsTranslationClient.translateTitles(koTitles, lang);
            // 번역 실패 시 클라이언트가 원문을 그대로 돌려주므로, 원문과 같으면 저장 생략
            if (translated == null || translated.size() != cards.size()) {
                continue;
            }
            for (int i = 0; i < cards.size(); i++) {
                NewsCard card = cards.get(i);
                String value = translated.get(i);
                if (value == null || value.isBlank() || value.equals(card.getTitle())) {
                    continue;
                }
                Map<String, String> map = card.getTitleI18n();
                if (map == null) {
                    map = new HashMap<>();
                    card.setTitleI18n(map);
                }
                map.put(lang, value);
            }
        }
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

    private NewsCardDto toDto(NewsCard card, String lang) {
        return NewsCardDto.builder()
                .title(resolveTitle(card, lang))
                .link(card.getLink())
                .thumbnail(card.getThumbnail())
                .summary(card.getSummary())
                .pubDate(card.getPubDate())
                .build();
    }

    /** 요청 언어에 맞는 제목 선택. 번역본이 없으면 한국어 원문으로 폴백. */
    private String resolveTitle(NewsCard card, String lang) {
        if (lang == null || lang.isBlank() || "ko".equals(lang) || card.getTitleI18n() == null) {
            return card.getTitle();
        }
        String translated = card.getTitleI18n().get(lang);
        return (translated != null && !translated.isBlank()) ? translated : card.getTitle();
    }
}
