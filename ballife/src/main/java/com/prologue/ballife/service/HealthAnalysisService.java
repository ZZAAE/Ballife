package com.prologue.ballife.service;

import java.time.LocalDate;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.HashSet;
import java.util.List;
import java.util.Set;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.prologue.ballife.analyzer.BloodPressureAnalysisResult;
import com.prologue.ballife.analyzer.BloodPressureAnalyzer;
import com.prologue.ballife.analyzer.BloodSugarAnalysisResult;
import com.prologue.ballife.analyzer.BloodSugarAnalyzer;
import com.prologue.ballife.analyzer.BmiAnalysisResult;
import com.prologue.ballife.analyzer.BmiAnalyzer;
import com.prologue.ballife.analyzer.DiseaseProfileAnalysisResult;
import com.prologue.ballife.analyzer.DiseaseProfileAnalyzer;
import com.prologue.ballife.analyzer.MedicationAnalysisResult;
import com.prologue.ballife.analyzer.MedicationAnalyzer;
import com.prologue.ballife.domain.daily.BioValueRecord;
import com.prologue.ballife.domain.medicine.Prescription;
import com.prologue.ballife.domain.medicine.UserMedicineRecord;
import com.prologue.ballife.domain.user.User;
import com.prologue.ballife.exception.ResourceNotFoundException;
import com.prologue.ballife.repository.daily.BioValueRecordRepository;
import com.prologue.ballife.repository.medicine.PrescriptionRepository;
import com.prologue.ballife.repository.medicine.UserMedicineRecordRepository;
import com.prologue.ballife.repository.user.UserRepository;
import com.prologue.ballife.web.analysis.dto.HealthAnalysisResponse;

/**
 * 주간(최근 7일) 건강 분석 서비스.
 *
 * 처리 순서:
 * 1. userId → User 조회 (없으면 ResourceNotFoundException)
 * 2. 분석 기간 계산: endDate = 오늘, startDate = 오늘 - 6일 (오늘 포함 7일)
 * 3. 측정 기록 조회 & 분류:
 *    - 혈압: BioValueRecord category "BloodPressure"% prefix → systolic/diastolic 리스트
 *    - 혈당: BioValueRecord category "BloodSugar"% prefix → 카테고리 접미사로 fasting/preMeal/postMeal 분류
 *           ("BloodSugar-취침전"은 분석 제외)
 *    - 체중·키는 User 엔티티에서 직접 (BMI는 최근 7일 측정값이 아니라 회원 정보 기준)
 * 4. 복약 분석:
 *    - 활성 Prescription 리스트 → intakeIntervals 콤마 split → TakenCategory 매칭 토큰 수 × 7일 = scheduledCount
 *    - 최근 7일 UserMedicineRecord 행 수 = takenCount
 * 5. 보유 질환: User.diseaseIndex 문자열 그대로 DiseaseProfileAnalyzer에 전달
 * 6. 모든 결과를 HealthAnalysisResponse로 묶어 반환
 */
@Service
@Transactional(readOnly = true)
public class HealthAnalysisService {

    private static final int PERIOD_DAYS = 7;
    private static final String PERIOD_TYPE_WEEKLY = "WEEKLY";

    // BioValueRecord.category 의 prefix
    private static final String CAT_BLOOD_PRESSURE = "BloodPressure";
    private static final String CAT_BLOOD_SUGAR    = "BloodSugar";

    // 혈당 카테고리 접미사 (BloodSugar- 뒤)
    private static final String BS_SUFFIX_FASTING  = "공복";
    private static final String BS_SUFFIX_BEDTIME  = "취침전"; // 분석 제외
    private static final String BS_SUFFIX_POSTMEAL_TAIL = "식후";
    private static final String BS_SUFFIX_PREMEAL_TAIL  = "식전";

    // TakenCategory enum 이름들 (intakeIntervals 파싱용)
    private static final Set<String> TAKEN_CATEGORY_NAMES = new HashSet<>(Arrays.asList(
            UserMedicineRecord.TakenCategory.MORNING.name(),
            UserMedicineRecord.TakenCategory.LUNCH.name(),
            UserMedicineRecord.TakenCategory.DINNER.name(),
            UserMedicineRecord.TakenCategory.BEDTIME.name(),
            UserMedicineRecord.TakenCategory.FASTING.name()
    ));

