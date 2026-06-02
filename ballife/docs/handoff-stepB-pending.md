# Step B 인계 문서 (이전 기간 비교) — Pending

> 작성 시점: Step A 완료 직후 (학원→집 이동 중)
> 다음 작업 환경: 집 노트북
> 목적: 집에서 이 문서 보고 Step B 7단계 이어서 진행

---

## 0. 현재 상태 스냅샷

- **Step A 완료** — 168 PASS
  - `BloodPressureAnalysisResult.dailyRecords: List<BloodPressureDaily>` 추가
  - `BloodSugarAnalysisResult.dailyFasting / dailyPreMeal / dailyPostMeal: List<DailyValue>` 추가
  - `HealthAnalysisService` 에 `buildBloodPressureDaily` / `buildBloodSugarDaily` 헬퍼 추가
  - `HealthAnalysisServiceTest @Nested DailyBuild` 3건 통과
- **Postman 검증 OK** — JSON 응답에 dailyRecords / dailyFasting / dailyPreMeal / dailyPostMeal 실제 데이터로 채워짐
- **Step B 계획만 받음, 코드 변경 없음**

---

## 1. 목표

LLM 이 "지난 30일 공복혈당이 평소보다 13mg/dL 증가했어요" 같은 **비교 표현** 을 생성할 수 있도록 이전 30일 데이터와 현재 30일 비교 정보를 `HealthAnalysisResponse` 에 제공.

**최종 결과 형식** (Step C 에서 PromptBuilder 가 생성할 LLM 응답):
```
"지난 7일 동안 혈당 수치가 평소보다 13mg/dL 높았어요. 식이 조절 방법에 대해 상담해 보세요."
"5월 15일 혈압이 평소보다 높게 측정되었어요. 그날 특별한 상황이 있었는지 의료진에게 알려 주세요."
```

---

## 2. 옵션 선택 (확정)

**채택: 옵션 B** — `HealthAnalysisResponse` 에 `comparison` 섹션 별도 추가

채택 이유:
- 기존 `BloodPressureAnalysisResult` / `BloodSugarAnalysisResult` 시그니처 그대로 유지 (record 시그니처 갱신 0)
- 책임 분리 (현재 분석 vs 비교 정보)
- 미래 확장 좋음 (주차별, 작년 동월 등 추가 쉬움)

---

## 3. record 구조 — `HealthAnalysisResponse` 안 nested

**위치**: `com.prologue.ballife.web.analysis.dto.HealthAnalysisResponse` 안 nested
**근거**: 기존 패턴 (`Period`, `User`, `DiseaseSummary`, `RecordingStats` 4개 모두 nested) 일관성

```java
public record HealthAnalysisResponse(
        Long userId,
        Period period,
        BloodPressureAnalysisResult bloodPressure,
        BloodSugarAnalysisResult bloodSugar,
        BmiAnalysisResult bmi,
        MedicationAnalysisResult medication,
        DiseaseProfileAnalysisResult diseaseProfile,
        User user,
        RecordingStats recordingStats,

        ComparisonSection comparison    // 신규 — 마지막 자리 (positional record 안전)
) {
    // 기존 4개 nested record (Period / User / DiseaseSummary / RecordingStats) 그대로 유지

    // === 신규 5개 nested record ===

    public record ComparisonSection(
            PreviousPeriod previousPeriod,
            BloodPressureComparison bloodPressure,
            BloodSugarComparison bloodSugar
    ) {}

    public record PreviousPeriod(LocalDate startDate, LocalDate endDate) {}

    public record BloodPressureComparison(
            Double previousAvgSystolic,
            Double currentAvgSystolic,
            Double changeSystolic,           // 양수=증가, 음수=감소
            String trendSystolic,            // INCREASE / DECREASE / STABLE / null
            Double previousAvgDiastolic,
            Double currentAvgDiastolic,
            Double changeDiastolic,
            String trendDiastolic
    ) {}

    public record BloodSugarComparison(
            BloodSugarGroupComparison fasting,    // 그룹별 데이터 없으면 null
            BloodSugarGroupComparison preMeal,
            BloodSugarGroupComparison postMeal
    ) {}

    public record BloodSugarGroupComparison(
            Double previousAvg,
            Double currentAvg,
            Double change,
            String trend
    ) {}
}
```

**파일 라인 수**: 약 100 → ~180 라인 (5개 record 추가)

