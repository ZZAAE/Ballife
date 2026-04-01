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
        http    //JWT(session 미사용)
                .csrf(csrf -> csrf.disable())//csrf 보호 비활성화 (RESTAPI 사용시 세션을 사용하지 않으므로 비활성화)
                .sessionManagement(session -> 
                    session.sessionCreationPolicy(SessionCreationPolicy.STATELESS)
                ) //인증
                .authorizeHttpRequests(auth -> auth
                        .requestMatchers("/api/auth/**").permitAll() //인증 API 허용
                        .requestMatchers("/api/products/**").permitAll() // 상품 API 허용
                        .requestMatchers("/api/members/**").permitAll() //회원 API 허용
                        // Swagger UI 허용 (수정됨)
                        .requestMatchers(
                                "/swagger-ui/**",
                                "/swagger-ui.html",
                                "/swagger-resources/**",
                                "/v3/api-docs/**",
                                "/webjars/**")
                        .permitAll() // swagger 사용
                        .anyRequest().authenticated() //나머지는 인증 필요
                );

        return http.build();
    }

    @Bean
    public CorsConfigurationSource corsConfigurationSource(){

        CorsConfiguration configuration = new CorsConfiguration();

        // 허용한 origin(프론트엔드 주소)
        configuration.setAllowedOrigins(List.of(
            "http://localhost:5173", //React vite 서버
            "http://localhost:3000" //개발서버
        ));

        //허용한 Http 메서드
        configuration.setAllowedMethods(Arrays.asList(
            "GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"
        ));

        //허용할 헤더
        configuration.setAllowCredentials(true); //토큰 허용할 수 있게 포함

        //모든 경로에 적용
        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", configuration);

        return source;
    }
}
