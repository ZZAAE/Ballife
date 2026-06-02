package com.prologue.ballife.service;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyLong;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.when;

import java.time.LocalDate;
import java.time.LocalTime;
import java.util.List;
import java.util.Optional;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Nested;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.web.server.ResponseStatusException;

import com.prologue.ballife.analyzer.BloodPressureAnalyzer;
import com.prologue.ballife.analyzer.BloodSugarAnalyzer;
import com.prologue.ballife.analyzer.BmiAnalyzer;
import com.prologue.ballife.analyzer.DiseaseProfileAnalyzer;
import com.prologue.ballife.analyzer.MedicationAnalyzer;
import com.prologue.ballife.domain.daily.BioValueRecord;
import com.prologue.ballife.domain.medicine.Prescription;
import com.prologue.ballife.domain.user.User;
import com.prologue.ballife.exception.ResourceNotFoundException;
import com.prologue.ballife.repository.daily.BioValueRecordRepository;
import com.prologue.ballife.repository.medicine.PrescriptionRepository;
import com.prologue.ballife.repository.medicine.UserMedicineRecordRepository;
import com.prologue.ballife.repository.user.UserRepository;
import com.prologue.ballife.web.analysis.dto.HealthAnalysisResponse;

/**
 * HealthAnalysisService 단위 테스트.
 *
 * 전략:
 *  - Repository 4개는 Mock(@Mock) — DB 의존 제거
 *  - Analyzer 5개는 실제 객체 주입 — 이미 1·2순위 단위 테스트로 검증된 순수 컴포넌트라서
 *    mock하면 status/label 결과까지 stub해야 하고 Service의 데이터 분류·전달 로직이
 *    검증되지 않음. 실제 객체로 두면 입력만 조작해도 분류 + 라벨까지 End-to-End 검증 가능.
 *
 * 시나리오는 인계 문서 §9의 7개를 그대로 따른다.
 * intakeIntervals 케이스가 4 sub-case로 펼쳐져 총 11개 테스트.
 */
@ExtendWith(MockitoExtension.class)
class HealthAnalysisServiceTest {

    @Mock UserRepository userRepository;
    @Mock BioValueRecordRepository bioValueRecordRepository;
    @Mock PrescriptionRepository prescriptionRepository;
    @Mock UserMedicineRecordRepository userMedicineRecordRepository;

    HealthAnalysisService service;

    @BeforeEach
    void setUp() {
        // Analyzer 5개는 실제 @Component 객체로 주입 (mock 아님)
        service = new HealthAnalysisService(
                userRepository,
                bioValueRecordRepository,
                prescriptionRepository,
                userMedicineRecordRepository,
                new BloodPressureAnalyzer(),
                new BloodSugarAnalyzer(),
                new BmiAnalyzer(),
                new MedicationAnalyzer(),
                new DiseaseProfileAnalyzer()
        );
    }

    // ============================================================
    //  헬퍼 — 엔티티 생성 및 Repository stub
    // ============================================================
    private User stubUser(Long userId, Double heightCm, Double weightKg, String diseaseIndex) {
        User u = User.builder()
                .userId(userId)
                .height(heightCm)
                .weight(weightKg)
                .diseaseIndex(diseaseIndex)
                .build();
        when(userRepository.findByUserId(userId)).thenReturn(Optional.of(u));
        return u;
    }

    private BioValueRecord bpRecord(int systolic, int diastolic) {
        return BioValueRecord.builder()
                .category("BloodPressure")
                .systolicBP(systolic)
                .diastolicBP(diastolic)
                .recordDate(LocalDate.now())
                .recordTime(LocalTime.NOON)
                .build();
    }

    private BioValueRecord bsRecord(String suffix, int value) {
        return BioValueRecord.builder()
                .category("BloodSugar-" + suffix)
                .bloodSugar(value)
                .recordDate(LocalDate.now())
                .recordTime(LocalTime.NOON)
                .build();
    }

    private Prescription prescription(String intakeIntervals) {
        return Prescription.builder()
                .prescriptionName("test-약")
                .intakeIntervals(intakeIntervals)
                .isDeleted(false)
                .build();
    }

    // ============================================================
    //  A. 주간 분석 전체 시나리오
    // ============================================================
    @Nested
    @DisplayName("주간 분석 전체 시나리오 (AnalyzeWeekly_OverallScenarios)")
    class AnalyzeWeekly_OverallScenarios {

        @Test
        @DisplayName("시나리오 1: 모든 항목 NORMAL")
        void allNormal_allFieldsHealthy() {
            // given
            Long userId = 1L;
            stubUser(userId, 170.0, 65.0, "diabetes:type2"); // BMI = 22.49 → NORMAL

            when(bioValueRecordRepository.findByUserAndCategoryAndRecordDateBetween(
                    any(User.class), eq("BloodPressure"),
                    any(LocalDate.class), any(LocalDate.class)))
                .thenReturn(List.of(bpRecord(110, 70), bpRecord(115, 75))); // 평균 113/73 → G0

            when(bioValueRecordRepository.findByUserAndCategoryAndRecordDateBetween(
                    any(User.class), eq("BloodSugar"),
                    any(LocalDate.class), any(LocalDate.class)))
                .thenReturn(List.of(bsRecord("공복", 85), bsRecord("공복", 90))); // 평균 88 → NORMAL

            when(prescriptionRepository.findByUser_UserIdAndIsDeletedFalse(userId))
                .thenReturn(List.of(prescription("MORNING,DINNER,BEDTIME"))); // 3/day × 7 = 21

            when(userMedicineRecordRepository.countByPrescription_User_UserIdAndIntakeDateBetween(
                    anyLong(), any(LocalDate.class), any(LocalDate.class)))
                .thenReturn(21L); // 21/21 = 100% → NORMAL

            // when
            HealthAnalysisResponse res = service.analyzeWeekly(userId);

            // then
            assertThat(res.bloodPressure().status()).isEqualTo("NORMAL");
            assertThat(res.bloodSugar().fastingStatus()).isEqualTo("NORMAL");
            assertThat(res.bmi().status()).isEqualTo("NORMAL");
            assertThat(res.medication().status()).isEqualTo("NORMAL");
            assertThat(res.diseaseProfile().diseases()).hasSize(1);
        }

