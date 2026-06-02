package com.prologue.ballife.web.analysis;

import java.time.LocalDate;
import java.time.format.DateTimeFormatter;

import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.prologue.ballife.security.CustomUserDetails;
import com.prologue.ballife.service.report.ReportService;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;

/**
 * 건강 분석 보고서 PDF 다운로드 엔드포인트.
 *
 * 인증된 본인 데이터만 다운로드 가능 — userId 는 SecurityContext 의 CustomUserDetails 에서 추출.
 *
 * 엔드포인트:
 *   GET /api/health-analysis/report/monthly  → 최근 30일 보고서 PDF
 *
 * 응답 헤더:
 *   Content-Type: application/pdf
 *   Content-Disposition: attachment; filename="ballife-report-monthly-YYYYMMDD.pdf"
 */
@Tag(name = "HealthAnalysis Report",
     description = "건강 분석 보고서 PDF 다운로드")
@RestController
@RequestMapping("/api/health-analysis/report")
@RequiredArgsConstructor
public class ReportController {

    private static final DateTimeFormatter FILENAME_DATE = DateTimeFormatter.ofPattern("yyyyMMdd");

    private final ReportService reportService;

    @Operation(
            summary = "월간(최근 30일) 건강 보고서 PDF 다운로드 — 본인 데이터",
            description = "JWT 토큰으로 인증된 본인의 최근 30일 측정 기록을 분석한 보고서를 "
                        + "PDF 바이너리로 반환한다. "
                        + "파일명: ballife-report-monthly-YYYYMMDD.pdf (생성일 기준)."
    )
    @GetMapping("/monthly")
    public ResponseEntity<byte[]> downloadMonthlyReport(
            @AuthenticationPrincipal CustomUserDetails me) {

        byte[] pdf = reportService.generateMonthlyReport(me.getUserId());

        String filename = "ballife-report-monthly-"
                + LocalDate.now().format(FILENAME_DATE)
                + ".pdf";

        return ResponseEntity.ok()
                .contentType(MediaType.APPLICATION_PDF)
                .header(HttpHeaders.CONTENT_DISPOSITION,
                        "attachment; filename=\"" + filename + "\"")
                .body(pdf);
    }
}