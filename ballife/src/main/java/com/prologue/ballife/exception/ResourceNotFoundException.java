package com.prologue.ballife.exception;

public class ResourceNotFoundException extends RuntimeException {
    public ResourceNotFoundException(String message) {
        super(message);
    }

    public ResourceNotFoundException(String resourceName, Object id) {
        super(resourceName + "을(를) 찾을 수 없습니다. id=" + id);
    }
}
