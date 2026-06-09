package com.prologue.ballife.config;

import java.util.List;
import java.util.Locale;

import org.springframework.context.MessageSource;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.support.ReloadableResourceBundleMessageSource;
import org.springframework.validation.beanvalidation.LocalValidatorFactoryBean;
import org.springframework.web.servlet.LocaleResolver;
import org.springframework.web.servlet.i18n.AcceptHeaderLocaleResolver;

/**
 * 다국어(i18n) 설정.
 *
 * - 메시지 번들: classpath:messages/messages[_locale].properties (UTF-8)
 *   기본(접미사 없음) 파일은 한국어이며, 미번역 로케일은 한국어로 폴백한다.
 * - 로케일 결정: 요청의 Accept-Language 헤더 (프론트가 선택 언어를 전달).
 *   지원: ko / en / ja / zh-CN, 미지원/미지정 시 ko.
 * - Bean Validation 메시지도 같은 MessageSource + 요청 로케일로 해석되도록 Validator 를 연결.
 */
@Configuration
public class MessageConfig {

    public static final Locale LOCALE_ZH_CN = Locale.SIMPLIFIED_CHINESE; // zh-CN

    @Bean
    public MessageSource messageSource() {
        ReloadableResourceBundleMessageSource ms = new ReloadableResourceBundleMessageSource();
        ms.setBasename("classpath:messages/messages");
        ms.setDefaultEncoding("UTF-8");
        ms.setDefaultLocale(Locale.KOREAN);
        ms.setFallbackToSystemLocale(false); // 시스템 로케일이 아닌 base(한국어)로 폴백
        ms.setUseCodeAsDefaultMessage(true); // 키 누락 시 예외 대신 코드 반환
        ms.setCacheSeconds(60);
        return ms;
    }

    @Bean
    public LocaleResolver localeResolver() {
        AcceptHeaderLocaleResolver resolver = new AcceptHeaderLocaleResolver();
        resolver.setDefaultLocale(Locale.KOREAN);
        resolver.setSupportedLocales(List.of(
                Locale.KOREAN,
                Locale.ENGLISH,
                Locale.JAPANESE,
                LOCALE_ZH_CN));
        return resolver;
    }

    /** @Valid 검증 메시지가 MessageSource + 요청 로케일로 해석되도록 한다. */
    @Bean
    public LocalValidatorFactoryBean getValidator(MessageSource messageSource) {
        LocalValidatorFactoryBean validator = new LocalValidatorFactoryBean();
        validator.setValidationMessageSource(messageSource);
        return validator;
    }
}
