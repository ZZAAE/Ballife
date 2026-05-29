package com.prologue.ballife.config;

import java.nio.file.Paths;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.CorsRegistry;
import org.springframework.web.servlet.config.annotation.ResourceHandlerRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

//Spring MVC 단계: 인증이 필요없는 범위에 적용(중복이지만 안전)
@Configuration
public class WebConfig implements WebMvcConfigurer {

    @Value("${storage.local.base-path:./uploads}")
    private String storageBasePath;

    @Value("${storage.local.url-prefix:/uploads}")
    private String storageUrlPrefix;

    @Override
    public void addCorsMappings(CorsRegistry registry) {
        registry.addMapping("/**")
                .allowedOrigins("http://localhost:5173", "http://localhost:3000")
                .allowedMethods("GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS")
                .allowedHeaders("*")
                .allowCredentials(true)
                .maxAge(3600); //1시간 동안 같은 요청에 대해 OPTION 중복 차단
    }

    /**
     * 업로드된 파일을 정적 리소스로 서빙.
     * 예: GET /uploads/meal/2026/05/29/uuid.jpg
     *     → file:{storageBasePath}/meal/2026/05/29/uuid.jpg
     */
    @Override
    public void addResourceHandlers(ResourceHandlerRegistry registry) {
        String absolute = Paths.get(storageBasePath).toAbsolutePath().normalize().toString();
        // ResourceLocations 는 "file:" 접두사 + 끝에 슬래시 필요
        String location = "file:" + absolute.replace('\\', '/') + "/";
        String pattern = (storageUrlPrefix.endsWith("/") ? storageUrlPrefix : storageUrlPrefix + "/") + "**";
        registry.addResourceHandler(pattern)
                .addResourceLocations(location)
                .setCachePeriod(86400); // 1일 캐시
    }
}