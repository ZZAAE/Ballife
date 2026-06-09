package com.prologue.ballife.support;

import java.util.Locale;

import org.springframework.context.MessageSource;
import org.springframework.context.i18n.LocaleContextHolder;
import org.springframework.context.support.ReloadableResourceBundleMessageSource;

import com.prologue.ballife.config.MessageResolver;

/**
 * 테스트용 MessageResolver/MessageSource 팩토리.
 * 실제 messages.properties 번들에 연결하고 로케일을 한국어로 고정 → 라벨/메시지가 한국어로 해석되어
 * 기존 한국어 단언(assert)이 그대로 통과한다.
 */
public final class TestMessages {

    private TestMessages() {}

    /** 실제 번들에 연결된 MessageSource (Thymeleaf 템플릿 엔진 #{...} 해석에도 사용). */
    public static MessageSource source() {
        ReloadableResourceBundleMessageSource ms = new ReloadableResourceBundleMessageSource();
        ms.setBasename("classpath:messages/messages");
        ms.setDefaultEncoding("UTF-8");
        ms.setDefaultLocale(Locale.KOREAN);
        ms.setFallbackToSystemLocale(false);
        ms.setUseCodeAsDefaultMessage(true);
        return ms;
    }

    public static MessageResolver resolver() {
        // 테스트 동안 요청 로케일을 한국어로 고정 (MessageResolver 는 LocaleContextHolder 를 사용)
        LocaleContextHolder.setLocale(Locale.KOREAN);
        return new MessageResolver(source());
    }
}
