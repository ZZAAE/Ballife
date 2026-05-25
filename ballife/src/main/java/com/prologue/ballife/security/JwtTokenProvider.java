package com.prologue.ballife.security;

import java.nio.charset.StandardCharsets;
import java.util.Date;

import javax.crypto.SecretKey;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

import com.prologue.ballife.domain.user.User;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.security.Keys;

@Component
public class JwtTokenProvider {
    private final SecretKey key;
    private final long expirationMs;

    public JwtTokenProvider(
        @Value("${spring.security.jwt.secret}") String secret,
        @Value("${spring.security.jwt.expiration}") long expirationMs){
            byte[] bytes = secret.getBytes(StandardCharsets.UTF_8);
            this.key = Keys.hmacShaKeyFor(bytes);
            this.expirationMs = expirationMs;
        }
    
    // 토큰 생성
    public String createToken(User user){
        Date now = new Date();
        Date exp = new Date(now.getTime() + expirationMs);
        return Jwts.builder()
                   .subject(user.getLoginId())
                   .claim("userId", user.getUserId())
                   .claim("userCategory", user.getUserCategory().name())
                   .issuedAt(now)
                   .expiration(exp)
                   .signWith(key)
                   .compact();
    }

    //토큰 검증
    public boolean validateToken(String token){
        try{
            Jwts.parser()
                .verifyWith(key)
                .build()
                .parseSignedClaims(token);
            return true;
        }catch(Exception e){
            return false;
        }
    }

    //loginId 검증
    /** JWT subject — {@link CustomUserDetailsService#loadUserByUsername(String)} 인자로 사용 */
    public String getLoginIdFromToken(String token){
        Claims claims = Jwts.parser()
                            .verifyWith(key)
                            .build()
                            .parseSignedClaims(token)
                            .getPayload(); 
        String subject = claims.getSubject();
        if(subject == null || subject.isBlank()){
            throw new IllegalStateException("JWT subject(loginId)가 없습니다.");
        }
        
        return subject;
    }

    //userId 검증
    public Long getUserId(String token){
        Claims claims = Jwts.parser()
                            .verifyWith(key)
                            .build()
                            .parseSignedClaims(token)
                            .getPayload();
        Object raw = claims.get("userId");
        if(raw instanceof Number){
            return ((Number) raw).longValue();
        }
        throw new IllegalStateException("JWT에 userId 클레임이 없습니다.");
    }

    // userCategory 검증
    public String getUserCategory(String token){
        Claims claims = Jwts.parser()
                            .verifyWith(key)
                            .build()
                            .parseSignedClaims(token)
                            .getPayload();
        return claims.get("userCategory", String.class);
    }
}
