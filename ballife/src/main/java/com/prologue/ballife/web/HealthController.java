package com.prologue.ballife.web;

import java.util.Map;
import java.util.UUID;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;

/**
 * 서버 생존 확인 엔드포인트.
 * <p>
 * 프론트엔드({@code AuthContext})가 주기적으로 폴링한다.
 * <ul>
 *   <li>연속 실패(서버 다운) 시 → 자동 로그아웃</li>
 *   <li>{@code instanceId} 가 바뀌면(서버 재시작) → 자동 로그아웃</li>
 * </ul>
 * JWT 불필요(SecurityConfig 에서 permitAll), 항상 200 OK 를 반환한다.
 */
@Tag(name = "Health", description = "서버 생존 확인 API")
@RestController
@RequestMapping("/api")
public class HealthController {

    /**
     * 서버 인스턴스 식별자. 빈이 생성되는 시점(=서버 기동)마다 새로 만들어지므로,
     * 서버를 껐다 켜면 값이 바뀐다. 프론트는 이 값의 변화로 재시작을 감지해 로그아웃한다.
     */
    private final String instanceId = UUID.randomUUID().toString();

    @Operation(summary = "헬스 체크", description = "프론트엔드 서버 생존/재시작 폴링용. JWT 불필요, 항상 200 OK.")
    @GetMapping("/health")
    public ResponseEntity<Map<String, String>> health() {
        return ResponseEntity.ok(Map.of("status", "UP", "instanceId", instanceId));
    }
}
