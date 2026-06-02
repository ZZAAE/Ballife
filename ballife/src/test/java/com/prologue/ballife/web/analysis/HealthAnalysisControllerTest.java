package com.prologue.ballife.web.analysis;

import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.times;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;
import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.user;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import java.time.LocalDate;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Nested;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.test.web.servlet.MockMvc;

import com.prologue.ballife.domain.user.User;
import com.prologue.ballife.security.CustomUserDetails;
import com.prologue.ballife.service.HealthAnalysisService;
import com.prologue.ballife.web.analysis.dto.HealthAnalysisResponse;

/**
 * HealthAnalysisController 통합 테스트 (@SpringBootTest + MockMvc).
 *
 * 검증 포인트:
 *  - 신규 GET /weekly: SecurityContext의 CustomUserDetails.userId가 service로 정확히 전달
 *  - 신규 GET /weekly: 인증 없이 호출 시 401
 *  - 기존 GET /weekly/{userId}: 인증 시 동일 동작 유지 (하위 호환)
 *  - 기존 GET /weekly/{userId}: 인증 없이 호출 시 401
 *
 * Service 로직 자체는 HealthAnalysisServiceTest(3순위)에서 이미 검증됨.
 * 여기는 Controller·Security 통합만 검증한다.
 *
 * 테스트 셋업 메모:
 *  - 원래 @WebMvcTest(슬라이스)로 시도했으나 SecurityConfig가 정상 적용되지 않아 모든 요청이 200
 *    (핸들러 매핑 누락 + Spring Boot 기본 보안 자동설정 끼어듦)이 되는 문제 발생 → @SpringBootTest 풀 컨텍스트로 전환.
 *  - HealthAnalysisService는 @MockBean으로 mock — 진짜 Repository / DB 호출 방지.
 *  - JwtAuthenticationFilter는 mock하지 않음 — Security 필터 체인이 진짜로 동작해야 검증 의미가 있음.
 *  - 토큰 발급은 테스트 범위 밖. SecurityContext를 with(user(customUserDetails))로 직접 박아서
 *    "이미 인증된 상태"를 시뮬레이션. @WithMockUser는 String principal을 박아 @AuthenticationPrincipal
 *    CustomUserDetails가 null이 되므로 사용하지 않음.
 */
@SpringBootTest
@AutoConfigureMockMvc
class HealthAnalysisControllerTest {

    @Autowired MockMvc mockMvc;

    @MockBean HealthAnalysisService healthAnalysisService;

    private CustomUserDetails me;

    @BeforeEach
    void setUp() {
        User testUser = User.builder()
                .userId(42L)
                .loginId("test-user")
                .passwordHash("hash")
                .userCategory(User.UserCategory.USER)
                .build();
        me = new CustomUserDetails(testUser);

        when(healthAnalysisService.analyzeWeekly(42L)).thenReturn(stubResponse(42L, "WEEKLY"));
        when(healthAnalysisService.analyzeMonthly(42L)).thenReturn(stubResponse(42L, "MONTHLY"));
        when(healthAnalysisService.analyzeByPeriod(
                org.mockito.ArgumentMatchers.anyLong(),
                org.mockito.ArgumentMatchers.any(LocalDate.class),
                org.mockito.ArgumentMatchers.any(LocalDate.class),
                org.mockito.ArgumentMatchers.anyString()))
            .thenReturn(stubResponse(42L, "CUSTOM"));
    }

    private HealthAnalysisResponse stubResponse(Long userId, String type) {
        // 기존 7 args (userId, period, bp, bs, bmi, med, disease) +
        // Step B 추가 2 args (user, recordingStats) = 9 args
        return new HealthAnalysisResponse(
                userId,
                new HealthAnalysisResponse.Period(
                        type,
                        LocalDate.now().minusDays(6),
                        LocalDate.now()),
                null, null, null, null, null,
                null, null);
    }

    // ============================================================
    //  A. 신규 GET /weekly (본인 데이터)
    // ============================================================
    @Nested
    @DisplayName("신규 GET /weekly (본인 데이터, @AuthenticationPrincipal)")
    class GetMyWeekly {

