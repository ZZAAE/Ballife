# Ballife 백엔드 — Step 8 완료 인계 문서

> 작성 시점: Step 8 (분석 기간 확장) 완료.
> 누적 자동 테스트 **130 PASS** (suite 1개 = SpringBoot context load 포함, 실 테스트 케이스는 129).
> 본인 영역(Spring Boot) 핵심 기능은 완성 상태. 팀원 Python RAG 통신도 weekly 엔드포인트로 성공 확인됨.
> 이 문서를 새 Claude Code 세션의 첫 메시지로 던지면 컨벤션·결정사항·코드 위치까지 인수인계 가능.

---

## 1. 프로젝트 개요

**Ballife**는 성인병(고혈압·당뇨·고지혈증·골다공증·통풍) 관리 사용자가 건강 기록을 저장하고 AI 분석을 받는 웹서비스다.

### 역할 분담
- **Spring Boot (내 영역)**: 사용자 정보/측정 기록 DB 조회 → 기준표와 비교 → 결과 JSON 생성 → REST API
- **Python ai-service (팀원 영역, 절대 건드리지 마라)**: 내 API 호출 → LLM 프롬프트에 결과 끼움 → 답변 생성

### 통신 흐름
```
[프론트] → [Spring Boot, 입구]
              ↑    │
              │    └→ DB 조회 + 분석
              │
         [Python ai-service]  ← Python이 우리 API를 호출 (역방향)
              ↓
          [OpenAI LLM]
              ↓
         [Python] → 답변 반환
         [Spring Boot] → 프론트로 최종 답변
```

> **Step 9 (Python 호출 클라이언트)는 불필요로 결정.** 통신 방향이 Python → Spring Boot 일방향이라 Spring Boot 측에 Python을 호출하는 클라이언트가 필요 없음. 우리 API를 잘 노출만 하면 됨. 이전 인계 문서의 Step 9는 폐기.

---

## 2. 핵심 원칙

| # | 원칙 |
|---|---|
| 1 | **수치 판정은 자바 코드가 한다.** LLM에게 "위험한가?" 판단시키지 않음 |
| 2 | **LLM은 설명만.** 질병 확진 / 약물 변경 / 치료법 단정 금지 |
| 3 | **식단·운동은 정상/위험 판정 안 함** (REFERENCE_ONLY) |
| 4 | **보유 질환은 사용자 자기 신고**만 사용. AI가 진단하지 않음 |
| 5 | **사용자 친화 라벨**: "정상 / 약간 높음 / 다소 높음 / 높음 / 많이 높음". 병명(예: "고혈압 1기") 라벨 금지 |

### 친화 라벨 톤 표 (참고)
| 항목 | 정상 | 약간/다소 높음 | 높음 | 많이 높음 / 너무 낮음 |
|---|---|---|---|---|
| 혈압 | 정상 (120/80 미만) | 약간 높음 / 다소 높음 | 높음 | 많이 높음 |
| 공복혈당 | 정상 (70-99) | 다소 높음 (100-125) | — | 많이 높음 (126+) / 너무 낮음 (70 미만) |
| 식후혈당 | 정상 (70-139) | 다소 높음 (140-199) | — | 많이 높음 (200+) / 너무 낮음 |
| BMI | 정상 (18.5-22.9) | 과체중 (23-24.9) | 비만 (25-29.9) | 고도/초고도 비만 / 저체중 |
| 복약 | 양호 (80%+) | 다소 부족 (60-79%) | — | 많이 부족 (59% 이하) |

---

## 3. 환경 정보

- **위치 (학원 노트북)**: `C:\gabia\Ballife\Ballife`
- **위치 (집 노트북, 현재 작업 중)**: `C:\gabia\Ballife\Ballife` (학원과 동일 경로로 통일됨)
- **별도 프로젝트**: `ai-service` (Python, 팀원 영역)
- **언어**: Java 17 (`build.gradle` toolchain)
- **프레임워크**: Spring Boot 3.5.12, Spring Data JPA, MySQL, Spring Security, JWT, Swagger
- **DB**: MySQL `project_ballife` @ localhost:3306 (user=`ballife` / pw=`1234`), MongoDB(localhost:27017, Ballife)
- **base 패키지**: `com.prologue.ballife`
- **빌드/실행** (gradlew 위치: `Ballife/` 디렉토리):
  - 컴파일+테스트: `gradlew test`
  - 서버 기동: `gradlew bootRun` (port 8080)
