package com.prologue.ballife.config;

import org.springframework.context.MessageSource;
import org.springframework.context.i18n.LocaleContextHolder;
import org.springframework.stereotype.Component;

/**
 * 현재 요청 로케일(LocaleContextHolder, Accept-Language 로 결정됨)로 메시지 코드를 해석하는 헬퍼.
 * 동적 생성 텍스트(분석 라벨, 예외 메시지, 리포트 문구)에서 코드 → 로케일 문자열로 변환할 때 사용.
 */
@Component
public class MessageResolver {

    private final MessageSource messageSource;

    public MessageResolver(MessageSource messageSource) {
        this.messageSource = messageSource;
    }

    /** 코드를 현재 로케일로 해석. 인자 없는 메시지. */
    public String get(String code) {
        if (code == null) return null;
        return messageSource.getMessage(code, null, code, LocaleContextHolder.getLocale());
    }

    /** 코드를 현재 로케일로 해석. {0},{1}... 인자 치환. */
    public String get(String code, Object... args) {
        if (code == null) return null;
        return messageSource.getMessage(code, args, code, LocaleContextHolder.getLocale());
    }
}