        @Test
        @DisplayName("시나리오 2: 공복혈당만 RISK, 식전·식후·혈압·BMI·복약은 모두 NORMAL")
        void onlyFastingBloodSugarRisk_otherFieldsNormal() {
            Long userId = 1L;
            stubUser(userId, 170.0, 65.0, "diabetes:type2");

            when(bioValueRecordRepository.findByUserAndCategoryAndRecordDateBetween(
                    any(User.class), eq("BloodPressure"),
                    any(LocalDate.class), any(LocalDate.class)))
                .thenReturn(List.of(bpRecord(110, 70), bpRecord(115, 75)));

            // 공복=130(RISK), 식전=90(NORMAL), 식후=120(NORMAL) — 한 그룹만 RISK, 분리 검증 핵심
            when(bioValueRecordRepository.findByUserAndCategoryAndRecordDateBetween(
                    any(User.class), eq("BloodSugar"),
                    any(LocalDate.class), any(LocalDate.class)))
                .thenReturn(List.of(
                        bsRecord("공복",     130),
                        bsRecord("아침식전",  90),
                        bsRecord("아침식후", 120)
                ));

            when(prescriptionRepository.findByUser_UserIdAndIsDeletedFalse(userId))
                .thenReturn(List.of(prescription("MORNING,DINNER,BEDTIME")));

            when(userMedicineRecordRepository.countByPrescription_User_UserIdAndIntakeDateBetween(
                    anyLong(), any(LocalDate.class), any(LocalDate.class)))
                .thenReturn(21L);

            HealthAnalysisResponse res = service.analyzeWeekly(userId);

            // 공복혈당만 RISK
            assertThat(res.bloodSugar().fastingValue()).isEqualTo(130);
            assertThat(res.bloodSugar().fastingStatus()).isEqualTo("RISK");
            assertThat(res.bloodSugar().fastingLabel()).isEqualTo("많이 높음 (126 이상)");

            // 식전·식후 NORMAL — RISK가 다른 그룹으로 새지 않는지 검증
            assertThat(res.bloodSugar().preMealValue()).isEqualTo(90);
            assertThat(res.bloodSugar().preMealStatus()).isEqualTo("NORMAL");
            assertThat(res.bloodSugar().postMealValue()).isEqualTo(120);
            assertThat(res.bloodSugar().postMealStatus()).isEqualTo("NORMAL");

            // 다른 항목 NORMAL 유지
            assertThat(res.bloodPressure().status()).isEqualTo("NORMAL");
            assertThat(res.bmi().status()).isEqualTo("NORMAL");
            assertThat(res.medication().status()).isEqualTo("NORMAL");
        }

        @Test
        @DisplayName("시나리오 3: 측정 0건 → 혈압·혈당·복약 내부 필드 null (BMI는 user 정보 기반이라 별개)")
        void noRecordsAtAll_bpAndSugarAndMedFieldsNull() {
            Long userId = 1L;
            stubUser(userId, 170.0, 65.0, "diabetes:type2");

            when(bioValueRecordRepository.findByUserAndCategoryAndRecordDateBetween(
                    any(User.class), any(String.class),
                    any(LocalDate.class), any(LocalDate.class)))
                .thenReturn(List.of());

            when(prescriptionRepository.findByUser_UserIdAndIsDeletedFalse(userId))
                .thenReturn(List.of());

            when(userMedicineRecordRepository.countByPrescription_User_UserIdAndIntakeDateBetween(
                    anyLong(), any(LocalDate.class), any(LocalDate.class)))
                .thenReturn(0L);

            HealthAnalysisResponse res = service.analyzeWeekly(userId);

            // 혈압 5필드 전부 null
            assertThat(res.bloodPressure().avgSystolic()).isNull();
            assertThat(res.bloodPressure().avgDiastolic()).isNull();
            assertThat(res.bloodPressure().grade()).isNull();
            assertThat(res.bloodPressure().status()).isNull();
            assertThat(res.bloodPressure().label()).isNull();

            // 혈당 9필드 전부 null
            assertThat(res.bloodSugar().fastingValue()).isNull();
            assertThat(res.bloodSugar().fastingStatus()).isNull();
            assertThat(res.bloodSugar().fastingLabel()).isNull();
            assertThat(res.bloodSugar().preMealValue()).isNull();
            assertThat(res.bloodSugar().preMealStatus()).isNull();
            assertThat(res.bloodSugar().preMealLabel()).isNull();
            assertThat(res.bloodSugar().postMealValue()).isNull();
            assertThat(res.bloodSugar().postMealStatus()).isNull();
            assertThat(res.bloodSugar().postMealLabel()).isNull();

            // 복약: 처방 없음 → scheduled=0 → adherenceRate/status/label null (analyzer 내부 분기)
            assertThat(res.medication().scheduledCount()).isEqualTo(0);
            assertThat(res.medication().takenCount()).isEqualTo(0);
            assertThat(res.medication().adherenceRate()).isNull();
            assertThat(res.medication().status()).isNull();
            assertThat(res.medication().label()).isNull();

            // BMI는 측정 기록이 아니라 user 엔티티의 키·몸무게 기반이라 측정 0건과 무관
            assertThat(res.bmi().status()).isEqualTo("NORMAL");
        }
    }