        @Test
        @DisplayName("인증된 사용자 → 200 OK + principal.userId(=42)가 service에 그대로 전달됨")
        void authenticated_returnsOkAndPassesPrincipalUserId() throws Exception {
            // given - when
            mockMvc.perform(get("/api/health-analysis/weekly").with(user(me)))
                   // then
                   .andExpect(status().isOk());

            verify(healthAnalysisService, times(1)).analyzeWeekly(eq(42L));
        }

        @Test
        @DisplayName("인증 없이 호출 → 401 Unauthorized")
        void unauthenticated_returns401() throws Exception {
            mockMvc.perform(get("/api/health-analysis/weekly"))
                   .andExpect(status().isUnauthorized());
        }
    }

    // ============================================================
    //  B. 기존 GET /weekly/{userId} (하위 호환, deprecated)
    // ============================================================
    @Nested
    @DisplayName("기존 GET /weekly/{userId} (하위 호환, deprecated)")
    class GetWeeklyByUserId {

        @Test
        @DisplayName("인증된 사용자 → 200 OK (PathVariable userId 그대로 service에 전달)")
        void authenticated_returnsOk() throws Exception {
            mockMvc.perform(get("/api/health-analysis/weekly/{userId}", 42L)
                            .with(user(me)))
                   .andExpect(status().isOk());

            verify(healthAnalysisService, times(1)).analyzeWeekly(eq(42L));
        }

        @Test
        @DisplayName("인증 없이 호출 → 401 Unauthorized")
        void unauthenticated_returns401() throws Exception {
            mockMvc.perform(get("/api/health-analysis/weekly/{userId}", 42L))
                   .andExpect(status().isUnauthorized());
        }
    }

    // ============================================================
    //  C. 신규 GET /monthly (본인 데이터, @AuthenticationPrincipal)
    // ============================================================
    @Nested
    @DisplayName("신규 GET /monthly (본인 데이터, @AuthenticationPrincipal)")
    class GetMyMonthly {

        @Test
        @DisplayName("인증된 사용자 → 200 OK + service.analyzeMonthly(principal.userId) 호출")
        void authenticated_returnsOkAndCallsMonthly() throws Exception {
            mockMvc.perform(get("/api/health-analysis/monthly").with(user(me)))
                   .andExpect(status().isOk());

            verify(healthAnalysisService, times(1)).analyzeMonthly(eq(42L));
        }

        @Test
        @DisplayName("인증 없이 호출 → 401 Unauthorized")
        void unauthenticated_returns401() throws Exception {
            mockMvc.perform(get("/api/health-analysis/monthly"))
                   .andExpect(status().isUnauthorized());
        }
    }

    // ============================================================
    //  D. 신규 GET /range (커스텀 기간, @RequestParam)
    // ============================================================
    @Nested
    @DisplayName("신규 GET /range (커스텀 기간)")
    class GetMyRange {

        @Test
        @DisplayName("인증 + 유효 날짜 → 200 OK + service.analyzeByPeriod(userId, start, end, 'CUSTOM') 호출")
        void authenticated_validRange_returnsOk() throws Exception {
            LocalDate start = LocalDate.now().minusDays(10);
            LocalDate end = LocalDate.now();

            mockMvc.perform(get("/api/health-analysis/range")
                            .param("startDate", start.toString())
                            .param("endDate", end.toString())
                            .with(user(me)))
                   .andExpect(status().isOk());

            verify(healthAnalysisService, times(1))
                    .analyzeByPeriod(eq(42L), eq(start), eq(end), eq("CUSTOM"));
        }

        @Test
        @DisplayName("인증 없이 호출 → 401 Unauthorized")
        void unauthenticated_returns401() throws Exception {
            LocalDate start = LocalDate.now().minusDays(10);
            LocalDate end = LocalDate.now();

            mockMvc.perform(get("/api/health-analysis/range")
                            .param("startDate", start.toString())
                            .param("endDate", end.toString()))
                   .andExpect(status().isUnauthorized());
        }

        @Test
        @DisplayName("잘못된 날짜 형식(startDate=invalid) → 400 Bad Request (Spring 기본 처리)")
        void invalidDateFormat_returns400() throws Exception {
            mockMvc.perform(get("/api/health-analysis/range")
                            .param("startDate", "invalid")
                            .param("endDate", LocalDate.now().toString())
                            .with(user(me)))
                   .andExpect(status().isBadRequest());
        }
    }
}
