package com.prologue.ballife.service.report;

import java.io.ByteArrayOutputStream;
import java.io.IOException;

import org.springframework.core.io.ClassPathResource;
import org.springframework.stereotype.Component;

import com.openhtmltopdf.outputdevice.helper.BaseRendererBuilder;
import com.openhtmltopdf.pdfboxout.PdfRendererBuilder;

/**
 * HTML 문자열을 PDF 바이너리로 변환하는 헬퍼.
 *
 * - Step C 단계에서는 "변환 파이프라인 동작 확인" 만 검증한다.
 * - Step D에서 보고서 Thymeleaf 템플릿이 만들어지면, 그 결과 HTML 을
 *   이 컴포넌트의 {@link #generate(String)} 에 그대로 던지면 된다.
 *
 * 폰트:
 *   - Noto Sans KR Regular(400) / Bold(700)
 *   - src/main/resources/fonts/ 에서 클래스패스로 로드
 *   - HTML CSS에서 font-family: "Noto Sans KR" 로 지정하면 임베드됨
 *
 * 입력 HTML 은 XHTML 호환 형태 권장 (OpenHTMLtoPDF 가 strict XML 파싱).
 * 예) <br/>, <img ... />, 닫는 태그 명시.
 */
@Component
public class ReportPdfGenerator {

    private static final String FONT_FAMILY = "Noto Sans KR";
    private static final String FONT_REGULAR_PATH = "/fonts/NotoSansKR-Regular.ttf";
    private static final String FONT_BOLD_PATH    = "/fonts/NotoSansKR-Bold.ttf";

    /**
     * HTML 을 PDF byte[] 로 변환.
     *
     * @param html 완전한 (X)HTML 문자열
     * @return PDF 바이너리. {@code bytes[0..3] == "%PDF"} 로 시작.
     * @throws IllegalArgumentException html 이 null/blank
     * @throws RuntimeException 폰트 로드 / 렌더링 IO 오류
     */
    public byte[] generate(String html) {
        if (html == null || html.isBlank()) {
            throw new IllegalArgumentException("html은 null이거나 비어있을 수 없습니다.");
        }

        try (ByteArrayOutputStream out = new ByteArrayOutputStream()) {
            PdfRendererBuilder builder = new PdfRendererBuilder();
            builder.useFastMode();

            // 한글 폰트 등록 (Regular / Bold 분리해서 등록해야 font-weight: bold; 가 동작)
            registerFont(builder, FONT_REGULAR_PATH, 400);
            registerFont(builder, FONT_BOLD_PATH,    700);

            // HTML → PDF 변환
            builder.withHtmlContent(html, null);
            builder.toStream(out);
            builder.run();

            return out.toByteArray();
        } catch (IOException e) {
            throw new RuntimeException("PDF 생성 중 IO 오류", e);
        }
    }

    /**
     * 클래스패스의 ttf 파일을 PdfRendererBuilder 에 폰트로 등록.
     * - subset=true : 사용한 글자만 임베드 (PDF 크기 절감)
     */
    private void registerFont(PdfRendererBuilder builder, String classpath, int weight) {
        builder.useFont(
                () -> {
                    try {
                        return new ClassPathResource(classpath).getInputStream();
                    } catch (IOException e) {
                        throw new IllegalStateException("폰트 로드 실패: " + classpath, e);
                    }
                },
                FONT_FAMILY,
                weight,
                BaseRendererBuilder.FontStyle.NORMAL,
                true
        );
    }
}