- **테스트 의존성**: `spring-boot-starter-test` 1줄로 JUnit5 + Mockito + AssertJ 자동 포함. 추가 설치 필요 없음.

### 집 노트북 초기 셋업 메모 (Step 8 시작 시점에 해결됨)
- `src/main/resources/application.yml`은 `.gitignore` 처리되어 push 안 됨. `application.yml.example` 복사 + `storage.local.base-path`만 본인 경로(`C:/Users/soldesk/Desktop/프로젝트_임시`)로 교체하면 됨. 새 노트북에서 클론 시 동일 절차 필요.

---

## 4. 폴더 구조 및 노출된 엔드포인트

### 4-1. 코드 구조
```
com.prologue.ballife/
├─ config/           SecurityConfig, DatabaseConfig, WebConfig
├─ domain/           board, daily(BioValueRecord), exercise, food, meal,
│                    medicine(Prescription, UserMedicine, UserMedicineRecord, …),
│                    news, subscription, user(User, UserConfig, Medal)
├─ exception/        ResourceNotFoundException 등
├─ repository/       각 도메인 Repository
├─ security/         JWT 관련 (CustomUserDetails, JwtAuthenticationFilter, ...)
├─ service/          도메인 Service + HealthAnalysisService
├─ standard/         상수 5개 (BloodSugar/BloodPressure/Bmi/Medication/DiseaseProfile)
├─ analyzer/         Analyzer 5개 + Result record 5개 (BloodSugar는 식전 그룹 확장됨)
├─ util/
└─ web/
   ├─ ...
   └─ analysis/      ★ HealthAnalysisController
      ├─ HealthAnalysisController.java   (엔드포인트 4개)
      └─ dto/
         └─ HealthAnalysisResponse.java  (Period 내부 record 포함)

src/test/java/com/prologue/ballife/
├─ standard/                          (1순위 — 5 클래스 / 90 tests)
│  ├─ BloodSugarStandardTest.java        (16)
│  ├─ BmiStandardTest.java               (18)
│  ├─ BloodPressureStandardTest.java     (24)
│  ├─ MedicationStandardTest.java        (13)
│  └─ DiseaseProfileStandardTest.java    (19)
├─ analyzer/                          (2순위 — 1 클래스 / 11 tests)
│  └─ BloodSugarAnalyzerTest.java        (11)
├─ service/                           (3순위 + Step 8 — 1 클래스 / 19 tests)
│  └─ HealthAnalysisServiceTest.java     (11 + 8 = 19)
└─ web/analysis/                      (Step 7 + Step 8 — 1 클래스 / 9 tests)
   └─ HealthAnalysisControllerTest.java  (4 + 5 = 9)
```

### 4-2. 노출된 REST 엔드포인트

| 메서드 | 경로 | 설명 | 진입 |
|---|---|---|---|
| GET | `/api/health-analysis/weekly` | **본인** 최근 7일 분석 (권장) | Step 7 신규, `@AuthenticationPrincipal` |
| GET | `/api/health-analysis/monthly` | **본인** 최근 30일 분석 | **Step 8 신규** |
| GET | `/api/health-analysis/range?startDate=&endDate=` | **본인** 커스텀 기간 분석 (1~90일) | **Step 8 신규** |
| GET | `/api/health-analysis/weekly/{userId}` | [Deprecated] PathVariable userId 방식. 하위 호환 유지 | Step 4 원본, Step 7에서 `@Deprecated` 표시 |

**모든 엔드포인트는 JWT 필수** (SecurityConfig의 `.anyRequest().authenticated()` 정책).

응답은 동일하게 `HealthAnalysisResponse` JSON. `period.type` 만 `"WEEKLY"` / `"MONTHLY"` / `"CUSTOM"` 로 구분.

---

## 5. 지금까지 완료된 작업 (Step 1 ~ Step 8)

### Step 1 — 프로젝트 구조 조사
User 엔티티에 `height`, `weight`, `gender`, `diseaseIndex` 모두 존재 확인. 측정 기록은 `domain.daily.BioValueRecord` 단일 테이블에 `category` 문자열로 구분.

