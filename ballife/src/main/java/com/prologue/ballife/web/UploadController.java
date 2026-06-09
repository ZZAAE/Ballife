package com.prologue.ballife.web;

import java.util.Map;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RequestPart;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

import com.prologue.ballife.service.storage.StorageService;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Slf4j
@Tag(name = "Upload", description = "파일 업로드 API (이미지)")
@RestController
@RequestMapping("/api/upload")
@RequiredArgsConstructor
public class UploadController {

    private final StorageService storageService;

    @Operation(summary = "이미지 업로드",
            description = "파일을 저장하고 외부 접근 URL을 반환. subDir 로 카테고리 폴더 구분 (예: meal, profile)")
    @PostMapping
    public ResponseEntity<Map<String, String>> upload(
            @RequestPart("file") MultipartFile file,
            @Parameter(description = "카테고리 폴더명 (영문)")
            @RequestParam(value = "subDir", required = false, defaultValue = "general") String subDir) {
        try {
            String url = storageService.save(file, subDir);
            return ResponseEntity.ok(Map.of("url", url));
        } catch (IllegalArgumentException e) {
            log.warn("[Upload] 잘못된 요청: {}", e.getMessage());
            return ResponseEntity.badRequest().body(Map.of("message", e.getMessage()));
        } catch (Exception e) {
            log.error("[Upload] 저장 실패", e);
            return ResponseEntity.internalServerError().body(Map.of("message", "업로드 실패"));
        }
    }
}
