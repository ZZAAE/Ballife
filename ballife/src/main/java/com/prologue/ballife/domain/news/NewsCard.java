package com.prologue.ballife.domain.news;

import java.time.LocalDateTime;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

import lombok.*;

/**
 * MongoDB 컬렉션 news_card 와 매핑되는 카드뉴스 도큐먼트.
 *  - 카테고리별(전체/당뇨/고혈압/...)로 각 6건 저장
 *  - 같은 기사가 여러 카테고리에 들어갈 수 있어 link를 _id로 쓰지 않음 (auto id)
 *  - seq 로 검색결과(최신/관련도) 순서 보존
 */
@Document(collection = "news_card")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class NewsCard {

    @Id
    private String id;

    private String category;    // 전체 / 당뇨 / 고혈압 / 통풍 / 비만 / 골다공증 / 고지혈증
    private int seq;            // 카테고리 내 정렬 순서 (0~5)
    private String title;       // 기사 제목
    private String link;        // 원문 링크 (클릭 시 새 탭 이동)
    private String thumbnail;   // 썸네일 URL (없으면 null)
    private String summary;     // 본문 요약
    private String pubDate;     // 발행일시 문자열
    private LocalDateTime fetchedAt; // 수집 시각
}
