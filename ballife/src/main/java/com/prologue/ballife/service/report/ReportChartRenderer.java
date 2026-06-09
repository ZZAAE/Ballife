package com.prologue.ballife.service.report;

import java.awt.BasicStroke;
import java.awt.Color;
import java.awt.Font;
import java.awt.Graphics2D;
import java.awt.RenderingHints;
import java.awt.geom.Ellipse2D;
import java.awt.image.BufferedImage;
import java.io.ByteArrayOutputStream;
import java.io.InputStream;
import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.time.temporal.ChronoUnit;
import java.util.ArrayList;
import java.util.Base64;
import java.util.List;

import javax.imageio.ImageIO;

import org.springframework.core.io.ClassPathResource;
import org.springframework.stereotype.Component;

import com.prologue.ballife.analyzer.BloodPressureAnalysisResult;
import com.prologue.ballife.analyzer.BloodPressureDaily;
import com.prologue.ballife.analyzer.BloodSugarAnalysisResult;
import com.prologue.ballife.analyzer.DailyValue;
import com.prologue.ballife.config.MessageResolver;

import org.springframework.context.i18n.LocaleContextHolder;

import lombok.extern.slf4j.Slf4j;

/**
 * 보고서용 시계열 라인 차트 렌더러.
 *
 * OpenHTMLtoPDF 는 JavaScript 를 실행하지 않으므로 Chart.js 류를 쓸 수 없다.
 * 대신 서버에서 Java2D 로 PNG 라인 차트를 그려 base64 data URI 로 반환하고,
 * 템플릿이 {@code <img th:src="${...}">} 로 임베드한다. (추가 의존성 없음)
 *
 * 정책:
 *   - 측정 데이터가 한 점도 없으면 빈 문자열("") 반환 → 템플릿이 차트 숨김 (표는 그대로 노출)
 *   - 렌더링 중 어떤 예외가 나도 "" 반환 → 차트 하나가 보고서 전체(500)를 막지 않는다
 *   - 한글 라벨(수축기/이완기/공복/식전/식후)은 보고서와 동일한 Noto Sans KR 로 그린다
 */
@Slf4j
@Component
public class ReportChartRenderer {

    private static final int W = 1000;
    private static final int H = 340;
    private static final int PAD_LEFT   = 64;
    private static final int PAD_RIGHT  = 20;
    private static final int PAD_TOP    = 46; // 범례 + 단위
    private static final int PAD_BOTTOM = 44; // 날짜 라벨

    private static final Color BG   = Color.WHITE;
    private static final Color AXIS = new Color(0xCB, 0xD5, 0xE1);
    private static final Color GRID = new Color(0xEC, 0xF0, 0xF4);
    private static final Color TEXT = new Color(0x64, 0x74, 0x8B);

    // 혈압
    private static final Color C_SYS = new Color(0xDC, 0x26, 0x26); // 수축기 — 빨강 (표 max-cell 과 동일)
    private static final Color C_DIA = new Color(0x25, 0x63, 0xEB); // 이완기 — 파랑
    // 혈당
    private static final Color C_FAST = new Color(0x0D, 0x94, 0x88); // 공복 — 청록(브랜드)
    private static final Color C_PRE  = new Color(0x6D, 0x28, 0xD9); // 식전 — 보라
    private static final Color C_POST = new Color(0xEA, 0x58, 0x0C); // 식후 — 주황

    private static final DateTimeFormatter X_FMT = DateTimeFormatter.ofPattern("M/d");

    private final Font fontBase;     // Noto Sans KR (ko/en 및 기본)
    private final Font fontScBase;   // Noto Sans SC (간체 중국어 범례용, 없으면 fontBase 로 폴백)
    private final Font fontJpBase;   // Noto Sans JP (일본어 범례/한자 자형용, 없으면 fontBase 로 폴백)
    private final MessageResolver messages;

    public ReportChartRenderer(MessageResolver messages) {
        this.messages = messages;
        this.fontBase = loadFont("/fonts/NotoSansKR-Regular.ttf");
        this.fontScBase = loadOptionalFont("/fonts/NotoSansSC-Regular.ttf", this.fontBase);
        this.fontJpBase = loadOptionalFont("/fonts/NotoSansJP-Regular.ttf", this.fontBase);
    }

    private Font loadFont(String classpath) {
        try (InputStream in = new ClassPathResource(classpath).getInputStream()) {
            return Font.createFont(Font.TRUETYPE_FONT, in);
        } catch (Exception e) {
            log.warn("차트 폰트 로드 실패 → 기본 폰트 사용: {}", e.getMessage());
            return new Font(Font.SANS_SERIF, Font.PLAIN, 12);
        }
    }