---

## 4. trend 판정 기준 — 5% (확정)

```java
private String determineTrend(Double current, Double previous) {
    if (current == null || previous == null) return null;
    if (Math.abs(previous) < 0.0001) {  // 0 가드 (division by zero)
        return current > 0 ? "INCREASE" : "STABLE";
    }
    double changePercent = Math.abs((current - previous) / previous * 100);
    if (changePercent < 5.0) return "STABLE";
    return (current - previous) > 0 ? "INCREASE" : "DECREASE";
}
```

근거:
- 5% 이내 변동은 측정 노이즈 가능성 → STABLE
- 의료적 의미가 있는 변화는 일반적으로 ±5% 이상

---

## 5. 시그니처 갱신 영향 — 8군데 (5개 파일)

| 파일 | 호출 수 | 변경 |
|---|---|---|
| `Ballife/src/main/java/.../service/HealthAnalysisService.java` | 1 | 응답 빌더 — 실제 `ComparisonSection` 생성해서 넣음 (마지막 인자) |
| `Ballife/src/test/.../HealthAnalysisControllerTest.java` (stubResponse) | 1 | `null` 한 자리 추가 |
| `Ballife/src/test/.../ConsultationQuestionGeneratorTest.java` (build 헬퍼) | 1 | `null` 한 자리 추가 |
| `Ballife/src/test/.../ReportServiceTest.java` (buildFullResponse, buildPartialNullResponse) | 2 | 각각 `null` 한 자리 추가 |
| `Ballife/src/test/.../PromptBuilderTest.java` (buildFull, buildAllNull, buildAllNormal) | 3 | 각각 `null` 한 자리 추가 |

테스트 7곳은 단순 `null` 전달 (Step B 단계에서는 검증 X). Service 1곳만 실제 빌드.

총 `new HealthAnalysisResponse(...)` 호출 = 8건 — 모두 한 자리 추가.

---

## 6. 작업 단계 (7개)

### 6-1. `HealthAnalysisResponse.java` 확장
- 5개 nested record 추가 (`ComparisonSection`, `PreviousPeriod`, `BloodPressureComparison`, `BloodSugarComparison`, `BloodSugarGroupComparison`)
- 기존 9개 필드 + `ComparisonSection comparison` (10번째 필드, 마지막)
- JavaDoc 보완 — Step B 의도 명시

### 6-2. `HealthAnalysisService` — analyzer 변경 없음 (확인용 단계)
- `BloodPressureAnalyzer` / `BloodSugarAnalyzer` 등 5개 analyzer 시그니처 변경 X
- analyzer 는 통계 책임 유지, comparison 은 Service 책임

### 6-3. `HealthAnalysisService.analyzeByPeriod` 마지막에 `buildComparison` 호출
- 응답 조립 시 마지막 인자로 `buildComparison(user, userId, startDate, endDate)` 결과 전달

### 6-4. 헬퍼 메서드 추가
**buildComparison(User user, Long userId, LocalDate currentStart, LocalDate currentEnd)**:
```java
long periodDays = ChronoUnit.DAYS.between(currentStart, currentEnd) + 1;
LocalDate previousStart = currentStart.minusDays(periodDays);
LocalDate previousEnd   = currentStart.minusDays(1);

// ⚠️ 재귀 회피 — analyzeByPeriod 호출 X. analyzeBloodPressure / analyzeBloodSugar 만 직접 호출.
BloodPressureAnalysisResult prevBp = analyzeBloodPressure(user, previousStart, previousEnd);
BloodSugarAnalysisResult    prevBs = analyzeBloodSugar(user, previousStart, previousEnd);

// 현재 분석 결과는 호출자가 이미 가지고 있음 — 인자로 받거나 외부에서 조립
// 권장 시그니처:
// buildComparison(prevBp, currentBp, prevBs, currentBs, previousStart, previousEnd)
```

