package com.prologue.ballife.config;

import java.util.Arrays;
import java.util.List;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;

@Configuration //이 클래스가 설정 클래스임을 선언
@EnableWebSecurity // Spring Security 기능 활성화
public class SecurityConfig {
    
    //다른 클래스에서 주입 받아서 사용 (bean등록 -> 객체를 메서드화 시키는것)
    // PasswordEncoder pe = new PasswordEncoder();
    @Bean 
    public PasswordEncoder passwordEncoder(){
        return new BCryptPasswordEncoder(); //BCrypt: 암호학 알고리즘
    }

    // UI별로 권한설정
   @Bean
    public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
        http
            // CSRF 비활성화 (REST API는 세션 미사용)
            .csrf(csrf -> csrf.disable())
            
            // CORS 설정 적용
            .cors(cors -> cors.configurationSource(corsConfigurationSource()))
            
            // 세션 미사용 (Stateless)
            .sessionManagement(session -> 
                session.sessionCreationPolicy(SessionCreationPolicy.STATELESS)
            ) //관련 기능은 프론트엔드의 AuthContext.jsx를 이용
            
            // URL별 접근 권한 설정
            .authorizeHttpRequests(auth -> auth
                // 모든 요청 허용 (개발 단계)
                .anyRequest().permitAll() //이렇게 해도 스웨거 UI 잘나옴
            );

        return http.build();
    }

     @Bean
    public CorsConfigurationSource corsConfigurationSource() {
        CorsConfiguration configuration = new CorsConfiguration();
        
        // 허용할 Origin (프론트엔드 주소)
        configuration.setAllowedOrigins(List.of(
            "http://localhost:5173",   // Vite 개발 서버
            "http://localhost:3000"    // 기타 개발 서버
        ));
        
        // 허용할 HTTP 메서드
        configuration.setAllowedMethods(Arrays.asList(
            "GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"
        ));
        
        // 허용할 헤더
        configuration.setAllowedHeaders(List.of("*"));
        
        // 인증 정보 포함 허용 (쿠키, Authorization 헤더 등)
        configuration.setAllowCredentials(true);
        
        // 모든 경로에 적용
        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", configuration);
        
        return source;
    }
}
