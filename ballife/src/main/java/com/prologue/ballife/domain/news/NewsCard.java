package com.prologue.ballife.domain.news;

import java.time.LocalDateTime;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

import lombok.*;

/**
 * MongoDB 컬렉션 news_card 와 매핑되는 카드뉴스 도큐먼트.
 *  - _id 를 기사 링크로 사용 → 같은 기사 재수집 시 자동 upsert(중복 방지)
 */
@Document(collection = "news_card")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class NewsCard {

    @Id
    private String link;        // 원문 링크 (= _id, 중복 방지 키)

    private String title;       // 기사 제목
    private String thumbnail;   // og:image 썸네일 URL (없으면 null)
    private String summary;     // 본문 요약
    private String pubDate;     // 발행일시 문자열 (RSS 원본)
    private LocalDateTime fetchedAt; // 수집 시각
}