    // ============================================================
    //  B. 혈당 카테고리 그룹 분리
    // ============================================================
    @Nested
    @DisplayName("혈당 카테고리 그룹 분리 (BloodSugarGrouping)")
    class BloodSugarGrouping {

        @Test
        @DisplayName("시나리오 4: 식전만 있고 공복 없음 → fastingValue=null, preMealValue=값")
        void preMealOnly_fastingNull_preMealHasValue() {
            Long userId = 1L;
            stubUser(userId, 170.0, 65.0, null);

            // 혈압은 빈 리스트 명시 (strict stubbing: 같은 메서드 다른 카테고리 호출에 대한 의도 표명)
            when(bioValueRecordRepository.findByUserAndCategoryAndRecordDateBetween(
                    any(User.class), eq("BloodPressure"),
                    any(LocalDate.class), any(LocalDate.class)))
                .thenReturn(List.of());

            // 혈당 카테고리에는 식전만 1건
            when(bioValueRecordRepository.findByUserAndCategoryAndRecordDateBetween(
                    any(User.class), eq("BloodSugar"),
                    any(LocalDate.class), any(LocalDate.class)))
                .thenReturn(List.of(bsRecord("아침식전", 90)));

            // Prescription / 복약 카운트는 stub 안 함 → mock 기본값(빈 컬렉션, 0L) 반환

            HealthAnalysisResponse res = service.analyzeWeekly(userId);

            // fasting 3필드 null
            assertThat(res.bloodSugar().fastingValue()).isNull();
            assertThat(res.bloodSugar().fastingStatus()).isNull();
            assertThat(res.bloodSugar().fastingLabel()).isNull();

            // preMeal 3필드 채워짐 (공복 기준 재사용)
            assertThat(res.bloodSugar().preMealValue()).isEqualTo(90);
            assertThat(res.bloodSugar().preMealStatus()).isEqualTo("NORMAL");
            assertThat(res.bloodSugar().preMealLabel()).isEqualTo("정상 (70-99)");

            // postMeal 3필드 null
            assertThat(res.bloodSugar().postMealValue()).isNull();
            assertThat(res.bloodSugar().postMealStatus()).isNull();
            assertThat(res.bloodSugar().postMealLabel()).isNull();
        }

        @Test
        @DisplayName("시나리오 5: 취침전만 1건 → 분석 제외, 9필드 모두 null")
        void bedtimeOnly_allBloodSugarFieldsNull() {
            Long userId = 1L;
            stubUser(userId, 170.0, 65.0, null);

            // 혈압은 빈 리스트 명시 (strict stubbing 충돌 회피)
            when(bioValueRecordRepository.findByUserAndCategoryAndRecordDateBetween(
                    any(User.class), eq("BloodPressure"),
                    any(LocalDate.class), any(LocalDate.class)))
                .thenReturn(List.of());

            when(bioValueRecordRepository.findByUserAndCategoryAndRecordDateBetween(
                    any(User.class), eq("BloodSugar"),
                    any(LocalDate.class), any(LocalDate.class)))
                .thenReturn(List.of(bsRecord("취침전", 130)));

            HealthAnalysisResponse res = service.analyzeWeekly(userId);

            assertThat(res.bloodSugar().fastingValue()).isNull();
            assertThat(res.bloodSugar().fastingStatus()).isNull();
            assertThat(res.bloodSugar().fastingLabel()).isNull();
            assertThat(res.bloodSugar().preMealValue()).isNull();
            assertThat(res.bloodSugar().preMealStatus()).isNull();
            assertThat(res.bloodSugar().preMealLabel()).isNull();
            assertThat(res.bloodSugar().postMealValue()).isNull();
            assertThat(res.bloodSugar().postMealStatus()).isNull();
            assertThat(res.bloodSugar().postMealLabel()).isNull();
        }
    }

    // ============================================================
    //  C. intakeIntervals 파싱 케이스별
    // ============================================================
    @Nested
    @DisplayName("intakeIntervals 파싱 케이스별 (MedicationIntakeIntervalsParsing)")
    class MedicationIntakeIntervalsParsing {

        @Test
        @DisplayName("시나리오 6-a: intakeIntervals=null → scheduled=0, status/label null")
        void intakeIntervalsNull_scheduled0() {
            Long userId = 1L;
            stubUser(userId, 170.0, 65.0, null);

            when(prescriptionRepository.findByUser_UserIdAndIsDeletedFalse(userId))
                .thenReturn(List.of(prescription(null)));

            HealthAnalysisResponse res = service.analyzeWeekly(userId);

            assertThat(res.medication().scheduledCount()).isEqualTo(0);
            assertThat(res.medication().takenCount()).isEqualTo(0);
            assertThat(res.medication().adherenceRate()).isNull();
            assertThat(res.medication().status()).isNull();
            assertThat(res.medication().label()).isNull();
        }

        @Test
        @DisplayName("시나리오 6-b: \"MORNING,DINNER\" → 2/day × 7 = scheduled 14")
        void upperCase_MORNING_DINNER_scheduled14() {
            Long userId = 1L;
            stubUser(userId, 170.0, 65.0, null);

            when(prescriptionRepository.findByUser_UserIdAndIsDeletedFalse(userId))
                .thenReturn(List.of(prescription("MORNING,DINNER")));
            when(userMedicineRecordRepository.countByPrescription_User_UserIdAndIntakeDateBetween(
                    anyLong(), any(LocalDate.class), any(LocalDate.class)))
                .thenReturn(0L);

            HealthAnalysisResponse res = service.analyzeWeekly(userId);

            // 14 scheduled, 0 taken → 0% → RISK
            assertThat(res.medication().scheduledCount()).isEqualTo(14);
            assertThat(res.medication().takenCount()).isEqualTo(0);
            assertThat(res.medication().adherenceRate()).isEqualTo(0);
            assertThat(res.medication().status()).isEqualTo("RISK");
        }