    private final UserRepository userRepository;
    private final BioValueRecordRepository bioValueRecordRepository;
    private final PrescriptionRepository prescriptionRepository;
    private final UserMedicineRecordRepository userMedicineRecordRepository;

    private final BloodPressureAnalyzer  bloodPressureAnalyzer;
    private final BloodSugarAnalyzer     bloodSugarAnalyzer;
    private final BmiAnalyzer            bmiAnalyzer;
    private final MedicationAnalyzer     medicationAnalyzer;
    private final DiseaseProfileAnalyzer diseaseProfileAnalyzer;

    public HealthAnalysisService(
            UserRepository userRepository,
            BioValueRecordRepository bioValueRecordRepository,
            PrescriptionRepository prescriptionRepository,
            UserMedicineRecordRepository userMedicineRecordRepository,
            BloodPressureAnalyzer bloodPressureAnalyzer,
            BloodSugarAnalyzer bloodSugarAnalyzer,
            BmiAnalyzer bmiAnalyzer,
            MedicationAnalyzer medicationAnalyzer,
            DiseaseProfileAnalyzer diseaseProfileAnalyzer) {
        this.userRepository = userRepository;
        this.bioValueRecordRepository = bioValueRecordRepository;
        this.prescriptionRepository = prescriptionRepository;
        this.userMedicineRecordRepository = userMedicineRecordRepository;
        this.bloodPressureAnalyzer = bloodPressureAnalyzer;
        this.bloodSugarAnalyzer = bloodSugarAnalyzer;
        this.bmiAnalyzer = bmiAnalyzer;
        this.medicationAnalyzer = medicationAnalyzer;
        this.diseaseProfileAnalyzer = diseaseProfileAnalyzer;
    }

    /** 주간(최근 7일) 건강 분석. */
    public HealthAnalysisResponse analyzeWeekly(Long userId) {
        // 1. User 조회
        User user = userRepository.findByUserId(userId)
                .orElseThrow(() -> new ResourceNotFoundException("회원", userId));

        // 2. 분석 기간 계산
        LocalDate endDate = LocalDate.now();
        LocalDate startDate = endDate.minusDays(PERIOD_DAYS - 1);
        HealthAnalysisResponse.Period period =
                new HealthAnalysisResponse.Period(PERIOD_TYPE_WEEKLY, startDate, endDate);

        // 3-1. 혈압 분석
        BloodPressureAnalysisResult bpResult = analyzeBloodPressure(user, startDate, endDate);

        // 3-2. 혈당 분석 (3그룹 분류)
        BloodSugarAnalysisResult bsResult = analyzeBloodSugar(user, startDate, endDate);

        // 3-3. BMI 분석 (회원 정보의 키·몸무게 기준)
        BmiAnalysisResult bmiResult = bmiAnalyzer.analyze(user.getHeight(), user.getWeight());

        // 3-4. 복약 분석
        MedicationAnalysisResult medResult = analyzeMedication(userId, startDate, endDate);

        // 3-5. 보유 질환 분석
        DiseaseProfileAnalysisResult diseaseResult =
                diseaseProfileAnalyzer.analyze(user.getDiseaseIndex());

        // 4. 응답 조립
        return new HealthAnalysisResponse(
                userId,
                period,
                bpResult,
                bsResult,
                bmiResult,
                medResult,
                diseaseResult
        );
    }

    // ─────────────────────────── 혈압 ───────────────────────────

    private BloodPressureAnalysisResult analyzeBloodPressure(
            User user, LocalDate startDate, LocalDate endDate) {

        List<BioValueRecord> records = bioValueRecordRepository
                .findByUserAndCategoryAndRecordDateBetween(user, CAT_BLOOD_PRESSURE, startDate, endDate);

        List<Integer> systolic  = new ArrayList<>();
        List<Integer> diastolic = new ArrayList<>();
        for (BioValueRecord r : records) {
            if (r.getSystolicBP()  != null) systolic.add(r.getSystolicBP());
            if (r.getDiastolicBP() != null) diastolic.add(r.getDiastolicBP());
        }
        return bloodPressureAnalyzer.analyze(systolic, diastolic);
    }