### Step 2 — DTO 신규 생성
`web/analysis/dto/HealthAnalysisResponse.java` — 5개 Analyzer Result + 내부 `Period(type, startDate, endDate)` record.

### Step 3 — Repository + Service
- `repository/medicine/UserMedicineRecordRepository.java` 에 `countByPrescription_User_UserIdAndIntakeDateBetween(Long, LocalDate, LocalDate)` 메서드 추가
- `service/HealthAnalysisService.java` 신규

### Step 4 — Controller
`web/analysis/HealthAnalysisController.java` — `GET /api/health-analysis/weekly/{userId}` (Swagger Tag 등록, `@RequiredArgsConstructor` 사용).

### Step 5 — Postman 동작 검증 (성공)
- `gradlew bootRun` → 8080
- `POST /api/auth/login` → JWT
- `GET /api/health-analysis/weekly/2` + Bearer → **200 OK**
- 응답에 5개 항목 모두 의도대로 채워짐 확인 (식전 분류 살아있는 것 검증)

### Step 6 — 자동 테스트 코드 ✅ (1·2·3순위 모두 PASS)

| 순위 | 파일 | tests | 검증 포인트 |
|---|---|---|---|
| 1순위 | standard 5개 클래스 | 90 | 각 구간 경계값 + label + status, 예외 케이스 |
| 2순위 | `analyzer/BloodSugarAnalyzerTest.java` | 11 | 공복/식전/식후 3그룹 분리, 식전이 classifyFasting 재사용, 평균 반올림, 사용 안 한 그룹 필드 null 검증 |
| 3순위 | `service/HealthAnalysisServiceTest.java` | 11 | 카테고리 분류, intakeIntervals 파싱, ResourceNotFoundException. Repository 4 mock + Analyzer 5 실제 객체 |
| | | **누적 112** | **100% PASS** |

### Step 7 — 인증·권한 보강 ✅

**전략 (안 B)**: PathVariable 제거 + `@AuthenticationPrincipal CustomUserDetails me` 로 본인 ID를 SecurityContext에서 추출. 입력 자체가 불가능한 게 검증보다 강한 보호.

- `HealthAnalysisController` 에 신규 `GET /weekly` 추가 (`@AuthenticationPrincipal`)
- 기존 `GET /weekly/{userId}` 는 `@Deprecated` + Swagger description "deprecated, /weekly 사용 권장" 둘 다 명시. 동작은 그대로 유지 (하위 호환)
- `SecurityConfig`는 **수정 없음** — `.anyRequest().authenticated()` 가 자동으로 묶어줘서 이미 JWT 필수 상태
- `HealthAnalysisControllerTest.java` 신규 작성:
  - 셋업: `@SpringBootTest + @AutoConfigureMockMvc + @MockBean HealthAnalysisService`
  - `with(user(customUserDetails))` 로 SecurityContext 박기 (JWT 발급 없이도 "이미 인증된 상태" 시뮬레이션)
  - 케이스 4개 (`/weekly` 인증/미인증, `/weekly/{userId}` 인증/미인증)
- **누적 116 PASS**

### Step 8 — 분석 기간 확장 ✅ (이번 세션)

**핵심 아이디어**: `analyzeByPeriod(userId, start, end, periodType)` 을 단일 진실의 출처로 두고, `analyzeWeekly` / `analyzeMonthly` 는 wrapper로만 동작.

#### Service 변경 (HealthAnalysisService)
- **신규**: `analyzeByPeriod(userId, start, end, periodType)` — 임의 기간 분석 핵심 메서드
- **신규**: `validatePeriod(start, end)` private — null/start>end/미래/91일 이상 → `ResponseStatusException(400)`
- **리팩터링**: `analyzeWeekly(userId)` → wrapper (`today-6 ~ today + "WEEKLY"`)
- **신규**: `analyzeMonthly(userId)` → wrapper (`today-29 ~ today + "MONTHLY"`)
- **내부 변경**: `analyzeMedication`의 기간 일수가 `PERIOD_DAYS=7` 하드코딩 → `ChronoUnit.DAYS.between(start, end) + 1` **동적 계산**. wrapper 호출 시 기간이 다르면 `scheduledCount`가 자동으로 그에 맞춰짐.
- 상수 추가: `PERIOD_DAYS_MONTHLY=30`, `PERIOD_MAX_DAYS=90`, `PERIOD_TYPE_MONTHLY/CUSTOM`

