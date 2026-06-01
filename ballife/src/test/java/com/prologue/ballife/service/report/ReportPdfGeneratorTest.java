package com.prologue.ballife.service.report;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

import java.io.InputStream;
import java.nio.charset.StandardCharsets;
import java.nio.file.Files;
import java.nio.file.Path;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Nested;
import org.junit.jupiter.api.Test;

/**
 * ReportPdfGenerator 단위 테스트.
 *
 * 검증 포인트 (Step C 범위):
 *   - HTML → PDF 변환 파이프라인 동작 확인
 *   - 한글 폰트 임베드 정상 동작 (실패 시 IOException 또는 빈 결과)
 *   - 입력 검증 (null/blank → IllegalArgumentException)
 *
 * PDF 헤더 규약: 모든 PDF 파일은 "%PDF" 4바이트로 시작 (PDF 1.x/2.x 공통).
 * 디자인/Thymeleaf 렌더링은 Step D 범위.
 */
class ReportPdfGeneratorTest {

    ReportPdfGenerator generator;

    @BeforeEach
    void setUp() {
        // @Component 이지만 의존성 없는 순수 헬퍼라 Spring 컨텍스트 없이 직접 생성 가능
        generator = new ReportPdfGenerator();
    }

    private static final String PDF_HEADER = "%PDF";

    private String assertPdfHeader(byte[] bytes) {
        // PDF 시작 시그니처 4바이트 확인
        assertThat(bytes).hasSizeGreaterThan(4);
        return new String(bytes, 0, 4);
    }

    // ============================================================
    //  A. 정상 변환 (영어 / 한글)
    // ============================================================
    @Nested
    @DisplayName("정상 변환 (Generate)")
    class Generate {

        @Test
        @DisplayName("영어 HTML → PDF (헤더 %PDF, length > 0)")
        void englishHtml_convertedToValidPdf() {
            // given
            String html = """
                    <!DOCTYPE html>
                    <html>
                      <head><meta charset="UTF-8"/></head>
                      <body><h1>Hello PDF</h1><p>Step C smoke test.</p></body>
                    </html>
                    """;

            // when
            byte[] pdf = generator.generate(html);

            // then
            assertThat(assertPdfHeader(pdf)).isEqualTo(PDF_HEADER);
            assertThat(pdf.length).isGreaterThan(0);
        }

        @Test
        @DisplayName("한글 HTML → PDF (Noto Sans KR 폰트 임베드, 헤더 %PDF)")
        void koreanHtml_convertedWithEmbeddedFont() {
            // given - "안녕하세요, Ballife 보고서" 가 본문에 들어감
            // - font-family: "Noto Sans KR" 로 등록된 폰트 사용
            String html = """
                    <!DOCTYPE html>
                    <html>
                      <head>
                        <meta charset="UTF-8"/>
                        <style>
                          body { font-family: "Noto Sans KR", sans-serif; }
                          .bold { font-weight: bold; }
                        </style>
                      </head>
                      <body>
                        <h1>안녕하세요, Ballife 보고서</h1>
                        <p class="bold">한글 폰트가 정상 임베드되는지 확인합니다.</p>
                      </body>
                    </html>
                    """;

            // when
            byte[] pdf = generator.generate(html);

            // then
            assertThat(assertPdfHeader(pdf)).isEqualTo(PDF_HEADER);
            // 폰트 임베드되면 영문보다 PDF 크기가 살짝 큼 (Noto Sans KR subset).
            // 정확 임베드 검증은 PDFBox 텍스트 추출이 필요해 본 단계에서는 length > 0 까지만.
            assertThat(pdf.length).isGreaterThan(0);
        }
    }

    // ============================================================
    //  B. 입력 검증
    // ============================================================
    @Nested
    @DisplayName("입력 검증 (InputValidation)")
    class InputValidation {

        @Test
        @DisplayName("null → IllegalArgumentException")
        void nullHtml_throws() {
            assertThatThrownBy(() -> generator.generate(null))
                    .isInstanceOf(IllegalArgumentException.class)
                    .hasMessageContaining("null이거나 비어있을");
        }

        @Test
        @DisplayName("blank (\"   \") → IllegalArgumentException")
        void blankHtml_throws() {
            assertThatThrownBy(() -> generator.generate("   "))
                    .isInstanceOf(IllegalArgumentException.class)
                    .hasMessageContaining("null이거나 비어있을");
        }
    }

    // ============================================================
    //  C. 정적 템플릿 렌더링 (Step D-1 — 디자인 골격 + 더미 데이터)
    // ============================================================
    @Nested
    @DisplayName("정적 템플릿 렌더링 (StaticTemplateRendering)")
    class StaticTemplateRendering {

        /**
         * 클래스패스의 monthly-static.html (Step D-1 디자인 골격) 을 PDF로 변환.
         *
         * 시각 검증(visual check) 옵션:
         *   환경변수 BALLIFE_PDF_DUMP=true 로 실행하면
         *   생성된 PDF를 build/tmp/ballife-pdf-dump/monthly-static.pdf 로 저장.
         *
         * 실행 예:
         *   PowerShell: $env:BALLIFE_PDF_DUMP="true"; ./gradlew test --tests "*ReportPdfGenerator*"
         *   bash:       BALLIFE_PDF_DUMP=true ./gradlew test --tests "*ReportPdfGenerator*"
         */
        @Test
        @DisplayName("monthly-static.html 클래스패스 로드 → PDF (헤더 %PDF, length > 0) + dump 옵션")
        void staticTemplate_loadAndRender() throws Exception {
            // given - 클래스패스의 정적 HTML 템플릿 로드
            String html;
            try (InputStream is = getClass().getResourceAsStream(
                    "/templates/report/monthly-static.html")) {
                assertThat(is)
                        .as("monthly-static.html이 클래스패스에 있어야 함")
                        .isNotNull();
                html = new String(is.readAllBytes(), StandardCharsets.UTF_8);
            }

            // when
            byte[] pdf = generator.generate(html);

            // then
            assertThat(assertPdfHeader(pdf)).isEqualTo(PDF_HEADER);
            assertThat(pdf.length).isGreaterThan(0);

            // visual check — BALLIFE_PDF_DUMP=true 환경변수일 때만 파일로 저장
            String dumpFlag = System.getenv("BALLIFE_PDF_DUMP");
            if ("true".equalsIgnoreCase(dumpFlag)) {
                Path dir = Path.of("build/tmp/ballife-pdf-dump");
                Files.createDirectories(dir);
                Path file = dir.resolve("monthly-static.pdf");
                Files.write(file, pdf);
                System.out.println(
                        "[PDF DUMP] " + file.toAbsolutePath()
                        + "  (" + pdf.length + " bytes)");
            }
        }
    }
}