    /** 선택적 폰트 — 없으면 fallback 폰트를 그대로 사용. */
    private Font loadOptionalFont(String classpath, Font fallback) {
        if (!new ClassPathResource(classpath).exists()) return fallback;
        return loadFont(classpath);
    }

    /** 요청 로케일별 범례 폰트: 일본어→JP, 간체 중국어→SC, 그 외→KR. (범례 글리프 깨짐/자형 보정) */
    private Font baseFontForLocale() {
        String lang = LocaleContextHolder.getLocale().getLanguage();
        if ("ja".equals(lang)) return fontJpBase;
        if ("zh".equals(lang)) return fontScBase;
        return fontBase;
    }

    // ─────────────────────────── public API ───────────────────────────

    /** 혈압 일별 추이(수축기/이완기) 라인 차트. 데이터 없으면 "". */
    public String bloodPressureChart(BloodPressureAnalysisResult bp, LocalDate start, LocalDate end) {
        if (bp == null) return "";
        List<Series> series = new ArrayList<>();
        series.add(bpSeries(bp.dailyRecords(), true,  messages.get("report.chart.systolic"), C_SYS));
        series.add(bpSeries(bp.dailyRecords(), false, messages.get("report.chart.diastolic"), C_DIA));
        return render(series, start, end, "mmHg");
    }

    /** 혈당 일별 추이(공복/식전/식후) 라인 차트. 데이터 없으면 "". */
    public String bloodSugarChart(BloodSugarAnalysisResult bs, LocalDate start, LocalDate end) {
        if (bs == null) return "";
        List<Series> series = new ArrayList<>();
        series.add(dvSeries(bs.dailyFasting(),  messages.get("report.chart.fasting"), C_FAST));
        series.add(dvSeries(bs.dailyPreMeal(),  messages.get("report.chart.preMeal"), C_PRE));
        series.add(dvSeries(bs.dailyPostMeal(), messages.get("report.chart.postMeal"), C_POST));
        return render(series, start, end, "mg/dL");
    }

    // ─────────────────────────── series 변환 ───────────────────────────

    private Series bpSeries(List<BloodPressureDaily> daily, boolean systolic, String label, Color color) {
        Series s = new Series(label, color);
        if (daily != null) {
            for (BloodPressureDaily d : daily) {
                Double v = systolic ? d.systolic() : d.diastolic();
                if (d.date() != null && v != null) s.points.add(new Pt(d.date(), v));
            }
        }
        return s;
    }

    private Series dvSeries(List<DailyValue> daily, String label, Color color) {
        Series s = new Series(label, color);
        if (daily != null) {
            for (DailyValue d : daily) {
                if (d.date() != null && d.value() != null) s.points.add(new Pt(d.date(), d.value()));
            }
        }
        return s;
    }

    // ─────────────────────────── 렌더링 ───────────────────────────