    // ─────────────────────────── 혈당 ───────────────────────────

    /**
     * 혈당 기록을 카테고리 접미사로 3그룹 분류:
     *   - "BloodSugar-공복"              → fasting
     *   - "BloodSugar-{끼니}식전" (3종)  → preMeal
     *   - "BloodSugar-{끼니}식후" (3종)  → postMeal
     *   - "BloodSugar-취침전"            → 분석 제외
     */
    private BloodSugarAnalysisResult analyzeBloodSugar(
            User user, LocalDate startDate, LocalDate endDate) {

        List<BioValueRecord> records = bioValueRecordRepository
                .findByUserAndCategoryAndRecordDateBetween(user, CAT_BLOOD_SUGAR, startDate, endDate);

        List<Integer> fasting  = new ArrayList<>();
        List<Integer> preMeal  = new ArrayList<>();
        List<Integer> postMeal = new ArrayList<>();

        for (BioValueRecord r : records) {
            Integer value = r.getBloodSugar();
            if (value == null) continue;

            String category = r.getCategory(); // 예: "BloodSugar-아침식전"
            String suffix = extractSuffix(category); // "아침식전" or "공복" or null

            if (suffix == null) continue;

            if (BS_SUFFIX_FASTING.equals(suffix)) {
                fasting.add(value);
            } else if (BS_SUFFIX_BEDTIME.equals(suffix)) {
                // 취침전은 분석 제외
                continue;
            } else if (suffix.endsWith(BS_SUFFIX_POSTMEAL_TAIL)) {
                postMeal.add(value);
            } else if (suffix.endsWith(BS_SUFFIX_PREMEAL_TAIL)) {
                preMeal.add(value);
            }
            // 그 외 형식이면 무시
        }

        return bloodSugarAnalyzer.analyze(fasting, preMeal, postMeal);
    }

    /**
     * "BloodSugar-아침식전" → "아침식전"
     * "BloodSugar"          → null
     * null                   → null
     */
    private String extractSuffix(String category) {
        if (category == null) return null;
        int idx = category.indexOf('-');
        if (idx < 0 || idx == category.length() - 1) return null;
        return category.substring(idx + 1);
    }

    // ─────────────────────────── 복약 ───────────────────────────

    /**
     * scheduledCount = 활성 처방의 intakeIntervals 토큰 합 × 7일
     * takenCount     = 최근 7일간 UserMedicineRecord 행 수
     */
    private MedicationAnalysisResult analyzeMedication(
            Long userId, LocalDate startDate, LocalDate endDate) {

        // 활성 처방의 일일 복약 횟수 합산
        List<Prescription> activePrescriptions =
                prescriptionRepository.findByUser_UserIdAndIsDeletedFalse(userId);

        int dailyDoses = 0;
        for (Prescription p : activePrescriptions) {
            dailyDoses += countDailyDoses(p.getIntakeIntervals());
        }
        int scheduledCount = dailyDoses * PERIOD_DAYS;

        // 실제 복용 횟수
        long taken = userMedicineRecordRepository
                .countByPrescription_User_UserIdAndIntakeDateBetween(userId, startDate, endDate);
        int takenCount = (int) Math.min(taken, Integer.MAX_VALUE);

        return medicationAnalyzer.analyze(scheduledCount, takenCount);
    }

    /**
     * intakeIntervals 문자열 → 일일 복약 횟수.
     * 콤마(,) 구분, 각 토큰을 trim + uppercase 후 TakenCategory enum 이름과 매칭.
     * 매칭 안 되는 토큰은 무시(예외 안 던짐).
     * null/공백이면 0 반환.
     */
    private int countDailyDoses(String intakeIntervals) {
        if (intakeIntervals == null || intakeIntervals.isBlank()) return 0;

        String[] tokens = intakeIntervals.split(",");
        int count = 0;
        for (String t : tokens) {
            String normalized = t.trim().toUpperCase();
            if (TAKEN_CATEGORY_NAMES.contains(normalized)) {
                count++;
            }
        }
        return count;
    }
}