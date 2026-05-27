package com.prologue.ballife.service.news;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

import org.jsoup.Jsoup;
import org.jsoup.nodes.Document;
import org.jsoup.nodes.Element;
import org.jsoup.parser.Parser;
import org.jsoup.select.Elements;
import org.springframework.data.domain.PageRequest;
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
 *  - 30분마다 RSS를 읽어 MongoDB(news_card)에 upsert (link를 _id로 사용 → 중복 방지)
 *  - RSS에 썸네일이 없으므로 각 기사 페이지의 og:image를 보강
 *  - 저작권 안전선: 제목/요약/썸네일/원문링크만 제공 (클릭 시 원문 이동)
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class NewsService {

    private final NewsCardRepository newsCardRepository;

    private static final String RSS_URL = "https://news.hidoc.co.kr/rss/allArticle.xml";
    private static final String USER_AGENT =
            "Mozilla/5.0 (compatible; BallifeBot/1.0; +https://ballife.local)";
    private static final int FETCH_COUNT = 6;   // RSS에서 수집할 기사 수
    private static final int SHOW_COUNT = 6;    // 메인에 보여줄 카드 수
    private static final int TIMEOUT_MS = 7000;

    /** 메인 카드뉴스: MongoDB에서 최신순 상위 N건 */
    public List<NewsCardDto> getCards() {
        return newsCardRepository
                .findAllByOrderByPubDateDesc(PageRequest.of(0, SHOW_COUNT))
                .stream()
                .map(this::toDto)
                .toList();
    }

    @PostConstruct
    public void init() {
        refresh(); // 부팅 직후 1회 수집
    }

    @Scheduled(fixedRate = 30 * 60 * 1000) // 30분마다
    public void refresh() {
        try {
            Document rss = Jsoup.connect(RSS_URL)
                    .userAgent(USER_AGENT)
                    .timeout(TIMEOUT_MS)
                    .parser(Parser.xmlParser())
                    .get();

            Elements items = rss.select("item");
            List<NewsCard> toSave = new ArrayList<>();

            for (Element item : items) {
                if (toSave.size() >= FETCH_COUNT) break;

                String title = item.selectFirst("title") != null
                        ? item.selectFirst("title").text() : "";
                String link = item.selectFirst("link") != null
                        ? item.selectFirst("link").text() : "";
                String desc = item.selectFirst("description") != null
                        ? item.selectFirst("description").text() : "";
                String pubDate = item.selectFirst("pubDate") != null
                        ? item.selectFirst("pubDate").text() : "";

                if (link.isBlank()) continue;

                String summary = desc.length() > 90 ? desc.substring(0, 90) + "…" : desc;
                String thumbnail = fetchThumbnail(link);

                toSave.add(NewsCard.builder()
                        .link(link)            // _id (중복 시 덮어씀)
                        .title(title)
                        .thumbnail(thumbnail)
                        .summary(summary)
                        .pubDate(pubDate)
                        .fetchedAt(LocalDateTime.now())
                        .build());
            }

            if (!toSave.isEmpty()) {
                newsCardRepository.saveAll(toSave); // upsert
                log.info("[NewsService] 카드뉴스 {}건 MongoDB 저장 완료", toSave.size());
            }
        } catch (Exception e) {
            log.warn("[NewsService] RSS 수집 실패: {}", e.getMessage());
            // 실패해도 기존 MongoDB 데이터는 그대로 유지
        }
    }

    /** 기사 페이지에서 og:image 추출 (없으면 null) */
    private String fetchThumbnail(String articleUrl) {
        try {
            Document doc = Jsoup.connect(articleUrl)
                    .userAgent(USER_AGENT)
                    .timeout(TIMEOUT_MS)
                    .get();
            Element og = doc.selectFirst("meta[property=og:image]");
            if (og != null) {
                String content = og.attr("content");
                if (content != null && !content.isBlank()) return content;
            }
        } catch (Exception e) {
            log.debug("[NewsService] 썸네일 추출 실패 ({}): {}", articleUrl, e.getMessage());
        }
        return null;
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