    private String render(List<Series> series, LocalDate start, LocalDate end, String unit) {
        try {
            int total = series.stream().mapToInt(s -> s.points.size()).sum();
            if (total == 0 || start == null || end == null) return "";

            // 값 축 범위 (10단위 nice bounds)
            double min = Double.MAX_VALUE, max = -Double.MAX_VALUE;
            for (Series s : series) {
                for (Pt p : s.points) { min = Math.min(min, p.value); max = Math.max(max, p.value); }
            }
            if (min == max) { min -= 10; max += 10; }
            double pad = (max - min) * 0.12;
            double yMin = Math.floor((min - pad) / 10.0) * 10.0;
            double yMax = Math.ceil((max + pad) / 10.0) * 10.0;
            if (yMin < 0) yMin = 0;
            if (yMax <= yMin) yMax = yMin + 10;

            BufferedImage img = new BufferedImage(W, H, BufferedImage.TYPE_INT_ARGB);
            Graphics2D g = img.createGraphics();
            g.setRenderingHint(RenderingHints.KEY_ANTIALIASING, RenderingHints.VALUE_ANTIALIAS_ON);
            g.setRenderingHint(RenderingHints.KEY_TEXT_ANTIALIASING, RenderingHints.VALUE_TEXT_ANTIALIAS_ON);
            g.setRenderingHint(RenderingHints.KEY_STROKE_CONTROL, RenderingHints.VALUE_STROKE_PURE);

            g.setColor(BG);
            g.fillRect(0, 0, W, H);

            final int plotL = PAD_LEFT, plotR = W - PAD_RIGHT;
            final int plotT = PAD_TOP,  plotB = H - PAD_BOTTOM;
            final int plotW = plotR - plotL, plotH = plotB - plotT;

            final Font base    = baseFontForLocale();
            final Font fAxis   = base.deriveFont(Font.PLAIN, 15f);
            final Font fLegend = base.deriveFont(Font.PLAIN, 16f);
            final Font fUnit   = base.deriveFont(Font.PLAIN, 13f);

            // y 격자 + 값 라벨
            final int ticks = 4;
            g.setFont(fAxis);
            for (int i = 0; i <= ticks; i++) {
                double val = yMin + (yMax - yMin) * i / ticks;
                int y = (int) Math.round(plotB - plotH * (double) i / ticks);
                g.setColor(GRID);
                g.drawLine(plotL, y, plotR, y);
                g.setColor(TEXT);
                String lbl = String.valueOf((int) Math.round(val));
                int lw = g.getFontMetrics().stringWidth(lbl);
                g.drawString(lbl, plotL - 10 - lw, y + 5);
            }

            // 단위 (좌상단)
            g.setFont(fUnit);
            g.setColor(TEXT);
            g.drawString(unit, 8, 18);

            // x 날짜 라벨
            long totalDays = ChronoUnit.DAYS.between(start, end);
            if (totalDays < 1) totalDays = 1;
            g.setFont(fAxis);
            final int xLabels = 5;
            for (int i = 0; i <= xLabels; i++) {
                long dayOff = Math.round((double) totalDays * i / xLabels);
                LocalDate d = start.plusDays(dayOff);
                int x = (int) Math.round(plotL + plotW * (double) dayOff / totalDays);
                g.setColor(TEXT);
                String lbl = d.format(X_FMT);
                int lw = g.getFontMetrics().stringWidth(lbl);
                g.drawString(lbl, x - lw / 2, plotB + 22);
            }

            // 축선
            g.setColor(AXIS);
            g.drawLine(plotL, plotT, plotL, plotB);
            g.drawLine(plotL, plotB, plotR, plotB);

            // 각 시리즈 (라인 + 점)
            for (Series s : series) {
                if (s.points.isEmpty()) continue;
                int n = s.points.size();
                int[] xs = new int[n];
                int[] ys = new int[n];
                for (int i = 0; i < n; i++) {
                    Pt p = s.points.get(i);
                    long off = ChronoUnit.DAYS.between(start, p.date);
                    off = Math.max(0, Math.min(totalDays, off));
                    xs[i] = (int) Math.round(plotL + plotW * (double) off / totalDays);
                    ys[i] = (int) Math.round(plotB - plotH * (p.value - yMin) / (yMax - yMin));
                }
                g.setColor(s.color);
                g.setStroke(new BasicStroke(2.2f, BasicStroke.CAP_ROUND, BasicStroke.JOIN_ROUND));
                if (n >= 2) g.drawPolyline(xs, ys, n);
                for (int i = 0; i < n; i++) {
                    g.fill(new Ellipse2D.Double(xs[i] - 3.2, ys[i] - 3.2, 6.4, 6.4));
                }
            }

            // 범례 (상단)
            g.setFont(fLegend);
            int lx = plotL + 36;
            final int ly = 20;
            for (Series s : series) {
                if (s.points.isEmpty()) continue;
                g.setColor(s.color);
                g.fillRect(lx, ly - 11, 14, 14);
                g.setColor(TEXT);
                g.drawString(s.label, lx + 20, ly);
                lx += 20 + g.getFontMetrics().stringWidth(s.label) + 26;
            }

            g.dispose();

            ByteArrayOutputStream out = new ByteArrayOutputStream();
            ImageIO.write(img, "png", out);
            return "data:image/png;base64," + Base64.getEncoder().encodeToString(out.toByteArray());
        } catch (Exception e) {
            log.warn("차트 렌더링 실패 → 차트 생략: type={}, msg={}", e.getClass().getSimpleName(), e.getMessage());
            return "";
        }
    }

    // ─────────────────────────── 내부 자료구조 ───────────────────────────

    private static final class Series {
        final String label;
        final Color color;
        final List<Pt> points = new ArrayList<>();
        Series(String label, Color color) { this.label = label; this.color = color; }
    }

    private static final class Pt {
        final LocalDate date;
        final double value;
        Pt(LocalDate date, double value) { this.date = date; this.value = value; }
    }
}
