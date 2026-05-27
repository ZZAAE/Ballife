package com.prologue.ballife.web;

import java.util.List;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.prologue.ballife.service.news.NewsService;
import com.prologue.ballife.web.dto.news.NewsCardDto;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;

@Tag(name = "News", description = "메인 카드뉴스 API (하이닥)")
@RestController
@RequestMapping("/api/news")
@RequiredArgsConstructor
public class NewsController {

    private final NewsService newsService;

    @Operation(summary = "카드뉴스 목록", description = "하이닥 최신 건강 뉴스 카드 6건")
    @GetMapping("/cards")
    public ResponseEntity<List<NewsCardDto>> getCards() {
        return ResponseEntity.ok(newsService.getCards());
    }
}
