package com.prologue.ballife.web;

import java.util.List;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.prologue.ballife.service.news.NewsService;
import com.prologue.ballife.web.dto.news.NewsCardDto;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;

@Tag(name = "News", description = "메인 카드뉴스 API (하이닥)")
@RestController
@RequestMapping("/api/news")
@RequiredArgsConstructor
public class NewsController {

    private final NewsService newsService;

    @Operation(summary = "카드뉴스 목록",
            description = "카테고리별 카드뉴스. category 미지정 시 '전체'(최신 6건). " +
                    "질환: 당뇨/고혈압/통풍/비만/골다공증/고지혈증")
    @GetMapping("/cards")
    public ResponseEntity<List<NewsCardDto>> getCards(
            @Parameter(description = "카테고리 (전체/당뇨/고혈압/통풍/비만/골다공증/고지혈증)")
            @RequestParam(required = false, defaultValue = "전체") String category) {
        return ResponseEntity.ok(newsService.getCards(category));
    }
}
