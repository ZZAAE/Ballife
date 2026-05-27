package com.prologue.ballife.exception;

public class MedicineNotFoundException extends RuntimeException {
    public MedicineNotFoundException(String itemName) {
        super("의약품을 찾을 수 없습니다: " + itemName);
    }
}