        @Test
        @DisplayName("시나리오 6-c: \"morning, dinner\" 소문자+공백 → trim/대소문자 무관 → scheduled 14")
        void lowerCase_morning_dinner_scheduled14() {
            Long userId = 1L;
            stubUser(userId, 170.0, 65.0, null);

            when(prescriptionRepository.findByUser_UserIdAndIsDeletedFalse(userId))
                .thenReturn(List.of(prescription("morning, dinner")));
            when(userMedicineRecordRepository.countByPrescription_User_UserIdAndIntakeDateBetween(
                    anyLong(), any(LocalDate.class), any(LocalDate.class)))
                .thenReturn(0L);

            HealthAnalysisResponse res = service.analyzeWeekly(userId);

            assertThat(res.medication().scheduledCount()).isEqualTo(14);
            assertThat(res.medication().takenCount()).isEqualTo(0);
            assertThat(res.medication().adherenceRate()).isEqualTo(0);
            assertThat(res.medication().status()).isEqualTo("RISK");
        }

        @Test
        @DisplayName("시나리오 6-d: \"아침,저녁\" 한글 토큰 → 매칭 실패 → scheduled=0")
        void korean_아침_저녁_scheduled0() {
            Long userId = 1L;
            stubUser(userId, 170.0, 65.0, null);

            when(prescriptionRepository.findByUser_UserIdAndIsDeletedFalse(userId))
                .thenReturn(List.of(prescription("아침,저녁")));

            HealthAnalysisResponse res = service.analyzeWeekly(userId);

            assertThat(res.medication().scheduledCount()).isEqualTo(0);
            assertThat(res.medication().takenCount()).isEqualTo(0);
            assertThat(res.medication().adherenceRate()).isNull();
            assertThat(res.medication().status()).isNull();
            assertThat(res.medication().label()).isNull();
        }
    }

    // ============================================================
    //  D. 보유 질환 다중
    // ============================================================
    @Nested
    @DisplayName("보유 질환 다중 (DiseaseProfileMultiple)")
    class DiseaseProfileMultiple {

        @Test
        @DisplayName("시나리오 7: 3개 질환(hypertension:type2,diabetes:type1,gout:CHRONIC) → 모두 포함")
        void threeDiseases_allReturned() {
            Long userId = 1L;
            stubUser(userId, 170.0, 65.0,
                    "hypertension:type2,diabetes:type1,gout:CHRONIC");

            HealthAnalysisResponse res = service.analyzeWeekly(userId);

            assertThat(res.diseaseProfile().diseases())
                    .hasSize(3)
                    .extracting(p -> p.diseaseKey())
                    .containsExactly("hypertension", "diabetes", "gout");

            assertThat(res.diseaseProfile().diseases())
                    .extracting(p -> p.subtypeLabel())
                    .containsExactly("1기", "1형", "만성");
        }
    }

    // ============================================================
    //  E. 회원 없음
    // ============================================================
    @Nested
    @DisplayName("회원 없음 (UserNotFound)")
    class UserNotFound {

        @Test
        @DisplayName("userId로 회원 없으면 ResourceNotFoundException, 메시지에 \"회원\" + userId 포함")
        void unknownUserId_throwsResourceNotFound() {
            when(userRepository.findByUserId(99L)).thenReturn(Optional.empty());

            assertThatThrownBy(() -> service.analyzeWeekly(99L))
                    .isInstanceOf(ResourceNotFoundException.class)
                    .hasMessageContaining("회원")
                    .hasMessageContaining("99");
        }
    }

    // ============================================================
    //  F. 기간 검증 (analyzeByPeriod validatePeriod)
    // ============================================================
    @Nested
    @DisplayName("기간 검증 (PeriodValidation)")
    class PeriodValidation {

        @Test
        @DisplayName("C-1 보강: 90일치 (today-89 ~ today) → 통과 (경계 안)")
        void exactly90Days_passes() {
            // given
            Long userId = 1L;
            stubUser(userId, 170.0, 65.0, null);
            stubAllReposEmpty(userId);

            LocalDate end = LocalDate.now();
            LocalDate start = end.minusDays(89); // 90일치

            // when
            HealthAnalysisResponse res = service.analyzeByPeriod(
                    userId, start, end, HealthAnalysisService.PERIOD_TYPE_CUSTOM);

            // then
            assertThat(res.period().startDate()).isEqualTo(start);
            assertThat(res.period().endDate()).isEqualTo(end);
        }

        @Test
        @DisplayName("C-2 보강: 91일치 (today-90 ~ today) → 400, '최대 90일'")
        void exactly91Days_throws400() {
            LocalDate end = LocalDate.now();
            LocalDate start = end.minusDays(90); // 91일치

            assertThatThrownBy(() -> service.analyzeByPeriod(
                    1L, start, end, HealthAnalysisService.PERIOD_TYPE_CUSTOM))
                    .isInstanceOf(ResponseStatusException.class)
                    .hasMessageContaining("400")
                    .hasMessageContaining("90일");
        }

