package com.prologue.ballife.service.report;

import static org.assertj.core.api.Assertions.assertThat;

import java.nio.charset.StandardCharsets;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

import org.apache.pdfbox.pdmodel.PDDocument;
import org.apache.pdfbox.text.PDFTextStripper;
import org.apache.pdfbox.text.TextPosition;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

/**
 * 다국어 PDF 폰트 폴백 검증 — DB 불필요.
 *
 * 한 PDF 안에 한국어(이름)와 간체 중국어(라벨)가 섞여 있을 때:
 *  - 한글은 Noto Sans KR 글리프로,
 *  - 간체 중국어 전용 글자(压/这/药 등 KR 폰트에 없는 글자)는 Noto Sans SC 폴백 글리프로
 * 렌더되는지(=두부 글자가 아닌지)를 임베드 폰트 기준으로 확인한다.
 */
class ReportPdfGeneratorCjkFontTest {

    @Test
    @DisplayName("간체 중국어는 SC 폰트, 한글은 KR 폰트로 임베드된다 (tofu 방지)")
    void simplifiedChinese_fallsBackToScFont() throws Exception {
        String html =
                "<html><head><meta charset=\"utf-8\"/><style>"
                + "body{font-family:'Noto Sans KR','Noto Sans SC',sans-serif;}"
                + "</style></head><body>"
                + "<p>김지수 혈압 血压 这 药</p>" // 김지수 혈압 血压 这 药
                + "</body></html>";

        byte[] pdf = new ReportPdfGenerator().generate(html);

        assertThat(pdf).isNotEmpty();
        assertThat(new String(pdf, 0, 4, StandardCharsets.ISO_8859_1)).isEqualTo("%PDF");

        Map<Integer, String> fontByCp = new HashMap<>();
        try (PDDocument doc = PDDocument.load(pdf)) {
            PDFTextStripper stripper = new PDFTextStripper() {
                @Override
                protected void writeString(String text, List<TextPosition> positions) {
                    for (TextPosition tp : positions) {
                        String u = tp.getUnicode();
                        if (u == null || u.isEmpty()) continue;
                        fontByCp.put(u.codePointAt(0), tp.getFont().getName());
                    }
                }
            };
            stripper.getText(doc);
        }

        String koFont = fontByCp.get(0xAE40); // 김 (Hangul)
        String zhYa  = fontByCp.get(0x538B);  // 压 (SC-only, absent in Noto Sans KR)
        String zhZhe = fontByCp.get(0x8FD9);  // 这

        assertThat(koFont).as("Hangul uses the KR font").isNotNull().containsIgnoringCase("KR");
        assertThat(zhYa).as("Simplified-Chinese 压 must render via SC fallback (not tofu)")
                .isNotNull().containsIgnoringCase("SC");
        assertThat(zhZhe).as("Simplified-Chinese 这 must render via SC fallback (not tofu)")
                .isNotNull().containsIgnoringCase("SC");
    }

    @Test
    @DisplayName("일본어 로케일 스택: 공유 한자는 JP 자형으로, 한글 이름은 KR 폴백")
    void japanesePrimary_usesJpFontForKanji() throws Exception {
        // 일본어 로케일에서 ReportService 가 만드는 스택과 동일 (JP 우선)
        String html =
                "<html><head><meta charset=\"utf-8\"/><style>"
                + "body{font-family:'Noto Sans JP','Noto Sans KR','Noto Sans SC',sans-serif;}"
                + "</style></head><body>"
                + "<p>김지수 血圧 です</p>" // Hangul name + shared kanji 血圧 + kana
                + "</body></html>";

        byte[] pdf = new ReportPdfGenerator().generate(html);
        assertThat(pdf).isNotEmpty();

        Map<Integer, String> fontByCp = new HashMap<>();
        try (PDDocument doc = PDDocument.load(pdf)) {
            PDFTextStripper stripper = new PDFTextStripper() {
                @Override
                protected void writeString(String text, List<TextPosition> positions) {
                    for (TextPosition tp : positions) {
                        String u = tp.getUnicode();
                        if (u == null || u.isEmpty()) continue;
                        fontByCp.put(u.codePointAt(0), tp.getFont().getName());
                    }
                }
            };
            stripper.getText(doc);
        }

        String kanji = fontByCp.get(0x8840); // 血 (shared CJK ideograph) → JP form when JP primary
        String kana  = fontByCp.get(0x3067); // で (hiragana)
        String hangul = fontByCp.get(0xAE40); // 김 → JP lacks Hangul → KR fallback

        assertThat(kanji).as("shared kanji renders with JP font (Japanese glyph forms)")
                .isNotNull().containsIgnoringCase("JP");
        assertThat(kana).as("kana renders with JP font").isNotNull().containsIgnoringCase("JP");
        assertThat(hangul).as("Hangul name falls back to KR font").isNotNull().containsIgnoringCase("KR");
    }

    @Test
    @DisplayName("중국어 로케일 스택: 공유 한자도 SC 자형으로, 한글 이름은 KR 폴백")
    void chinesePrimary_usesScFontForSharedHanzi() throws Exception {
        // 중국어(zh) 로케일에서 ReportService 가 만드는 스택과 동일 (SC 우선)
        String html =
                "<html><head><meta charset=\"utf-8\"/><style>"
                + "body{font-family:'Noto Sans SC','Noto Sans KR',sans-serif;}"
                + "</style></head><body>"
                + "<p>김지수 血压 体重</p>" // Hangul name + simplified label + shared ideographs 血/体/重
                + "</body></html>";

        byte[] pdf = new ReportPdfGenerator().generate(html);
        assertThat(pdf).isNotEmpty();

        Map<Integer, String> fontByCp = new HashMap<>();
        try (PDDocument doc = PDDocument.load(pdf)) {
            PDFTextStripper stripper = new PDFTextStripper() {
                @Override
                protected void writeString(String text, List<TextPosition> positions) {
                    for (TextPosition tp : positions) {
                        String u = tp.getUnicode();
                        if (u == null || u.isEmpty()) continue;
                        fontByCp.put(u.codePointAt(0), tp.getFont().getName());
                    }
                }
            };
            stripper.getText(doc);
        }

        String shared1 = fontByCp.get(0x8840); // 血 (shared CJK ideograph)
        String shared2 = fontByCp.get(0x4F53); // 体 (shared)
        String scOnly  = fontByCp.get(0x538B); // 压 (SC-only)
        String hangul  = fontByCp.get(0xAE40); // 김 → SC lacks Hangul → KR fallback

        assertThat(shared1).as("shared ideograph 血 renders with SC font (simplified glyph forms)")
                .isNotNull().containsIgnoringCase("SC");
        assertThat(shared2).as("shared ideograph 体 renders with SC font")
                .isNotNull().containsIgnoringCase("SC");
        assertThat(scOnly).as("SC-only 压 renders with SC font").isNotNull().containsIgnoringCase("SC");
        assertThat(hangul).as("Hangul name falls back to KR font").isNotNull().containsIgnoringCase("KR");
    }
}
