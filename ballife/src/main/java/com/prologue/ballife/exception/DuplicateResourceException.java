package com.prologue.ballife.exception;

public class DuplicateResourceException extends RuntimeException {
    public DuplicateResourceException(String resourceName, String value) {
        super(resourceName + "이(가) 이미 존재합니다: " + value);
    }

    /** 이미 로케일로 해석된 전체 메시지를 그대로 사용. (i18n: throw 시점에 MessageResolver 로 조립) */
    public DuplicateResourceException(String message) {
        super(message);
    }
}