#### Controller 변경 (HealthAnalysisController)
- **신규**: `GET /monthly` (`@AuthenticationPrincipal` → `analyzeMonthly`)
- **신규**: `GET /range?startDate=&endDate=` (`@RequestParam @DateTimeFormat(iso=DATE) LocalDate` → `analyzeByPeriod(..., "CUSTOM")`)
- 기존 `/weekly`, `/weekly/{userId}` 그대로 (하위 호환)

#### 테스트 추가
- Service `HealthAnalysisServiceTest`: **+8 tests**
  - `PeriodValidation` (F그룹 4): 90일 경계 통과 / 91일 400 / start>end 400 / 미래 400
  - `PeriodSelection` (G그룹 4): analyzeMonthly 30일+MONTHLY / analyzeByPeriod 커스텀 / weekly 회귀 방지 / 1일치 허용
- Controller `HealthAnalysisControllerTest`: **+5 tests**
  - `GetMyMonthly` (C그룹 2): 인증 200 / 미인증 401
  - `GetMyRange` (D그룹 3): 인증 200 / 미인증 401 / 잘못된 날짜 형식 400

**누적 129 PASS** + SpringBoot context load 1 = `gradlew test` 총 **130** (`BUILD SUCCESSFUL`).

### Python RAG 통신 확인
팀원이 Python ai-service에서 `/api/health-analysis/weekly` 엔드포인트로 호출하여 분석 결과를 받아 LLM 프롬프트에 끼우는 것까지 성공 확인 (2026-06-01).

### 사전 사전 작업 (Step 6 진입 전, 사용자 동의 후 수정)
혈당 분석을 **공복/식전/식후 3그룹**으로 만드는 (C)안 적용:
- `analyzer/BloodSugarAnalysisResult.java` — 식전 필드 3개 추가 (`preMealValue/Status/Label`)
- `analyzer/BloodSugarAnalyzer.java` — `analyze` 시그니처에 `List<Integer> preMealValues` 인자 추가, 식전 분류는 `classifyFasting` 재사용

---

## 6. 사전 결정 사항 (반드시 유지)

| 항목 | 결정 | 이유 |
|---|---|---|
| **혈당 분류 (Q1)** | **3그룹 (공복/식전/식후)** | 의학적 정확도 + 데이터 활용. `BloodSugar-취침전`은 분석 제외 |
| **식전 분류 기준** | `BloodSugarStandard.classifyFasting` **재사용** | 식전은 마지막 식사 후 4~6시간 경과 → 공복에 준함 |
| **`BloodSugar-취침전`** | 분석에서 제외 (저녁식후 영향 남아있어 공복도 식후도 아님). 차트/타임라인엔 유지 | |
| **분석 기간 옵션** | **3종 (weekly / monthly / custom)** 확정 | Step 8에서 노출. 단일 진실은 `analyzeByPeriod` |
| **분석 기간 — weekly** | `today-6 ~ today` (오늘 포함 7일), `type="WEEKLY"` | |
| **분석 기간 — monthly** | `today-29 ~ today` (오늘 포함 30일), `type="MONTHLY"` | |
| **분석 기간 — custom (range)** | 최대 **90일**, `start ≤ end`, `end ≤ today`, `start == end` 허용 (1일치), `type="CUSTOM"` | 의료 분석 의미 흐려짐 방지. 1일치 허용은 명시적 결정. 위반 시 400 |
| **복약 산출** | 활성 `Prescription`의 `intakeIntervals` 콤마 split × **기간 일수** = scheduled / 기간 내 `UserMedicineRecord` 행 수 = taken | Step 8에서 기간 일수가 **동적**으로 변경됨 |
| **`intakeIntervals` 형식** | 콤마 구분 + `TakenCategory` enum 이름 (case-insensitive). 매칭 안 되는 토큰은 무시 | |
| **인증 (Step 7)** | **안 B**: PathVariable 제거 + `@AuthenticationPrincipal`. 기존 `/weekly/{userId}` 는 deprecated로 유지 | 입력 불가능이 검증보다 강한 보호 |
| **Service 테스트 mock 정책** | **Repository는 mock, Analyzer는 실제 객체** | Analyzer는 단위 테스트 통과한 순수 컴포넌트. mock하면 검증 깊이 사라짐 |
| **Step 9 Python 호출 클라이언트** | **불필요** 결정 | 통신 방향이 Python → Spring Boot 단방향. 우리가 Python을 호출할 필요 없음 |
| **식단·운동** | Step 10에서 별도 추가 (REFERENCE_ONLY). 데이터 모델·표시 방식 제품 결정 후 | |