**최종 권장 시그니처**:
```java
private ComparisonSection buildComparison(
        BloodPressureAnalysisResult currentBp,
        BloodSugarAnalysisResult    currentBs,
        User user, Long userId,
        LocalDate currentStart, LocalDate currentEnd
) {
    long periodDays = ChronoUnit.DAYS.between(currentStart, currentEnd) + 1;
    LocalDate previousStart = currentStart.minusDays(periodDays);
    LocalDate previousEnd   = currentStart.minusDays(1);

    BloodPressureAnalysisResult prevBp = analyzeBloodPressure(user, previousStart, previousEnd);
    BloodSugarAnalysisResult    prevBs = analyzeBloodSugar(user, previousStart, previousEnd);

    return new ComparisonSection(
        new PreviousPeriod(previousStart, previousEnd),
        buildBloodPressureComparison(prevBp, currentBp),
        buildBloodSugarComparison(prevBs, currentBs)
    );
}
```

**determineTrend / buildBloodPressureComparison / buildBloodSugarComparison** — 위 4번 항목의 기준대로 구현.

### 6-5. 시그니처 7곳 갱신 (테스트 — null 전달)
모든 `new HealthAnalysisResponse(...)` 마지막에 `null` 한 자리 추가.

각 호출부:
- `HealthAnalysisControllerTest.java:82` (`stubResponse`)
- `ConsultationQuestionGeneratorTest.java` (`build` 헬퍼)
- `ReportServiceTest.java` (`buildFullResponse`, `buildPartialNullResponse`)
- `PromptBuilderTest.java` (`buildFull`, `buildAllNull`, `buildAllNormal`)

### 6-6. 컴파일 + 기존 168 PASS 회복 확인
```
./gradlew compileJava
./gradlew test → 168 PASS 유지 (시그니처 갱신만 했으므로 기존 동작 동일)
```

### 6-7. 신규 테스트 `@Nested ComparisonBuild` 4건 + 172 PASS
**위치**: `HealthAnalysisServiceTest` 끝 (DailyBuild nested 다음)

**4건 시나리오**:
1. **이전 기간 BP 있음 → change/trend 정확**
   - 이전 30일: BP 평균 120/78
   - 현재 30일: BP 평균 128/82
   - 검증: changeSystolic=8.0, trendSystolic="INCREASE" (8/120=6.67% > 5%)
   - 검증: changeDiastolic=4.0, trendDiastolic="STABLE" (4/78=5.13% — 경계, INCREASE 또는 STABLE 명확히)

2. **이전 기간 데이터 없음 → previous null + trend null**
   - 이전 30일: 측정 0건 → previousAvgSystolic=null
   - 검증: comparison.bloodPressure.changeSystolic=null, trendSystolic=null
   - 검증: previousPeriod 는 정상 채워짐 (날짜는 계산됨)

3. **STABLE 분기 검증** (3% 변화)
   - 이전: 120, 현재: 124 → 3.3% 변화 → STABLE
   - 검증: change=4.0, trend="STABLE"

4. **혈당 그룹별 분리 — 공복만 데이터, 식전/식후 null**
   - 이전 기간: 공복 1건만 측정, 식전·식후 0건
   - 검증: comparison.bloodSugar.fasting != null
   - 검증: comparison.bloodSugar.preMeal == null
   - 검증: comparison.bloodSugar.postMeal == null

**Mockito stub 추가**:
- `bioValueRecordRepository.findByUserAndCategoryAndRecordDateBetween` mock 이 currentStart/End 와 previousStart/End 둘 다 매칭해야 함
- 호출 인자 정확히 지정하거나, `any(LocalDate.class)` 사용 후 stub 한 번 (현재 + 이전 둘 다 같은 데이터 반환)
- 더 정확하려면 `eq(previousStart)`, `eq(previousEnd)` 로 별도 stub

---

## 7. 잠재 위험 (집에서 진행 시 주의)

| 위험 | 대응 |
|---|---|
| **재귀** | `buildComparison` 안에서 `analyzeByPeriod` 호출 금지 — `analyzeBloodPressure`/`analyzeBloodSugar` 만 직접 호출 |
| **periodLength 계산** | `ChronoUnit.DAYS.between(start, end) + 1` (양 끝 포함). 30일 분석이면 31이 아니라 30 |
| **이전 기간 record 0건** | analyzer 가 avg=null 반환 → previousAvg=null → change=null → trend=null. 정상 동작 |
| **DB 호출 2배** | 사용자 1명 30일 ≈ record 60개. 미미 |
| **0 division** | `Math.abs(previous) < 0.0001` 가드 박음 |
| **Mockito strict 모드** | 신규 테스트에서 이전 기간 stub 누락 시 NPE 가능. `any(LocalDate.class)` 로 폭넓게 stub 또는 `lenient()` 사용 |
| **테스트 시 LocalDate.now() 시점 의존** | `today.minusDays(N)` 으로 상대 계산하면 안전 (기존 DailyBuild 패턴 그대로) |

