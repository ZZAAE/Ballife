package com.prologue.ballife.service.meal;

import java.util.ArrayList;
import java.util.Base64;
import java.util.List;
import java.util.Optional;

import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import com.prologue.ballife.domain.food.FoodNutrition;
import com.prologue.ballife.web.dto.meal.MealAnalysisDto;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

/**
 * 음식 사진 분석 흐름 총괄.
 *  - VisionService 로 음식명/그램 추출
 *  - FoodNutritionService 로 영양성분 조회
 *  - 그램 비율로 환산 후 합산해서 응답 DTO 빌드
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class MealAnalysisService {

    private final VisionService visionService;
    private final FoodNutritionService nutritionService;

    public MealAnalysisDto.Response analyze(MultipartFile file) throws Exception {
        if (file == null || file.isEmpty()) {
            throw new IllegalArgumentException("이미지 파일이 비어 있습니다.");
        }

        log.info("======================== [식단 사진 분석 시작] ========================");
        log.info("파일명: {} / 크기: {} bytes / 타입: {}",
                file.getOriginalFilename(), file.getSize(), file.getContentType());

        String dataUrl = toDataUrl(file);
        List<VisionService.RecognizedFood> recognized = visionService.analyze(dataUrl);

        log.info("[Vision] 인식된 음식 수: {}", recognized.size());
        for (VisionService.RecognizedFood r : recognized) {
            log.info("  - 음식명: {} / 추정 그램: {}g", r.getName(), r.getGrams());
        }

        List<MealAnalysisDto.FoodItem> items = new ArrayList<>();
        List<String> unrecognized = new ArrayList<>();
        double totalKcal = 0, totalCarb = 0, totalProtein = 0, totalFat = 0, totalFiber = 0,
              totalSodium = 0, totalChol = 0, totalSatFat = 0, totalSugar = 0;

        for (VisionService.RecognizedFood r : recognized) {
            Optional<FoodNutrition> nut = nutritionService.lookup(r.getName());
            if (nut.isEmpty()) {
                log.warn("[영양정보 없음] '{}' → DB에서 매칭되는 영양성분을 찾지 못함", r.getName());
                unrecognized.add(r.getName());
                items.add(MealAnalysisDto.FoodItem.builder()
                        .name(r.getName())
                        .grams(r.getGrams())
                        .nutritionFound(false)
                        .build());
                continue;
            }
            FoodNutrition n = nut.get();
            double ratio = n.getServingSize() != null && n.getServingSize() > 0
                    ? r.getGrams() / n.getServingSize() : 1.0;

            double kcal = scaled(n.getCalories(), ratio);
            double carb = scaled(n.getCarbs(), ratio);
            double prot = scaled(n.getProtein(), ratio);
            double fat = scaled(n.getFat(), ratio);
            double fiber = scaled(n.getFiber(), ratio);
            double sodium = scaled(n.getSodium(), ratio);
            double chol = scaled(n.getCholesterol(), ratio);
            double satFat = scaled(n.getSaturatedFat(), ratio);
            double sugar = scaled(n.getSugar(), ratio);

            totalKcal += kcal;
            totalCarb += carb;
            totalProtein += prot;
            totalFat += fat;
            totalFiber += fiber;
            totalSodium += sodium;
            totalChol += chol;
            totalSatFat += satFat;
            totalSugar += sugar;

            items.add(MealAnalysisDto.FoodItem.builder()
                    .name(r.getName())
                    .grams(r.getGrams())
                    .calories(round1(kcal))
                    .carbs(round1(carb))
                    .protein(round1(prot))
                    .fat(round1(fat))
                    .fiber(round1(fiber))
                    .sodium(round1(sodium))
                    .cholesterol(round1(chol))
                    .saturatedFat(round1(satFat))
                    .sugar(round1(sugar))
                    .nutritionFound(true)
                    .build());

            log.info("---------------- [음식 등록] ----------------");
            log.info("음식명     : {} ({}g 기준)", r.getName(), r.getGrams());
            log.info("칼로리     : {} kcal", round1(kcal));
            log.info("탄수화물   : {} g", round1(carb));
            log.info("단백질     : {} g", round1(prot));
            log.info("지방       : {} g", round1(fat));
            log.info("식이섬유   : {} g", round1(fiber));
            log.info("나트륨     : {} mg", round1(sodium));
            log.info("콜레스테롤 : {} mg", round1(chol));
            log.info("포화지방   : {} g", round1(satFat));
            log.info("당류       : {} g", round1(sugar));
        }

        MealAnalysisDto.Totals totals = MealAnalysisDto.Totals.builder()
                .calories(round1(totalKcal))
                .carbs(round1(totalCarb))
                .protein(round1(totalProtein))
                .fat(round1(totalFat))
                .fiber(round1(totalFiber))
                .sodium(round1(totalSodium))
                .cholesterol(round1(totalChol))
                .saturatedFat(round1(totalSatFat))
                .sugar(round1(totalSugar))
                .build();

        log.info("================ [합계 (전체 음식 합산)] ================");
        log.info("총 칼로리   : {} kcal", totals.getCalories());
        log.info("총 탄수화물 : {} g", totals.getCarbs());
        log.info("총 단백질   : {} g", totals.getProtein());
        log.info("총 지방     : {} g", totals.getFat());
        log.info("총 식이섬유 : {} g", totals.getFiber());
        log.info("총 나트륨   : {} mg", totals.getSodium());
        log.info("총 콜레스테롤: {} mg", totals.getCholesterol());
        log.info("총 포화지방 : {} g", totals.getSaturatedFat());
        log.info("총 당류     : {} g", totals.getSugar());
        if (!unrecognized.isEmpty()) {
            log.warn("[영양정보 미발견 음식]: {}", unrecognized);
        }
        log.info("======================== [식단 사진 분석 종료] ========================");

        return MealAnalysisDto.Response.builder()
                .foods(items)
                .totals(totals)
                .unrecognized(unrecognized)
                .build();
    }

    private double scaled(Double base, double ratio) {
        return base == null ? 0.0 : base * ratio;
    }

    private double round1(double v) {
        return Math.round(v * 10.0) / 10.0;
    }

    private String toDataUrl(MultipartFile file) throws Exception {
        String mime = file.getContentType();
        if (mime == null || !mime.startsWith("image/")) mime = "image/jpeg";
        String base64 = Base64.getEncoder().encodeToString(file.getBytes());
        return "data:" + mime + ";base64," + base64;
    }
}