---

## 7. 트러블슈팅 메모

### 7-1. DB 스키마 어긋남 — 해결 완료 (Step 5)
- 증상: `Unknown column 'umr1_0.user_medicine_record_id' in 'field list'`
- 원인: `user_medicine_record` 테이블이 옛 이름(`user_supplement_id` PK) 시절 만들어진 채 남아있고, `ddl-auto: update`는 컬럼 rename 안 함
- 처치: `DROP TABLE user_medicine_record;` 후 서버 재시작 (데이터 비어있어서 가능)

### 7-2. BMI 비현실값 — 코드는 정상 (Step 5)
- 증상: `bmi.value = 144.6, RISK 초고도 비만`
- 원인: 테스트 데이터(user_id=2)가 `height=66cm, weight=63kg`. 계산식은 정확
- 처치: 회원가입 입력 단에서 `height >= 100` validator를 거는 게 정답 (다른 사람 영역)

### 7-3. `intakeIntervals` 형식 미정 위험 (Step 5)
- 백엔드 어디에도 형식 검증/파싱 코드 없음
- 현 코드는 콤마 split + `TakenCategory` enum 이름 매칭(case-insensitive). 매칭 실패 시 토큰 무시, 0 반환
- Service 테스트 시나리오 6에서 `null` / `"MORNING,DINNER"` / `"morning, dinner"` / `"아침,저녁"` 네 가지 케이스로 명시 검증됨

### 7-4. `BioValueRecord.category` prefix 매칭 (Step 5)
- Repository가 `LIKE 'BloodSugar%'` prefix로 잡음
- Service에서 카테고리 접미사 보고 3그룹 분류

### 7-5. SecurityConfig 미등록 — 의도된 상태 (Step 7 확정)
- `/api/health-analysis/**` 명시 등록 없이도 `.anyRequest().authenticated()` 정책으로 JWT 필수
- 별도 등록 불필요. SecurityConfig 손대지 마라

### 7-6. Mockito strict stubbing 함정 (Step 6 3순위)
- 증상: `org.mockito.exceptions.misusing.PotentialStubbingProblem`
- 같은 Repository 메서드를 여러 카테고리/인자로 호출하면 **모든 호출 패턴에 stub을 명시**해야 함
- `@MockitoSettings(strictness = Strictness.LENIENT)` 전체 lenient는 함정을 가리니까 쓰지 마라

### 7-7. 집 노트북 application.yml 누락 (Step 8 시작 시)
- 증상: `Error creating bean with name 'jwtTokenProvider'` (yml의 `spring.security.jwt.secret` 못 찾음)
- 원인: `application.yml`이 `.gitignore`로 push 안 됨. `application.yml.example`만 따라옴
- 처치: `.example` 복사해서 `application.yml` 생성, `storage.local.base-path`만 본인 경로로 교체

### 7-8. Step 8 자체는 깔끔하게 통과
- 추가 트러블슈팅 없음

---

## 8. 테스트 컨벤션 (Step 6 이후 변경 없음, 그대로 따라가기)

### 8-1. 단위 테스트 (standard, analyzer 패키지)

```java
package com.prologue.ballife.<영역>;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Nested;
import org.junit.jupiter.api.Test;

class <대상>Test {
    @Nested
    @DisplayName("메서드명 또는 묶음 설명")
    class <메서드명PascalCase> {
        @Test
        @DisplayName("69 → LOW (정상 하한 바로 아래)")
        void boundary_69_LOW() {
            // given - when - then
            var result = Standard.classify(69);
            assertThat(result).isEqualTo(Standard.Range.LOW);
            assertThat(result.status).isEqualTo("LOW");
            assertThat(result.label).isEqualTo("너무 낮음 (70 미만)");
        }
    }
}
```

