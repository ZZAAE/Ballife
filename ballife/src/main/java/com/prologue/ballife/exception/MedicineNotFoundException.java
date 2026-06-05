package com.prologue.ballife.exception;

import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.ResponseStatus;

// 식약처 API에 해당 의약품이 없을 때 → HTTP 404 (전역 핸들러가 없으면 기본 500으로 나가므로 명시)
@ResponseStatus(HttpStatus.NOT_FOUND)
public class MedicineNotFoundException extends RuntimeException {
    public MedicineNotFoundException(String itemName) {
        super("의약품을 찾을 수 없습니다: " + itemName);
    }
}