        @Test
        @DisplayName("start > end → 400, '시작일이 종료일보다 늦습니다'")
        void startAfterEnd_throws400() {
            LocalDate end = LocalDate.now().minusDays(5);
            LocalDate start = end.plusDays(1); // start = end + 1

            assertThatThrownBy(() -> service.analyzeByPeriod(
                    1L, start, end, HealthAnalysisService.PERIOD_TYPE_CUSTOM))
                    .isInstanceOf(ResponseStatusException.class)
                    .hasMessageContaining("400")
                    .hasMessageContaining("시작일");
        }

        @Test
        @DisplayName("endDate가 미래 (today+1) → 400, '종료일이 미래'")
        void endInFuture_throws400() {
            LocalDate start = LocalDate.now().minusDays(1);
            LocalDate end = LocalDate.now().plusDays(1);

            assertThatThrownBy(() -> service.analyzeByPeriod(
                    1L, start, end, HealthAnalysisService.PERIOD_TYPE_CUSTOM))
                    .isInstanceOf(ResponseStatusException.class)
                    .hasMessageContaining("400")
                    .hasMessageContaining("미래");
        }
    }

    // ============================================================
    //  G. 기간 선택 (wrapper 동작 + analyzeByPeriod 직접 호출)
    // ============================================================
    @Nested
    @DisplayName("기간 선택 (PeriodSelection)")
    class PeriodSelection {

        @Test
        @DisplayName("D-1: analyzeMonthly → startDate=today-29, Period.type='MONTHLY'")
        void analyzeMonthly_30DaysAndMonthlyType() {
            Long userId = 1L;
            stubUser(userId, 170.0, 65.0, null);
            stubAllReposEmpty(userId);

            HealthAnalysisResponse res = service.analyzeMonthly(userId);

            LocalDate today = LocalDate.now();
            assertThat(res.period().type()).isEqualTo("MONTHLY");
            assertThat(res.period().endDate()).isEqualTo(today);
            assertThat(res.period().startDate()).isEqualTo(today.minusDays(29));
        }

        @Test
        @DisplayName("D-2: analyzeByPeriod(today-45, today, 'CUSTOM') → 그 날짜+CUSTOM 그대로 Period에")
        void analyzeByPeriod_customDates_putExactlyInPeriod() {
            Long userId = 1L;
            stubUser(userId, 170.0, 65.0, null);
            stubAllReposEmpty(userId);

            LocalDate end = LocalDate.now();
            LocalDate start = end.minusDays(45); // 46일치

            HealthAnalysisResponse res = service.analyzeByPeriod(
                    userId, start, end, HealthAnalysisService.PERIOD_TYPE_CUSTOM);

            assertThat(res.period().type()).isEqualTo("CUSTOM");
            assertThat(res.period().startDate()).isEqualTo(start);
            assertThat(res.period().endDate()).isEqualTo(end);
        }

        @Test
        @DisplayName("D-3: analyzeWeekly 여전히 today-6 ~ today + 'WEEKLY' (기존 회귀 방지)")
        void analyzeWeekly_stillSevenDaysAndWeeklyType() {
            Long userId = 1L;
            stubUser(userId, 170.0, 65.0, null);
            stubAllReposEmpty(userId);

            HealthAnalysisResponse res = service.analyzeWeekly(userId);

            LocalDate today = LocalDate.now();
            assertThat(res.period().type()).isEqualTo("WEEKLY");
            assertThat(res.period().endDate()).isEqualTo(today);
            assertThat(res.period().startDate()).isEqualTo(today.minusDays(6));
        }

        @Test
        @DisplayName("D-4: analyzeByPeriod(today, today, 'CUSTOM') → 200 OK (1일치 허용)")
        void analyzeByPeriod_singleDay_allowed() {
            Long userId = 1L;
            stubUser(userId, 170.0, 65.0, null);
            stubAllReposEmpty(userId);

            LocalDate today = LocalDate.now();

            HealthAnalysisResponse res = service.analyzeByPeriod(
                    userId, today, today, HealthAnalysisService.PERIOD_TYPE_CUSTOM);

            assertThat(res.period().startDate()).isEqualTo(today);
            assertThat(res.period().endDate()).isEqualTo(today);
            assertThat(res.period().type()).isEqualTo("CUSTOM");
        }
    }

    /**
     * 기간 검증/선택 테스트용 — 모든 Repository를 빈 결과로 stub해
     * 분석 통과만 시키고 Period 자체에만 집중.
     * (검증 통과 케이스에서 NullPointerException 없이 끝까지 흘러가도록.)
     */
    private void stubAllReposEmpty(Long userId) {
        when(bioValueRecordRepository.findByUserAndCategoryAndRecordDateBetween(
                any(User.class), any(String.class),
                any(LocalDate.class), any(LocalDate.class)))
            .thenReturn(List.of());
        when(prescriptionRepository.findByUser_UserIdAndIsDeletedFalse(userId))
            .thenReturn(List.of());
        when(userMedicineRecordRepository.countByPrescription_User_UserIdAndIntakeDateBetween(
                anyLong(), any(LocalDate.class), any(LocalDate.class)))
            .thenReturn(0L);
    }

    /**
     * Step B 테스트용 풀스펙 User stub.
     * birthDate를 정확히 (오늘 - N년 - 1일)로 두면 만 N세가 결정적으로 나옴
     * (생일이 어제라서 이미 지난 상태).
     */
    private User stubFullUser(Long userId, String username, String gender,
                              Double height, Double weight, String diseaseIndex,
                              int ageYears) {
        User u = User.builder()
                .userId(userId)
                .username(username)
                .gender(gender)
                .height(height)
                .weight(weight)
                .diseaseIndex(diseaseIndex)
                .birthDate(LocalDate.now().minusYears(ageYears).minusDays(1))
                .build();
        when(userRepository.findByUserId(userId)).thenReturn(Optional.of(u));
        return u;
    }