---

## 8. 변경 안 함 (Step B 범위 외)

- ❌ Repository (메서드 추가 X, 기존 `findByUserAndCategoryAndRecordDateBetween` 재사용)
- ❌ Analyzer 5개 (시그니처 변경 X)
- ❌ Frontend (UserInformation.jsx, reportApi.js 등)
- ❌ HTML 템플릿 (monthly.html / monthly-static.html)
- ❌ ReportPdfGenerator / ReportService / ReportController
- ❌ PromptBuilder / LlmClient / LlmResponseParser / LlmQuestionGenerator
- ❌ HealthAnalysisService 생성자 (의존성 추가 X)

→ **Step C** (PromptBuilder 가 comparison 데이터를 prompt 로 변환) 는 별도 단계

---

## 9. API 응답 검증 (Step B 완료 후 사용자 검증용)

`bootRun` 후 `GET /api/health-analysis/monthly` (JWT 인증) — JSON 응답:

```json
{
  "userId": 42,
  "period": { "type": "MONTHLY", "startDate": "2026-05-03", "endDate": "2026-06-01" },
  "bloodPressure": { ..., "dailyRecords": [...] },
  "bloodSugar": { ..., "dailyFasting": [...], ... },
  "bmi": { ... },
  "medication": { ... },
  "diseaseProfile": { ... },
  "user": { ... },
  "recordingStats": { ... },
  "comparison": {                                      // ⭐ 신규
    "previousPeriod": { "startDate": "2026-04-03", "endDate": "2026-05-02" },
    "bloodPressure": {
      "previousAvgSystolic": 120.5,
      "currentAvgSystolic": 128.0,
      "changeSystolic": 7.5,
      "trendSystolic": "INCREASE",
      "previousAvgDiastolic": 78.0,
      "currentAvgDiastolic": 82.0,
      "changeDiastolic": 4.0,
      "trendDiastolic": "STABLE"
    },
    "bloodSugar": {
      "fasting": {
        "previousAvg": 95.0,
        "currentAvg": 108.0,
        "change": 13.0,
        "trend": "INCREASE"
      },
      "preMeal": { "previousAvg": ..., ... },
      "postMeal": null                                 // 이전 기간 식후 측정 없음
    }
  }
}
```

**검증 포인트**:
- `comparison.previousPeriod` 날짜가 현재 기간 직전 30일과 정확히 매칭
- `bloodPressure.changeSystolic` = currentAvgSystolic - previousAvgSystolic
- `trendSystolic` 이 NULL/INCREASE/DECREASE/STABLE 중 하나
- `bloodSugar.{fasting,preMeal,postMeal}` 중 이전 기간 측정 없는 그룹은 null

---

## 10. 작업 후 보고 형식 (집에서 마무리할 때)

```
## Step B 완료

### 테스트 결과
168 + 4 = 172 PASS / 0 fail

### 변경 파일
- 신규 0개 (모두 HealthAnalysisResponse 안 nested 로 추가)
- 수정 N개 (HealthAnalysisResponse + HealthAnalysisService + 테스트 5개)

### API 응답 구조
comparison 섹션 신규 추가 (위 9번 형식)

### 사용자 검증 안내
bootRun + Postman GET /api/health-analysis/monthly → comparison 섹션 확인

### Step C 진입 가이드
PromptBuilder 가 comparison.{bloodPressure,bloodSugar} 의 change/trend 를
프롬프트에 "지난 30일 평균보다 N 증가/감소" 형식으로 변환
```

---

## 11. 메모 — 다음 세션 시작 시 컨텍스트 복원 (Claude Code 용)

집 환경에서 새 Claude Code 세션 시작 시:
1. 이 문서 (`Ballife/docs/handoff-stepB-pending.md`) 읽음
2. Step A 완료 상태 확인: `./gradlew test` → 168 PASS
3. 위 7단계 그대로 진행
4. 시그니처 갱신은 단순 `null` 한 자리 추가 — 8군데
5. Mockito stub 처리에서 막히면 `lenient()` 또는 `any(LocalDate.class)` 사용

작업 중간에 깨지면 즉시 멈춤. 임의 우회 금지.
