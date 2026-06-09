package com.prologue.ballife.service.storage;

import org.springframework.web.multipart.MultipartFile;

/**
 * 파일 저장 추상화.
 *  - Phase 1: LocalStorageService (로컬 디스크)
 *  - Phase 2: S3StorageService 등으로 교체 시 호출부 코드 변경 없음
 */
public interface StorageService {

    /**
     * 파일 저장 후 외부 접근 URL(또는 path) 반환.
     * @param file 멀티파트 업로드 파일
     * @param subDir 카테고리 폴더 (예: "meal", "profile") — null/blank 가능
     * @return 클라이언트가 사용할 URL (예: "/uploads/meal/2026/05/29/uuid.jpg")
     */
    String save(MultipartFile file, String subDir);

    /**
     * 저장된 URL 의 실제 파일을 삭제.
     * 외부 URL(s3, http 등)이면 false 반환하고 무시.
     */
    boolean delete(String url);
}