### 8-2. Service 테스트 (Mockito)

```java
@ExtendWith(MockitoExtension.class)
class <Service>Test {
    @Mock <Repo1> repo1;
    HealthAnalysisService service;

    @BeforeEach
    void setUp() {
        // Analyzer 5개는 실제 객체. Repository만 mock
        service = new HealthAnalysisService(repo1, ..., new BloodPressureAnalyzer(), ...);
    }
    // Repository 호출 매처는 다른 인자 호출 패턴까지 모두 명시 (strict stubbing 함정 회피)
}
```

### 8-3. Controller 테스트 (`@SpringBootTest + MockMvc`)

```java
@SpringBootTest
@AutoConfigureMockMvc
class <Controller>Test {
    @Autowired MockMvc mockMvc;
    @MockBean HealthAnalysisService healthAnalysisService;
    private CustomUserDetails me;

    @BeforeEach
    void setUp() {
        User testUser = User.builder().userId(42L)...build();
        me = new CustomUserDetails(testUser);
        when(healthAnalysisService.analyzeWeekly(42L)).thenReturn(stubResponse(...));
        // analyzeMonthly, analyzeByPeriod도 stub
    }

    @Test
    void someTest() throws Exception {
        mockMvc.perform(get("/api/health-analysis/weekly").with(user(me)))
               .andExpect(status().isOk());
        verify(healthAnalysisService).analyzeWeekly(eq(42L));
    }
}
```

### 8-4. 패턴 룰 요약
- 파일 위치: 메인 패키지와 미러링
- 클래스명: `대상명 + Test`
- 그룹화: `@Nested` 클래스로 메서드/기능별 묶음
- 라벨: `@Test` + `@DisplayName` 한국어 병행
- 어서션: AssertJ (`assertThat(...).isEqualTo(...)`, `.isEmpty()`, `.hasSize(n)`, `.extracting(::method)`)
- 예외: `assertThatThrownBy(() -> ...).isInstanceOf(Exception.class).hasMessageContaining("...")`
- Spring 컨텍스트: 단위는 안 씀, Controller만 `@SpringBootTest`
- 라벨/상태까지 검증 — LLM 출력 정확성이 여기 달려있음
- 경계값 위주 (각 구간 양 끝 + 극단값 1~2개)

### 8-5. 실행 명령
```bash
gradlew test --tests "com.prologue.ballife.standard.*"   → 90 PASS
gradlew test --tests "com.prologue.ballife.analyzer.*"   → 11 PASS
gradlew test --tests "com.prologue.ballife.service.*"    → 19 PASS
gradlew test --tests "com.prologue.ballife.web.*"        → 9 PASS
gradlew test                                              → 130 (실 케이스 129 + context load 1)
```
결과 XML: `build/test-results/test/TEST-*.xml`

---

## 9. 남은 작업

### Step 9 — Python 호출 클라이언트 ❌ 불필요 결정
이전 인계 문서에서 "팀원이 Python ai-service의 입력 JSON 명세 확정 후 진행"으로 잡혀있었으나, **실제 통신 방향은 Python → Spring Boot 단방향**임이 명확해졌다. Python이 우리 API(`/weekly`)를 호출해 받은 결과를 LLM에 넘기는 구조 → Spring Boot 측에서 Python을 호출할 일 없음. **이 단계는 폐기.**

### Step 10 — 식단·운동 항목 추가 ⏸ (제품 결정 대기)
- `HealthAnalysisResponse`에 `meal`, `exercise` 필드 추가
- REFERENCE_ONLY (정상/위험 판정 ❌)
- 표시 방식 미정 — 일평균 kcal / 권장량 대비 / 빈도 등 어떤 합산을 보여줄지 결정 필요
- 데이터 모델 확정 후 진행