    // ============================================================
    //  H. 보고서용 user 섹션 (Step B)
    // ============================================================
    @Nested
    @DisplayName("보고서용 user 섹션 (UserSection)")
    class UserSection {

        @Test
        @DisplayName("H-1: user 정보 (name/age/gender/height/weight) 매핑 정확")
        void userFields_mappedCorrectly() {
            // given
            Long userId = 1L;
            stubFullUser(userId, "김환자", "남", 175.5, 70.2, null, 30);
            stubAllReposEmpty(userId);

            // when
            HealthAnalysisResponse res = service.analyzeWeekly(userId);

            // then
            assertThat(res.user()).isNotNull();
            assertThat(res.user().name()).isEqualTo("김환자");          // username → name 매핑
            assertThat(res.user().age()).isEqualTo(30);                  // 어제 생일 → 만 30세 결정
            assertThat(res.user().gender()).isEqualTo("남");
            assertThat(res.user().height()).isEqualTo(175.5);           // Double 그대로
            assertThat(res.user().weight()).isEqualTo(70.2);
        }

        @Test
        @DisplayName("H-2: 보유 질환 1개 → DiseaseSummary 1건 (label/subtypeLabel 매핑)")
        void singleDisease_mappedToSummary() {
            Long userId = 1L;
            stubFullUser(userId, "김환자", "남", 175.0, 70.0, "hypertension:type2", 30);
            stubAllReposEmpty(userId);

            HealthAnalysisResponse res = service.analyzeWeekly(userId);

            assertThat(res.user().diseases()).hasSize(1);
            assertThat(res.user().diseases().get(0).label()).isEqualTo("고혈압");
            assertThat(res.user().diseases().get(0).subtypeLabel()).isEqualTo("1기");
        }

        @Test
        @DisplayName("H-3: 보유 질환 3개 → DiseaseSummary 3건 (순서 보존)")
        void multipleDiseases_mappedToSummariesInOrder() {
            Long userId = 1L;
            stubFullUser(userId, "김환자", "남", 175.0, 70.0,
                    "hypertension:type2,diabetes:type1,gout:CHRONIC", 30);
            stubAllReposEmpty(userId);

            HealthAnalysisResponse res = service.analyzeWeekly(userId);

            assertThat(res.user().diseases())
                    .extracting(HealthAnalysisResponse.DiseaseSummary::label)
                    .containsExactly("고혈압", "당뇨", "통풍");
            assertThat(res.user().diseases())
                    .extracting(HealthAnalysisResponse.DiseaseSummary::subtypeLabel)
                    .containsExactly("1기", "1형", "만성");
        }

        @Test
        @DisplayName("H-4: 보유 질환 없음 (diseaseIndex=null) → 빈 리스트")
        void noDisease_emptyList() {
            Long userId = 1L;
            stubFullUser(userId, "김환자", "남", 175.0, 70.0, null, 30);
            stubAllReposEmpty(userId);

            HealthAnalysisResponse res = service.analyzeWeekly(userId);

            assertThat(res.user().diseases()).isEmpty();
        }
    }

    // ============================================================
    //  I. min/max + recordingStats (Step B)
    // ============================================================
    @Nested
    @DisplayName("min/max + 측정 기록률 (MinMaxAndRecordingStats)")
    class MinMaxAndRecordingStats {

        @Test
        @DisplayName("I-1: 혈압 min/max 계산 정확")
        void bloodPressure_minMax_calculated() {
            Long userId = 1L;
            stubFullUser(userId, "김환자", "남", 170.0, 65.0, null, 30);

            // 혈압: 110/70, 130/85, 120/78 → sys [110,130,120], dia [70,85,78]
            when(bioValueRecordRepository.findByUserAndCategoryAndRecordDateBetween(
                    any(User.class), eq("BloodPressure"),
                    any(LocalDate.class), any(LocalDate.class)))
                .thenReturn(List.of(
                        bpRecord(110, 70),
                        bpRecord(130, 85),
                        bpRecord(120, 78)
                ));
            when(bioValueRecordRepository.findByUserAndCategoryAndRecordDateBetween(
                    any(User.class), eq("BloodSugar"),
                    any(LocalDate.class), any(LocalDate.class)))
                .thenReturn(List.of());
            when(prescriptionRepository.findByUser_UserIdAndIsDeletedFalse(userId))
                .thenReturn(List.of());
            when(userMedicineRecordRepository.countByPrescription_User_UserIdAndIntakeDateBetween(
                    anyLong(), any(LocalDate.class), any(LocalDate.class)))
                .thenReturn(0L);

            HealthAnalysisResponse res = service.analyzeWeekly(userId);

            assertThat(res.bloodPressure().minSystolic()).isEqualTo(110);
            assertThat(res.bloodPressure().maxSystolic()).isEqualTo(130);
            assertThat(res.bloodPressure().minDiastolic()).isEqualTo(70);
            assertThat(res.bloodPressure().maxDiastolic()).isEqualTo(85);
        }

