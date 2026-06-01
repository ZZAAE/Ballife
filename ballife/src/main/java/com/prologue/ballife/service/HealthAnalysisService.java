package com.prologue.ballife.service;

import java.time.LocalDate;
import java.time.Period;
import java.time.temporal.ChronoUnit;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.HashSet;
import java.util.List;
import java.util.Set;
import java.util.stream.Collectors;

import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

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
 * 건강 분석 서비스.
 *
 * 핵심 메서드: {@link #analyzeByPeriod(Long, LocalDate, LocalDate, String)}
 *   - 임의 기간(start~end) + 라벨(periodType)을 받아 분석 결과를 조립한다.
 *   - 검증: null / start>end / end가 미래 / 기간이 91일 이상 → 400 BadRequest
 *
 * wrapper 메서드 2개:
 *   - {@link #analyzeWeekly(Long)}  : 오늘 포함 7일,  type="WEEKLY"
 *   - {@link #analyzeMonthly(Long)} : 오늘 포함 30일, type="MONTHLY"
 *
 * 처리 순서 (analyzeByPeriod):
 * 1. (검증) 날짜 인자 유효성 검사
 * 2. userId → User 조회 (없으면 ResourceNotFoundException)
 * 3. 측정 기록 조회 & 분류:
 *    - 혈압: BioValueRecord category "BloodPressure"% prefix → systolic/diastolic 리스트
 *    - 혈당: BioValueRecord category "BloodSugar"% prefix → 카테고리 접미사로 fasting/preMeal/postMeal 분류
 *           ("BloodSugar-취침전"은 분석 제외)
 *    - 체중·키는 User 엔티티에서 직접 (BMI는 기간 측정값이 아니라 회원 정보 기준)
 * 4. 복약 분석:
 *    - 활성 Prescription 리스트 → intakeIntervals 콤마 split → TakenCategory 매칭 토큰 수 × (기간 일수) = scheduledCount
 *    - 기간 내 UserMedicineRecord 행 수 = takenCount
 * 5. 보유 질환: User.diseaseIndex 문자열 그대로 DiseaseProfileAnalyzer에 전달
 * 6. 모든 결과를 HealthAnalysisResponse로 묶어 반환
 */
@Service
@Transactional(readOnly = true)
public class HealthAnalysisService {

    private static final int PERIOD_DAYS_WEEKLY  = 7;
    private static final int PERIOD_DAYS_MONTHLY = 30;
    /** 의료 분석 의미 흐려짐 방지를 위한 최대 분석 기간(일수, 양 끝 포함). */
    private static final int PERIOD_MAX_DAYS     = 90;

    public  static final String PERIOD_TYPE_WEEKLY  = "WEEKLY";
    public  static final String PERIOD_TYPE_MONTHLY = "MONTHLY";
    public  static final String PERIOD_TYPE_CUSTOM  = "CUSTOM";

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

    // ============================================================
    //  wrapper 메서드 — 미리 정의된 기간으로 호출
    // ============================================================

    /** 주간(오늘 포함 7일) 건강 분석. */
    public HealthAnalysisResponse analyzeWeekly(Long userId) {
        LocalDate endDate = LocalDate.now();
        LocalDate startDate = endDate.minusDays(PERIOD_DAYS_WEEKLY - 1);
        return analyzeByPeriod(userId, startDate, endDate, PERIOD_TYPE_WEEKLY);
    }

    /** 월간(오늘 포함 30일) 건강 분석. */
    public HealthAnalysisResponse analyzeMonthly(Long userId) {
        LocalDate endDate = LocalDate.now();
        LocalDate startDate = endDate.minusDays(PERIOD_DAYS_MONTHLY - 1);
        return analyzeByPeriod(userId, startDate, endDate, PERIOD_TYPE_MONTHLY);
    }

    // ============================================================
    //  핵심 메서드 — 임의 기간 분석
    // ============================================================

    /**
     * 임의 기간 건강 분석.
     *
     * @param userId      대상 사용자 ID
     * @param startDate   분석 시작일 (포함)
     * @param endDate     분석 종료일 (포함)
     * @param periodType  응답의 Period.type 라벨 ("WEEKLY"/"MONTHLY"/"CUSTOM")
     * @throws ResponseStatusException 400 BadRequest 검증 실패 시
     * @throws ResourceNotFoundException 회원 없음
     */
    public HealthAnalysisResponse analyzeByPeriod(
            Long userId, LocalDate startDate, LocalDate endDate, String periodType) {

        // 1. 날짜 인자 검증
        validatePeriod(startDate, endDate);

        // 2. User 조회
        User user = userRepository.findByUserId(userId)
                .orElseThrow(() -> new ResourceNotFoundException("회원", userId));

        HealthAnalysisResponse.Period period =
                new HealthAnalysisResponse.Period(periodType, startDate, endDate);

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

        // 3-6. 보고서용 user 섹션 (이름/나이/성별/키/몸무게 + 간략 질환)
        HealthAnalysisResponse.User userSection = buildUserSection(user, diseaseResult);

        // 3-7. 측정 기록률 (보고서용)
        HealthAnalysisResponse.RecordingStats stats =
                buildRecordingStats(user, userId, startDate, endDate);

        // 4. 응답 조립
        return new HealthAnalysisResponse(
                userId,
                period,
                bpResult,
                bsResult,
                bmiResult,
                medResult,
                diseaseResult,
                userSection,
                stats
        );
    }

    // ─────────────────────────── 보고서용 user 섹션 ───────────────────────────

    /**
     * User 엔티티 + DiseaseProfileAnalysisResult 를 받아 보고서용 User record 빌드.
     *
     *  - User.username   → User.name (응답 JSON은 "name"으로 노출)
     *  - User.birthDate  → 오늘(LocalDate.now()) 기준 만나이
     *  - 질환은 챗봇용 풀스펙(diseaseProfile)에서 label/subtypeLabel만 골라 간략 요약
     */
    private HealthAnalysisResponse.User buildUserSection(
            User user, DiseaseProfileAnalysisResult diseaseResult) {

        Integer age = (user.getBirthDate() == null)
                ? null
                : Period.between(user.getBirthDate(), LocalDate.now()).getYears();

        List<HealthAnalysisResponse.DiseaseSummary> diseases =
                (diseaseResult == null || diseaseResult.diseases() == null)
                        ? List.of()
                        : diseaseResult.diseases().stream()
                                .map(d -> new HealthAnalysisResponse.DiseaseSummary(
                                        d.diseaseLabel(), d.subtypeLabel()))
                                .collect(Collectors.toList());

        return new HealthAnalysisResponse.User(
                user.getUsername(),
                age,
                user.getGender(),
                user.getHeight(),
                user.getWeight(),
                diseases
        );
    }

    // ─────────────────────────── 측정 기록률 ───────────────────────────

    /**
     * 기간 내 distinct 측정 날짜 수 / 기간 일수.
     * rate는 소수점 셋째 자리까지 (예: 23/30 → 0.767).
     * 기간 일수가 0인 비정상 케이스는 rate 0.0 (validate에서 걸러지므로 사실 발생 안 함).
     */
    private HealthAnalysisResponse.RecordingStats buildRecordingStats(
            User user, Long userId, LocalDate startDate, LocalDate endDate) {

        int periodDays = (int) (ChronoUnit.DAYS.between(startDate, endDate) + 1);

        long bpDays  = bioValueRecordRepository
                .countDistinctRecordDates(user, CAT_BLOOD_PRESSURE, startDate, endDate);
        long bsDays  = bioValueRecordRepository
                .countDistinctRecordDates(user, CAT_BLOOD_SUGAR, startDate, endDate);
        long medDays = userMedicineRecordRepository
                .countDistinctIntakeDates(userId, startDate, endDate);

        return new HealthAnalysisResponse.RecordingStats(
                (int) bpDays,
                (int) bsDays,
                (int) medDays,
                periodDays,
                round3(bpDays,  periodDays),
                round3(bsDays,  periodDays),
                round3(medDays, periodDays)
        );
    }

    /** numerator/denominator 비율을 소수점 셋째 자리에서 반올림 (denominator <= 0 이면 0.0). */
    private double round3(long numerator, int denominator) {
        if (denominator <= 0) return 0.0;
        double raw = (double) numerator / denominator;
        return Math.round(raw * 1000.0) / 1000.0;
    }

    /**
     * 날짜 인자 유효성 검증. 실패하면 {@link ResponseStatusException}(400)을 던진다.
     *
     * 규칙:
     *   - start, end 모두 not null
     *   - start ≤ end
     *   - end ≤ today
     *   - 기간 일수(end - start + 1) ≤ 90
     */
    private void validatePeriod(LocalDate startDate, LocalDate endDate) {
        if (startDate == null || endDate == null) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "기간이 누락되었습니다.");
        }
        if (startDate.isAfter(endDate)) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST,
                    "시작일이 종료일보다 늦습니다.");
        }
        if (endDate.isAfter(LocalDate.now())) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST,
                    "종료일이 미래입니다.");
        }
        long days = ChronoUnit.DAYS.between(startDate, endDate) + 1;
        if (days > PERIOD_MAX_DAYS) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST,
                    "분석 기간은 최대 " + PERIOD_MAX_DAYS + "일입니다.");
        }
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
     * scheduledCount = 활성 처방의 intakeIntervals 토큰 합 × (기간 일수)
     * takenCount     = 기간 내 UserMedicineRecord 행 수
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
        int periodDays = (int) (ChronoUnit.DAYS.between(startDate, endDate) + 1);
        int scheduledCount = dailyDoses * periodDays;

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