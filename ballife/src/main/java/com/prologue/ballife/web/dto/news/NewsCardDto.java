package com.prologue.ballife.web.dto.news;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * 메인 페이지 카드뉴스 응답 DTO (하이닥 RSS 기반)
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class NewsCardDto {
    private String title;       // 기사 제목
    private String link;        // 원문 링크 (클릭 시 새 탭 이동)
    private String thumbnail;   // og:image 썸네일 URL (없으면 null)
    private String summary;     // 본문 요약 (description)
    private String pubDate;     // 발행일시 문자열
}
