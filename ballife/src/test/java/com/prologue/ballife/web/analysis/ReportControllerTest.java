package com.prologue.ballife.web.analysis;

import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;
import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.user;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.content;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.header;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import java.time.LocalDate;
import java.time.format.DateTimeFormatter;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Nested;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;

import com.prologue.ballife.domain.user.User;
import com.prologue.ballife.security.CustomUserDetails;
import com.prologue.ballife.service.report.ReportService;

/**
 * ReportController 통합 테스트 (@SpringBootTest + MockMvc).
 *
 * 검증 포인트:
 *  - 인증 + 정상 호출 → 200 + Content-Type: application/pdf + Content-Disposition + PDF body
 *  - 미인증 호출 → 401
 *  - Content-Disposition 파일명 형식: ballife-report-monthly-YYYYMMDD.pdf
 *
 * 셋업 패턴: HealthAnalysisControllerTest 와 동일 (@SpringBootTest + @MockBean).
 *  - ReportService 는 mock — 실제 분석/PDF 생성은 ReportServiceTest 에서 이미 검증.
 *  - JwtAuthenticationFilter 는 mock 하지 않음 — Security 필터 체인 실제 동작 검증.
 *  - SecurityContext 는 with(user(customUserDetails)) 로 박아 "이미 인증된 상태" 시뮬레이션.
 */
@SpringBootTest
@AutoConfigureMockMvc
class ReportControllerTest {

    private static final byte[] STUB_PDF_BYTES =
            new byte[]{'%','P','D','F','-','1','.','4','\n','S','t','u','b'};

    @Autowired MockMvc mockMvc;

    @MockBean ReportService reportService;

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

        when(reportService.generateMonthlyReport(42L)).thenReturn(STUB_PDF_BYTES);
    }

    // ============================================================
    //  A. 인증 + 정상
    // ============================================================
    @Nested
    @DisplayName("인증 + 정상 호출 (Authenticated)")
    class Authenticated {

        @Test
        @DisplayName("GET /api/health-analysis/report/monthly → 200 + application/pdf + PDF body")
        void monthlyReport_returnsPdf() throws Exception {
            mockMvc.perform(get("/api/health-analysis/report/monthly")
                            .with(user(me)))
                    .andExpect(status().isOk())
                    .andExpect(content().contentType(MediaType.APPLICATION_PDF))
                    .andExpect(content().bytes(STUB_PDF_BYTES));

            // ReportService 가 본인 userId 로 호출됐는지 확인
            verify(reportService).generateMonthlyReport(eq(42L));
        }

        @Test
        @DisplayName("Content-Disposition 파일명: ballife-report-monthly-YYYYMMDD.pdf")
        void contentDisposition_filenameFormat() throws Exception {
            String expectedFilename = "ballife-report-monthly-"
                    + LocalDate.now().format(DateTimeFormatter.ofPattern("yyyyMMdd"))
                    + ".pdf";
            String expectedHeader = "attachment; filename=\"" + expectedFilename + "\"";

            mockMvc.perform(get("/api/health-analysis/report/monthly")
                            .with(user(me)))
                    .andExpect(status().isOk())
                    .andExpect(header().string("Content-Disposition", expectedHeader));
        }
    }

    // ============================================================
    //  B. 미인증
    // ============================================================
    @Nested
    @DisplayName("미인증 호출 (Unauthenticated)")
    class Unauthenticated {

        @Test
        @DisplayName("인증 없이 호출 → 401")
        void noAuth_returns401() throws Exception {
            mockMvc.perform(get("/api/health-analysis/report/monthly"))
                    .andExpect(status().isUnauthorized());
        }
    }
}