        @Test
        @DisplayName("I-2: 혈당 3그룹 각각 min/max 계산 정확 (공복/식전/식후 분리)")
        void bloodSugar_threeGroups_minMax_separated() {
            Long userId = 1L;
            stubFullUser(userId, "김환자", "남", 170.0, 65.0, null, 30);

            when(bioValueRecordRepository.findByUserAndCategoryAndRecordDateBetween(
                    any(User.class), eq("BloodPressure"),
                    any(LocalDate.class), any(LocalDate.class)))
                .thenReturn(List.of());
            // 공복 [85, 95, 90], 식전 [100, 110], 식후 [140, 165, 155]
            when(bioValueRecordRepository.findByUserAndCategoryAndRecordDateBetween(
                    any(User.class), eq("BloodSugar"),
                    any(LocalDate.class), any(LocalDate.class)))
                .thenReturn(List.of(
                        bsRecord("공복", 85), bsRecord("공복", 95), bsRecord("공복", 90),
                        bsRecord("아침식전", 100), bsRecord("점심식전", 110),
                        bsRecord("아침식후", 140), bsRecord("점심식후", 165), bsRecord("저녁식후", 155)
                ));
            when(prescriptionRepository.findByUser_UserIdAndIsDeletedFalse(userId))
                .thenReturn(List.of());
            when(userMedicineRecordRepository.countByPrescription_User_UserIdAndIntakeDateBetween(
                    anyLong(), any(LocalDate.class), any(LocalDate.class)))
                .thenReturn(0L);

            HealthAnalysisResponse res = service.analyzeWeekly(userId);

            assertThat(res.bloodSugar().fastingMin()).isEqualTo(85);
            assertThat(res.bloodSugar().fastingMax()).isEqualTo(95);
            assertThat(res.bloodSugar().preMealMin()).isEqualTo(100);
            assertThat(res.bloodSugar().preMealMax()).isEqualTo(110);
            assertThat(res.bloodSugar().postMealMin()).isEqualTo(140);
            assertThat(res.bloodSugar().postMealMax()).isEqualTo(165);
        }

        @Test
        @DisplayName("I-3: recordingStats — 기간 7일 중 혈압 5일, 혈당 7일, 복약 3일 → rate 0.714/1.000/0.429")
        void recordingStats_calculated() {
            Long userId = 1L;
            stubFullUser(userId, "김환자", "남", 170.0, 65.0, null, 30);
            stubAllReposEmpty(userId);

            // distinct count stub (analyzeWeekly 기간은 7일)
            when(bioValueRecordRepository.countDistinctRecordDates(
                    any(User.class), eq("BloodPressure"),
                    any(LocalDate.class), any(LocalDate.class)))
                .thenReturn(5L);
            when(bioValueRecordRepository.countDistinctRecordDates(
                    any(User.class), eq("BloodSugar"),
                    any(LocalDate.class), any(LocalDate.class)))
                .thenReturn(7L);
            when(userMedicineRecordRepository.countDistinctIntakeDates(
                    anyLong(), any(LocalDate.class), any(LocalDate.class)))
                .thenReturn(3L);

            HealthAnalysisResponse res = service.analyzeWeekly(userId);

            assertThat(res.recordingStats()).isNotNull();
            assertThat(res.recordingStats().periodDays()).isEqualTo(7);
            assertThat(res.recordingStats().bloodPressureDays()).isEqualTo(5);
            assertThat(res.recordingStats().bloodSugarDays()).isEqualTo(7);
            assertThat(res.recordingStats().medicationDays()).isEqualTo(3);
            // 소수점 셋째 자리 반올림: 5/7=0.7142...→0.714, 7/7=1.0, 3/7=0.4285...→0.429
            assertThat(res.recordingStats().bloodPressureRate()).isEqualTo(0.714);
            assertThat(res.recordingStats().bloodSugarRate()).isEqualTo(1.0);
            assertThat(res.recordingStats().medicationRate()).isEqualTo(0.429);
        }

        @Test
        @DisplayName("I-4: distinct count 0 → rate 모두 0.0, periodDays는 그대로")
        void recordingStats_allZero_ratesAreZero() {
            Long userId = 1L;
            stubFullUser(userId, "김환자", "남", 170.0, 65.0, null, 30);
            stubAllReposEmpty(userId);
            // countDistinctRecordDates / countDistinctIntakeDates 는 default 0L 반환 (stub 안 함)

            HealthAnalysisResponse res = service.analyzeMonthly(userId);

            assertThat(res.recordingStats().periodDays()).isEqualTo(30);
            assertThat(res.recordingStats().bloodPressureDays()).isEqualTo(0);
            assertThat(res.recordingStats().bloodSugarDays()).isEqualTo(0);
            assertThat(res.recordingStats().medicationDays()).isEqualTo(0);
            assertThat(res.recordingStats().bloodPressureRate()).isEqualTo(0.0);
            assertThat(res.recordingStats().bloodSugarRate()).isEqualTo(0.0);
            assertThat(res.recordingStats().medicationRate()).isEqualTo(0.0);
        }
    }

    // ============================================================
    //  E. 일별 빌드 — BloodPressureDaily / DailyValue (Step 17 Phase A)
    // ============================================================
    @Nested
    @DisplayName("일별 빌드 (DailyBuild)")
    class DailyBuild {

        private BioValueRecord bpAt(int systolic, int diastolic, LocalDate date) {
            return BioValueRecord.builder()
                    .category("BloodPressure")
                    .systolicBP(systolic)
                    .diastolicBP(diastolic)
                    .recordDate(date)
                    .recordTime(LocalTime.NOON)
                    .build();
        }

        private BioValueRecord bsAt(String suffix, int value, LocalDate date) {
            return BioValueRecord.builder()
                    .category("BloodSugar-" + suffix)
                    .bloodSugar(value)
                    .recordDate(date)
                    .recordTime(LocalTime.NOON)
                    .build();
        }

