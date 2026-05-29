package com.prologue.ballife.service.storage;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.util.Set;
import java.util.UUID;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import jakarta.annotation.PostConstruct;
import lombok.extern.slf4j.Slf4j;

/**
 * 로컬 디스크 저장 구현체.
 *  - 저장 경로: storage.local.base-path
 *  - 외부 URL: storage.local.url-prefix + "/{subDir}/{YYYY}/{MM}/{DD}/{uuid}.{ext}"
 *  - 운영 전환 시 S3StorageService 로 교체 가능 (인터페이스 동일)
 */
@Slf4j
@Service
@ConditionalOnProperty(name = "storage.type", havingValue = "local", matchIfMissing = true)
public class LocalStorageService implements StorageService {

    private static final Set<String> ALLOWED_EXT = Set.of("jpg", "jpeg", "png", "webp", "gif");
    private static final Set<String> ALLOWED_MIME = Set.of(
            "image/jpeg", "image/jpg", "image/png", "image/webp", "image/gif"
    );
    private static final DateTimeFormatter DATE_FMT = DateTimeFormatter.ofPattern("yyyy/MM/dd");

    private final Path basePath;
    private final String urlPrefix;

    public LocalStorageService(
            @Value("${storage.local.base-path}") String basePath,
            @Value("${storage.local.url-prefix:/uploads}") String urlPrefix) {
        this.basePath = Paths.get(basePath).toAbsolutePath().normalize();
        // urlPrefix 끝의 슬래시 제거 (중복 방지)
        this.urlPrefix = urlPrefix.endsWith("/")
                ? urlPrefix.substring(0, urlPrefix.length() - 1)
                : urlPrefix;
    }

    @PostConstruct
    public void init() {
        try {
            Files.createDirectories(basePath);
            log.info("[LocalStorage] 저장 경로 확인: {}", basePath);
        } catch (IOException e) {
            throw new IllegalStateException("저장소 경로 생성 실패: " + basePath, e);
        }
    }

    @Override
    public String save(MultipartFile file, String subDir) {
        if (file == null || file.isEmpty()) {
            throw new IllegalArgumentException("파일이 비어 있습니다.");
        }
        // MIME / 확장자 검증
        String mime = file.getContentType();
        if (mime == null || !ALLOWED_MIME.contains(mime.toLowerCase())) {
            throw new IllegalArgumentException("허용되지 않은 파일 타입: " + mime);
        }
        String ext = extractExt(file.getOriginalFilename());
        if (!ALLOWED_EXT.contains(ext)) {
            throw new IllegalArgumentException("허용되지 않은 확장자: " + ext);
        }

        // {sub}/{yyyy/MM/dd}/{uuid}.{ext}
        String safeSub = sanitizeSub(subDir);
        String dateDir = LocalDate.now().format(DATE_FMT);
        String filename = UUID.randomUUID().toString().replace("-", "") + "." + ext;

        Path relative = Paths.get(safeSub, dateDir, filename);
        Path absolute = basePath.resolve(relative).normalize();
        // path traversal 방지
        if (!absolute.startsWith(basePath)) {
            throw new IllegalArgumentException("잘못된 경로");
        }

        try {
            Files.createDirectories(absolute.getParent());
            file.transferTo(absolute.toFile());
        } catch (IOException e) {
            throw new RuntimeException("파일 저장 실패: " + absolute, e);
        }

        // URL 슬래시로 통일
        String url = urlPrefix + "/" + relative.toString().replace('\\', '/');
        log.info("[LocalStorage] 저장 완료 url={} size={}KB", url, file.getSize() / 1024);
        return url;
    }

    @Override
    public boolean delete(String url) {
        if (url == null || !url.startsWith(urlPrefix + "/")) return false;
        String relative = url.substring(urlPrefix.length() + 1);
        Path absolute = basePath.resolve(relative).normalize();
        if (!absolute.startsWith(basePath)) return false;
        try {
            return Files.deleteIfExists(absolute);
        } catch (IOException e) {
            log.warn("[LocalStorage] 삭제 실패 {} : {}", absolute, e.getMessage());
            return false;
        }
    }

    private String sanitizeSub(String sub) {
        if (sub == null || sub.isBlank()) return "general";
        // 영문/숫자/-_ 만 허용
        String cleaned = sub.replaceAll("[^a-zA-Z0-9_-]", "");
        return cleaned.isBlank() ? "general" : cleaned;
    }

    private String extractExt(String name) {
        if (name == null) return "";
        int dot = name.lastIndexOf('.');
        if (dot < 0 || dot == name.length() - 1) return "";
        return name.substring(dot + 1).toLowerCase();
    }
}
