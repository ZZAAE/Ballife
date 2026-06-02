package com.prologue.ballife.exception;

public class OcrResponseNotFoundException extends RuntimeException{
    public OcrResponseNotFoundException(){
        super("OCR 결과가 없습니다.");
    }
}
