package com.prologue.ballife.exception;

public class DuplicateResourceException extends RuntimeException {
    public DuplicateResourceException(String resourceName, String value) {
        super(resourceName + "이(가) 이미 존재합니다: " + value);
    }
}
