package com.prologue.ballife.security;

import java.io.IOException;

import org.springframework.lang.NonNull;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.security.web.authentication.WebAuthenticationDetailsSource;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;

/**
 * Authorization: Bearer 토큰을 읽어 검증한 뒤, subject(username)로 {@link UserDetails}를 로드해
 * {@link CustomUserDetails}를 principal로 둔다.
 * <p>
 * 노션 문서의 “principal = Long” 방식 대신, 가이드 §9-1 {@link CustomUserDetails}와 §11 업로드 시 memberId 추출을
 * 일치시키기 위해 DB 기반 UserDetails를 사용한다.
 */
@Component
@RequiredArgsConstructor
public class JwtAuthenticationFilter extends OncePerRequestFilter {
    private static final String PREFIX = "Bearer ";

    private final JwtTokenProvider jwtTokenProvider;
    private final UserDetailsService userDetailsService;

    @Override
    protected void doFilterInternal(
        @NonNull HttpServletRequest request,
        @NonNull HttpServletResponse response,
        @NonNull FilterChain filterChain
    ) throws ServletException, IOException{
        String header = request.getHeader("Authorization");
        if (header != null && header.startsWith(header)){
            String token = header.substring(PREFIX.length()).trim();

            if(jwtTokenProvider.validateToken(token)){
                try{
                    String username = jwtTokenProvider.getLoginIdFromToken(token);
                    UserDetails userDetails = userDetailsService.loadUserByUsername(username);
                    UsernamePasswordAuthenticationToken authenticaion =
                        new UsernamePasswordAuthenticationToken(
                            userDetails,
                            null,
                            userDetails.getAuthorities());
                    authenticaion.setDetails(new WebAuthenticationDetailsSource().buildDetails(request));

                    SecurityContextHolder.getContext().setAuthentication(authenticaion);
                } catch(UsernameNotFoundException | IllegalStateException  ignored){

                }
            }
        }

        filterChain.doFilter(request, response);
    }
}