        @Test
        @DisplayName("같은 날 여러 측정 → 평균값으로 일별 1개 (혈압/혈당)")
        void sameDate_multipleReadings_averaged() {
            Long userId = 1L;
            stubUser(userId, 170.0, 65.0, null);
            LocalDate today = LocalDate.now();

            // 혈압 같은 날 2건: 120/80, 130/90 → 평균 125/85
            when(bioValueRecordRepository.findByUserAndCategoryAndRecordDateBetween(
                    any(User.class), eq("BloodPressure"),
                    any(LocalDate.class), any(LocalDate.class)))
                .thenReturn(List.of(
                        bpAt(120, 80, today),
                        bpAt(130, 90, today)));

            // 혈당 공복 같은 날 2건: 100, 120 → 평균 110
            when(bioValueRecordRepository.findByUserAndCategoryAndRecordDateBetween(
                    any(User.class), eq("BloodSugar"),
                    any(LocalDate.class), any(LocalDate.class)))
                .thenReturn(List.of(
                        bsAt("공복", 100, today),
                        bsAt("공복", 120, today)));

            HealthAnalysisResponse res = service.analyzeWeekly(userId);

            // 혈압 일별 1건, 평균 125/85
            assertThat(res.bloodPressure().dailyRecords()).hasSize(1);
            assertThat(res.bloodPressure().dailyRecords().get(0).date()).isEqualTo(today);
            assertThat(res.bloodPressure().dailyRecords().get(0).systolic()).isEqualTo(125.0);
            assertThat(res.bloodPressure().dailyRecords().get(0).diastolic()).isEqualTo(85.0);

            // 혈당 공복 일별 1건, 평균 110
            assertThat(res.bloodSugar().dailyFasting()).hasSize(1);
            assertThat(res.bloodSugar().dailyFasting().get(0).date()).isEqualTo(today);
            assertThat(res.bloodSugar().dailyFasting().get(0).value()).isEqualTo(110.0);
            // 식전/식후 측정 없음 → 빈 list
            assertThat(res.bloodSugar().dailyPreMeal()).isEmpty();
            assertThat(res.bloodSugar().dailyPostMeal()).isEmpty();
        }

        @Test
        @DisplayName("측정 없는 날 → 일별 list 에서 빠짐 (시간순 정렬)")
        void missingDates_omittedFromList() {
            Long userId = 1L;
            stubUser(userId, 170.0, 65.0, null);
            LocalDate today = LocalDate.now();
            LocalDate d2 = today.minusDays(2);  // 측정 있음
            LocalDate d4 = today.minusDays(4);  // 측정 있음
            // d1, d3, d5, d6 측정 없음 → list 에서 빠져야

            when(bioValueRecordRepository.findByUserAndCategoryAndRecordDateBetween(
                    any(User.class), eq("BloodPressure"),
                    any(LocalDate.class), any(LocalDate.class)))
                .thenReturn(List.of(
                        bpAt(125, 80, d4),   // 일부러 역순으로 stub
                        bpAt(135, 85, d2)));

            when(bioValueRecordRepository.findByUserAndCategoryAndRecordDateBetween(
                    any(User.class), eq("BloodSugar"),
                    any(LocalDate.class), any(LocalDate.class)))
                .thenReturn(List.of());

            HealthAnalysisResponse res = service.analyzeWeekly(userId);

            // 2건만, 시간순 (d4 → d2) 정렬
            assertThat(res.bloodPressure().dailyRecords()).hasSize(2);
            assertThat(res.bloodPressure().dailyRecords().get(0).date()).isEqualTo(d4);
            assertThat(res.bloodPressure().dailyRecords().get(1).date()).isEqualTo(d2);
        }

        @Test
        @DisplayName("혈당 3그룹 분리 — 그룹별로 일별 list 구성")
        void bloodSugarGroups_separatedAndOrdered() {
            Long userId = 1L;
            stubUser(userId, 170.0, 65.0, null);
            LocalDate today = LocalDate.now();
            LocalDate d1 = today.minusDays(1);
            LocalDate d3 = today.minusDays(3);

            when(bioValueRecordRepository.findByUserAndCategoryAndRecordDateBetween(
                    any(User.class), eq("BloodPressure"),
                    any(LocalDate.class), any(LocalDate.class)))
                .thenReturn(List.of());

            // 공복 2일, 식전 1일, 식후 1일 — 그룹별로 분리되어야 함
            when(bioValueRecordRepository.findByUserAndCategoryAndRecordDateBetween(
                    any(User.class), eq("BloodSugar"),
                    any(LocalDate.class), any(LocalDate.class)))
                .thenReturn(List.of(
                        bsAt("공복",     90,  d3),
                        bsAt("공복",     95,  d1),
                        bsAt("아침식전", 100, today),
                        bsAt("저녁식후", 150, today)));

            HealthAnalysisResponse res = service.analyzeWeekly(userId);

            // 공복 2건, 시간순 (d3 → d1)
            assertThat(res.bloodSugar().dailyFasting()).hasSize(2);
            assertThat(res.bloodSugar().dailyFasting().get(0).date()).isEqualTo(d3);
            assertThat(res.bloodSugar().dailyFasting().get(0).value()).isEqualTo(90.0);
            assertThat(res.bloodSugar().dailyFasting().get(1).date()).isEqualTo(d1);
            assertThat(res.bloodSugar().dailyFasting().get(1).value()).isEqualTo(95.0);

            // 식전 1건
            assertThat(res.bloodSugar().dailyPreMeal()).hasSize(1);
            assertThat(res.bloodSugar().dailyPreMeal().get(0).value()).isEqualTo(100.0);

            // 식후 1건
            assertThat(res.bloodSugar().dailyPostMeal()).hasSize(1);
            assertThat(res.bloodSugar().dailyPostMeal().get(0).value()).isEqualTo(150.0);
        }
    }
}