### 알려진 경고 — 일괄 마이그레이션 별도 단계
Spring Boot 3.x에서 `@MockBean`이 deprecated.
```
warning: [removal] MockBean in org.springframework.boot.test.mock.mockito
         has been deprecated and marked for removal
```
- `org.springframework.test.context.bean.override.mockito.MockitoBean` 으로 마이그레이션 가능
- 현재 1곳만 사용 (`HealthAnalysisControllerTest`) → 영향 작음
- 별도 단계에서 일괄 변경 권장

### 잠재 후보 (제품 결정 후)
- 회원가입 입력 validator (`height >= 100`, `weight` 범위 등) — 다른 사람 영역이라 합의 필요
- `intakeIntervals` 형식 명세화 — 프론트 합의 + 백엔드 validator 추가
- 분석 결과 캐싱 (조회 빈도 높아지면)
- `@MockBean` → `@MockitoBean` 마이그레이션

---

## 10. 작업 방식 규칙

| # | 규칙 |
|---|---|
| 10-1 | **진행 사항을 모두 한국어로 설명.** 파일 만들기 **전**에 무엇/어디/왜 설명, 만든 **후**에 핵심 로직 요약. 어려운 자바/Spring 문법은 풀어서 설명 |
| 10-2 | **추측 금지.** 엔티티 필드명, Repository 메서드 이름 등 실제 파일 열어 확인. 모르면 먼저 물어보기 |
| 10-3 | **한 번에 한 단계씩.** 각 Step 끝나면 확인 받고 다음으로. 패턴이 검증된 후라면 같은 패턴의 여러 파일 동시 작성 OK (Step 6 1순위 5개, Step 8 4파일을 그렇게 진행) |
| 10-4 | **기존 기능 로직 변경 금지.** 다른 사람의 controller/service/repository 함부로 수정 ❌. 수정 필요시 사용자 동의 받기. 이미 동의 받은 파일들도 추가 수정 시 매번 동의 |
| 10-5 | **에러나 막힘 시 임의 우회 금지.** 에러 메시지 그대로 사용자에게 보여주고 같이 해결. 테스트 FAIL은 케이스 그대로 보고 후 원인 분석부터 |

---

## 11. 다음 세션 시작 지시

### 현재 상태
- **본인 영역(Spring Boot) 백엔드 핵심 기능 완성.**
- 자동 테스트 130 PASS. 실 API 동작은 Postman + Python RAG 통신으로 검증됨.
- 다음 큰 진행은 외부 의존성(제품 결정 또는 팀원 요청) 풀리는 시점.

### 새 세션이 들어왔을 때 권장 응답 순서

1. **현황 확인**: "Step 8까지 완료, 130 PASS 상태" 인지 1~2문장으로 짚기
2. **`gradlew test`** 실행해서 환경 멀쩡한지 (130 PASS 재현되는지) 확인 후 보고
3. **다음 작업 방향**을 사용자에게 묻기. 세 후보:
   - **(가) Step 10 — 식단·운동 항목 추가**: 단, 어떤 합산을 응답에 넣을지 제품 결정 필요. 결정이 와있다면 바로 진행
   - **(나) `@MockBean` → `@MockitoBean` 마이그레이션**: 작고 명확한 작업. 1파일만 수정. 1시간 안 쪽
   - **(다) 다른 보강** — 회원가입 validator 협의 / 분석 결과 캐싱 검토 / Swagger UI 동작 확인 등 사용자 지시
4. **사용자 답 기다리기.** 코드부터 짜지 마라.

### 다음 세션의 첫 작업 (사용자 지시 없을 시 권장 디폴트)
> **(나) `@MockBean` → `@MockitoBean` 마이그레이션.**
> 외부 의존성 없이 바로 가능하고, deprecated 경고를 미리 정리해두면 향후 Spring Boot 업그레이드 시 부담 0.
> 변경 범위: `HealthAnalysisControllerTest.java` 1파일, import 2줄 교체 + 어노테이션 1개 교체.
> 검증: `gradlew test` 130 PASS 유지.

### Step 8 본인 영역 작업 마무리 메시지
> 백엔드 핵심 기능은 견고하게 완성됨. Service 검증 8건 / Controller 검증 5건 / 누적 130 PASS / Python RAG 통신 성공 / 분석 기간 3종(주간·월간·커스텀) 운영 가능 상태. 다음은 외부 의존성 풀리는 대로 진행하면 됨.