# Ballife 백엔드 — Step 6 완료 / Step 7 진입 전 인계 문서

> 작성 시점: Step 6 (테스트 코드 작성) 1·2·3순위 모두 완료, Step 7(인증·권한 보강) 진입 전.
> 누적 테스트 **112건 PASS**.
> 이 문서를 새 Claude Code 세션의 첫 메시지로 던지면 컨벤션·결정사항·코드 위치까지 인수인계 가능.

---

## 1. 프로젝트 개요

**Ballife**는 성인병(고혈압·당뇨·고지혈증·골다공증·통풍) 관리 사용자가 건강 기록을 저장하고 AI 분석을 받는 웹서비스다.

### 역할 분담
- **Spring Boot (내 영역)**: 사용자 정보/측정 기록 DB 조회 → 기준표와 비교 → 결과 JSON 생성 → REST API
- **Python ai-service (팀원 영역, 절대 건드리지 마라)**: 내 API 호출 → LLM 프롬프트에 결과 끼움 → 답변 생성

### 통신 흐름
```
[프론트] → [Spring Boot, 입구] → [Python ai-service] → [OpenAI]
                                ← 답변
        ← 최종 답변
```
Python ai-service의 입력 JSON 명세는 아직 미정 (Step 9에서 진행).

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
- **위치 (집 노트북, 현재 작업 중)**: `C:\Users\hemmm\Desktop\Ballife\Ballife`
- **별도 프로젝트**: `ai-service` (Python, 팀원 영역)
- **언어**: Java 17 (`build.gradle` toolchain)
- **프레임워크**: Spring Boot 3.5.12, Spring Data JPA, MySQL, Spring Security, JWT, Swagger
- **DB**: MySQL `project_ballife` @ localhost:3306 (user=`ballife` / pw=`1234`), MongoDB(localhost:27017, Ballife)
- **base 패키지**: `com.prologue.ballife`
- **빌드/실행** (gradlew 위치: `ballife/` 디렉토리):
  - 컴파일+테스트: `gradlew test`
  - 서버 기동: `gradlew bootRun` (port 8080)
- **테스트 의존성**: `spring-boot-starter-test` 1줄로 JUnit5 + Mockito + AssertJ 자동 포함. 추가 설치 필요 없음.

---

## 4. 폴더 구조 현황

```
com.prologue.ballife/
├─ config/           SecurityConfig, DatabaseConfig, WebConfig
├─ domain/           board, daily(BioValueRecord), exercise, food, meal,
│                    medicine(Prescription, UserMedicine, UserMedicineRecord, …),
│                    news, subscription, user(User, UserConfig, Medal)
├─ exception/        ResourceNotFoundException 등
├─ repository/       각 도메인 Repository
├─ security/         JWT 관련
├─ service/          도메인 Service + HealthAnalysisService
├─ standard/         상수 5개 (BloodSugar/BloodPressure/Bmi/Medication/DiseaseProfile)
├─ analyzer/         Analyzer 5개 + Result record 5개 (BloodSugar는 식전 그룹 확장됨)
├─ util/
└─ web/
   ├─ ...
   └─ analysis/
      ├─ HealthAnalysisController.java
      └─ dto/
         └─ HealthAnalysisResponse.java

src/test/java/com/prologue/ballife/
├─ standard/                          ★ 1순위 — 5 클래스 / 90 tests
│  ├─ BloodSugarStandardTest.java        (16)
│  ├─ BmiStandardTest.java               (18)
│  ├─ BloodPressureStandardTest.java     (24)
│  ├─ MedicationStandardTest.java        (13)
│  └─ DiseaseProfileStandardTest.java    (19)
├─ analyzer/                          ★ 2순위 — 1 클래스 / 11 tests
│  └─ BloodSugarAnalyzerTest.java        (11)
└─ service/                           ★ 3순위 — 1 클래스 / 11 tests
   └─ HealthAnalysisServiceTest.java     (11)
```

---

## 5. 지금까지 완료된 작업

### Step 1 — 프로젝트 구조 조사
User 엔티티에 `height`, `weight`, `gender`, `diseaseIndex` 모두 존재 확인. 측정 기록은 `domain.daily.BioValueRecord` 단일 테이블에 `category` 문자열로 구분.

### Step 2 — DTO 신규 생성
`web/analysis/dto/HealthAnalysisResponse.java` — 5개 Analyzer Result + 내부 `Period(type, startDate, endDate)` record.

### Step 3 — Repository + Service
- `repository/medicine/UserMedicineRecordRepository.java` 에 `countByPrescription_User_UserIdAndIntakeDateBetween(Long, LocalDate, LocalDate)` 메서드 추가 (수정)
- `service/HealthAnalysisService.java` 신규 — `analyzeWeekly(userId)` 메인 진입점. User 조회 → 7일 기간 산출 → 혈압·혈당·BMI·복약·질환 분석 → 응답 조립.

### Step 4 — Controller
`web/analysis/HealthAnalysisController.java` — `GET /api/health-analysis/weekly/{userId}` (Swagger Tag 등록, `@RequiredArgsConstructor` 사용).

### Step 5 — Postman 동작 검증 (성공)
- `gradlew bootRun` 으로 서버 기동
- `POST /api/auth/login` → JWT 받음
- `GET /api/health-analysis/weekly/2` + `Authorization: Bearer <토큰>` → **200 OK**
- 응답에 5개 항목 모두 의도대로 채워짐 확인 (식전 분류 살아있는 것 검증됨)

### Step 6 — 테스트 코드 ✅ 완료 (3단계 모두 PASS)

| 순위 | 파일 | tests | 검증 포인트 |
|---|---|---|---|
| 1순위 | standard 5개 클래스 | 90 | 각 구간 경계값 + label + status, 예외 케이스 |
| 2순위 | `analyzer/BloodSugarAnalyzerTest.java` | 11 | 공복/식전/식후 3그룹 분리, 식전이 classifyFasting 재사용, 평균 반올림, 사용 안 한 그룹 필드 null 검증 |
| 3순위 | `service/HealthAnalysisServiceTest.java` | 11 | 인계 문서 §9 시나리오 7개 (4 sub-case 포함). Repository 4 mock + Analyzer 5 실제 객체. 카테고리 분류, intakeIntervals 파싱, ResourceNotFoundException 모두 검증 |
| | | **합계 112** | **PASS 100%** |

**Step 6 실행 명령**:
```
gradlew test --tests "com.prologue.ballife.standard.*"   → 90 PASS
gradlew test --tests "com.prologue.ballife.analyzer.*"   → 11 PASS
gradlew test --tests "com.prologue.ballife.service.*"    → 11 PASS
gradlew test                                              → 112 PASS (전체)
```

### 사전 사전 작업 (Step 6 진입 전, 사용자 동의 후 수정)
혈당 분석을 **공복/식전/식후 3그룹**으로 만드는 (C)안 적용:
- `analyzer/BloodSugarAnalysisResult.java` — 식전 필드 3개 추가 (`preMealValue/Status/Label`)
- `analyzer/BloodSugarAnalyzer.java` — `analyze` 시그니처에 `List<Integer> preMealValues` 인자 추가, 식전 분류는 `classifyFasting` 재사용

### 인계 문서 표현 정정 (3순위 진행 중 발견)
이전 mid 인계 문서 §9에서 "**Repository 5개를 Mock**으로 두고" 라고 적었으나 실제 `HealthAnalysisService` 생성자 의존성은 **Repository 4 + Analyzer 5 (= 9개)**. 3순위에서는 Repository 4개만 mock으로 두고 Analyzer 5개는 실제 객체로 주입했다. 이유:
- Analyzer 5개는 1·2순위 단위 테스트로 이미 검증된 순수 컴포넌트
- Mock하면 status/label까지 stub해야 해서 Service의 데이터 분류·전달 로직이 검증되지 않음
- 실제 객체로 두면 입력 데이터만 조작해서 분류 + 라벨까지 End-to-End 검증 가능

→ 다음 세션에서 비슷한 Service 테스트 시에도 **"Repository는 mock, Analyzer는 실제 객체"** 패턴 유지.

---

## 6. 사전 결정 사항 (반드시 유지)

| 항목 | 결정 | 이유 |
|---|---|---|
| **혈당 분류 (Q1)** | **3그룹 (공복/식전/식후)** | 의학적 정확도 + 데이터 활용 둘 다 잡기 위해 (C)안. `BloodSugar-취침전`은 분석 제외 |
| **식전 분류 기준** | `BloodSugarStandard.classifyFasting` **재사용** | 식전은 마지막 식사 후 4~6시간 경과 → 공복에 준함. `BloodSugarStandard` 자체는 수정 안 함 |
| **분석 기간 (Q2)** | `endDate = today`, `startDate = today - 6` (오늘 포함 7일) | |
| **복약 산출 (Q3)** | 활성 `Prescription`의 `intakeIntervals` 콤마 split × 7일 = scheduled / 7일간 `UserMedicineRecord` 행 수 = taken | |
| **`intakeIntervals` 형식** | 콤마 구분 + `TakenCategory` enum 이름 (case-insensitive). 매칭 안 되는 토큰은 무시(예외 안 던짐) | 백엔드/프론트 모두 형식 미정이라 가장 자연스러운 규약으로 약속 |
| **`BloodSugar-취침전`** | 분석에서 제외 (저녁식후 영향 남아있어 공복도 식후도 아님). 차트/타임라인엔 유지 | |
| **인증** | **이번 단계에선 미적용**. 인증 보강은 Step 7 | 동작 검증 우선 |
| **식단·운동** | Step 10에서 별도 추가 (REFERENCE_ONLY). 데이터 모델 확정 후 | |
| **Service 테스트 mock 정책** | **Repository는 mock, Analyzer는 실제 객체** | Analyzer는 이미 단위 테스트 통과한 순수 컴포넌트. mock하면 검증 깊이 사라짐 |

---

## 7. 트러블슈팅 메모

### 7-1. DB 스키마 어긋남 — 해결 완료
- 증상: `GET /api/health-analysis/weekly/2` 호출 시 500 + `Unknown column 'umr1_0.user_medicine_record_id' in 'field list'`
- 원인: `user_medicine_record` 테이블이 옛 이름(`user_supplement_id` PK) 시절에 만들어진 채 남아있었고, `ddl-auto: update`는 컬럼 rename을 안 함
- 처치: `DROP TABLE user_medicine_record;` 후 서버 재시작 (데이터 비어있어서 가능). 데이터 보존이 필요한 환경이면 ALTER로 rename 마이그레이션 해야 함

### 7-2. BMI 비현실값 — 코드는 정상
- 증상: `bmi.value = 144.6, RISK 초고도 비만`
- 원인: 테스트 데이터(user_id=2)가 `height=66cm, weight=63kg`. 계산식은 정확 (63 / 0.66² = 144.6).
- 처치: 회원가입 입력 단에서 `height >= 100` validator를 거는 게 정답. 분석기는 안 건드림 (다른 사람 영역).

### 7-3. `intakeIntervals` 형식 미정 위험
- 백엔드 어디에도 형식 검증/파싱 코드 없음. 프론트 `PrescriptionRegisterModal.jsx` 도 현재 `intakeIntervals` 필드를 payload에 안 보냄
- 현 코드는 콤마 split + `TakenCategory` enum 이름 매칭 (case-insensitive)로 가정. 매칭 실패 시 토큰 무시, 0 반환
- 프론트 또는 다른 시스템이 다른 형식(한글, JSON 배열 등) 전송하면 `scheduledCount=0` 으로 떨어짐 (안전하지만 분석이 빈값)
- **Service 테스트 시나리오 6**에서 `null` / `"MORNING,DINNER"` / `"morning, dinner"` / `"아침,저녁"` 네 가지 케이스로 명시 검증됨

### 7-4. `BioValueRecord.category` prefix 매칭
- `BioValueRecordRepository.findByUserAndCategoryAndRecordDateBetween` 가 `LIKE 'BloodSugar%'` prefix로 잡음
- `"BloodSugar"` 한 번 호출 후 Service에서 카테고리 접미사(공복/식전/식후/취침전) 보고 3그룹 분류

### 7-5. SecurityConfig 미등록 — 의도된 상태
- 우리 `/api/health-analysis/**`는 `.anyRequest().authenticated()` 정책에 걸려 JWT 필수
- Step 7에서 `@PreAuthorize`로 본인 데이터만 접근 가능하게 보강 예정

### 7-6. Mockito strict stubbing 함정 (Step 6 3순위에서 발견)
- 증상: `org.mockito.exceptions.misusing.PotentialStubbingProblem`
- 발생 상황: `BioValueRecordRepository.findByUserAndCategoryAndRecordDateBetween`를 `eq("BloodSugar")` 매처로만 stub 했는데, Service가 같은 메서드를 `"BloodPressure"` 카테고리로도 호출 → strict Mockito가 "stub 인자와 실제 호출 인자 불일치"로 폭발.
- 잘못된 가정: "stub 안 한 호출은 default 반환"이 strict 모드에서 부분적으로만 맞음. **같은 메서드에 다른 인자로 stub이 존재하면 strict가 발동**한다.
- 해결: 사용 안 하는 카테고리에도 빈 리스트(`List.of()`)를 명시적으로 stub 추가. 의도가 더 명확해지는 부수 효과.
- **다음 세션 규칙**: Service 테스트에서 같은 Repository 메서드를 여러 카테고리/인자로 호출하면 **모든 호출 패턴에 stub을 명시**해라. 대안인 `@MockitoSettings(strictness = Strictness.LENIENT)` 전체 lenient는 함정을 가리니까 쓰지 마라.

---

## 8. 테스트 컨벤션 (이미 검증된 패턴 — 그대로 따라가기)

### 8-1. 단위 테스트 (standard, analyzer 패키지)

```java
package com.prologue.ballife.<영역>;   // 메인 패키지와 미러링

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
            // given
            int value = 69;
            // when
            var result = Standard.classify(value);
            // then
            assertThat(result).isEqualTo(Standard.Range.LOW);
            assertThat(result.status).isEqualTo("LOW");
            assertThat(result.label).isEqualTo("너무 낮음 (70 미만)");
        }

        @Test
        @DisplayName("예외 케이스")
        void exception_case() {
            assertThatThrownBy(() -> Standard.something(0))
                    .isInstanceOf(IllegalArgumentException.class)
                    .hasMessageContaining("must be > 0");
        }
    }
}
```

### 8-2. Service 테스트 (Mockito 사용)

```java
@ExtendWith(MockitoExtension.class)
class <Service>Test {

    @Mock <Repo1> repo1;
    // ... Repository만 @Mock. Analyzer는 실제 객체 주입.

    HealthAnalysisService service;

    @BeforeEach
    void setUp() {
        service = new HealthAnalysisService(
            repo1, repo2, repo3, repo4,
            new BloodPressureAnalyzer(), new BloodSugarAnalyzer(), new BmiAnalyzer(),
            new MedicationAnalyzer(), new DiseaseProfileAnalyzer()
        );
    }

    // 엔티티 생성은 헬퍼 메서드로 (Lombok @Builder 활용)
    private User stubUser(Long id, Double h, Double w, String disease) { ... }

    @Test
    void scenario_1() {
        // when(repo.method(...)).thenReturn(...)로 stub
        // ArgumentMatchers: any(User.class), eq("BloodSugar"), anyLong() ...
        // assertThat(...) 어서션
    }
}
```

### 패턴 룰
- 파일 위치: 메인 패키지와 미러링 (예: `com.prologue.ballife.analyzer.BloodSugarAnalyzerTest`)
- 클래스명: `대상명 + Test`
- 그룹화: `@Nested` 클래스로 메서드/기능별 묶음
- 라벨: `@Test` + `@DisplayName` 한국어 병행 (메서드명은 짧게)
- 주석: 첫 케이스에만 `// given - when - then` (반복 케이스에선 생략 OK)
- 어서션: AssertJ (`assertThat(...).isEqualTo(...)`, `.isEmpty()`, `.hasSize(n)`, `.extracting(::method)` 등)
- 예외: `assertThatThrownBy(() -> ...).isInstanceOf(Exception.class).hasMessageContaining("...")`
- Spring 컨텍스트 **사용 안 함** (`@SpringBootTest` 없이 순수 단위 테스트 또는 Mockito 단독). 빠르게 실행됨
- 라벨(label)/상태(status)까지 같이 검증 — LLM 출력 정확성이 여기 달려있음
- 경계값 위주 (각 구간의 양 끝 + 극단값 1~2개)
- **다른 그룹/필드 누출 방지**: 한 그룹만 입력한 시나리오에서는 **사용 안 한 그룹의 필드들이 null인지** 명시적 `isNull()` 어서션으로 박을 것 (Step 6 2순위 B·D 그룹 패턴)

### 실행 명령
```bash
# 단일 클래스
gradlew test --tests "com.prologue.ballife.standard.BloodSugarStandardTest"

# 패키지 전체
gradlew test --tests "com.prologue.ballife.standard.*"

# 전체
gradlew test
```

결과 XML: `build/test-results/test/TEST-*.xml` (`testsuite name="..." tests="N" failures="0" errors="0"` 확인)

---

## 9. 남은 작업

### Step 7 — 인증·권한 보강 ← 다음 세션의 첫 작업
- `SecurityConfig`에 `/api/health-analysis/**` 등록 (**다른 사람 코드, 팀원 동의 받아야 함**)
- `@PreAuthorize`로 본인 데이터만 접근 가능하게 (또는 PathVariable userId 대신 SecurityContext에서 가져오기 — 더 안전)
- 작업 계획은 이번 세션 끝에 짜둠. 실제 코드 수정은 팀 합의 후 진행.

### Step 8 — 분석 기간 확장
- Service: `analyze(userId, start, end)` 핵심 메서드로 일반화 (`analyzeWeekly`는 위 메서드 호출)
- Controller: `GET /api/health-analysis/monthly/{userId}`, `GET /api/health-analysis/range/{userId}?start=&end=` 추가
- 하위 호환 유지

### Step 9 — Python ai-service 호출 클라이언트 ⏸ (외부 의존성)
팀원이 Python ai-service의 입력 JSON 명세 확정 후 진행:
- `service/AiServiceClient.java` (`RestTemplate` or `WebClient`)
- URL은 `application.yml` 외부화

### Step 10 — 식단·운동 항목 추가 ⏸ (제품 결정 대기)
- `HealthAnalysisResponse`에 `meal`, `exercise` 필드 추가
- REFERENCE_ONLY (정상/위험 판정 ❌)
- 어떤 합산을 보여줄지(일평균 kcal / 권장량 대비 / 빈도) 결정 후 진행

---

## 10. 작업 방식 규칙

| # | 규칙 |
|---|---|
| 10-1 | **진행 사항을 모두 한국어로 설명.** 파일 만들기 **전**에 무엇/어디/왜 설명, 만든 **후**에 핵심 로직 요약. 어려운 자바/Spring 문법(어노테이션, record, 제네릭)은 풀어서 설명 |
| 10-2 | **추측 금지.** 엔티티 필드명, Repository 메서드 이름 등 실제 파일 열어 확인. 모르면 먼저 물어보기 |
| 10-3 | **한 번에 한 단계씩.** 각 Step 끝나면 확인 받고 다음으로. 5개 파일 한 번에 우르르 금지 (단, 패턴이 검증된 후라면 같은 패턴의 여러 파일 동시 작성 OK — Step 6 1순위 5개를 그렇게 진행함) |
| 10-4 | **기존 기능 로직 변경 금지.** 다른 사람의 controller/service/repository 함부로 수정 ❌. 수정 필요시 사용자 동의 받기. 이미 동의 받고 수정한 파일들(`BloodSugarAnalyzer`, `BloodSugarAnalysisResult`, `UserMedicineRecordRepository`, `SecurityConfig` Step 7 예정)은 추가 수정 시에도 매번 동의 받기 |
| 10-5 | **에러나 막힘 시 임의 우회 금지.** 에러 메시지 그대로 사용자에게 보여주고 같이 해결. 테스트 FAIL 나오면 어떤 케이스가 깨졌는지 그대로 보고. Mockito 같은 함정은 **테스트 코드를 먼저 재검토** (Service 코드 수정 금지). |

---

## 11. 시작 지시

새 세션은 위 1~10을 다 읽고 다음 응답:

1. "이전 진행 상황을 이해했다"는 짧은 확인 (1~2문장)
2. 집 환경에서 `gradlew test` 실행해서 **112 PASS** 나오는지 검증 후 보고
3. 다음 작업 — **Step 7 인증·권한 보강** 진행 계획 간단 요약. 단, `SecurityConfig`가 다른 사람 코드라서 **팀원 합의 + 사용자 동의 후에만** 실제 수정.
4. 사용자 확인 대기

코드부터 짜지 마라. 계획 동의 받은 다음 작성 → `gradlew test` 실행 → 결과 보고 순으로 진행.

### 다음 세션의 첫 작업
> **Step 7 — 인증·권한 보강. 사전 조사·결정사항은 이미 §12에 박혀있음. 코드 작성부터 바로 시작 가능.**
> 상세 작업 항목은 §12-3 참조.

---

## 12. Step 7 사전 조사 및 결정사항 (이전 세션 종료 직전 정리)

> 다음 세션은 아래 결정사항을 그대로 가지고 코드 작성에 바로 진입할 수 있다.
> §11 "시작 지시"의 1~2번(이해 확인 + `gradlew test` 112 PASS 검증)만 하고 §12-3 작업 항목으로 직행.

### 12-1. 코드 사전 조사 결과 (이미 검증 완료)

**(가) `SecurityConfig`는 수정 불필요** — `/api/health-analysis/**`가 명시 등록되어 있지 않지만 [SecurityConfig.java:73](../src/main/java/com/prologue/ballife/config/SecurityConfig.java#L73)의 `.anyRequest().authenticated()` 규칙에 자동으로 묶여서 **이미 JWT 필수 상태**. Step 5 Postman 검증 시 Bearer 토큰 줘야만 200 OK 나온 이유가 이것.
→ **`SecurityConfig` 절대 손대지 마라. 팀원 합의 부담 0.**

**(나) `CustomUserDetails`에 `userId` 필드 노출됨** — [CustomUserDetails.java:16](../src/main/java/com/prologue/ballife/security/CustomUserDetails.java#L16). `@Getter`로 `getUserId()` 자동 생성. `JwtAuthenticationFilter`가 SecurityContext의 principal에 `CustomUserDetails`를 박아넣음.
→ Controller에서 `@AuthenticationPrincipal CustomUserDetails me` 한 줄로 `me.getUserId()` 바로 꺼낼 수 있음.

### 12-2. 결정사항 (사용자 확정)

| 항목 | 결정 | 비고 |
|---|---|---|
| **접근 방식** | **안 B**: PathVariable 제거 + `@AuthenticationPrincipal` | 입력 자체가 불가능한 게 검증보다 강한 보호. `@EnableMethodSecurity` 도입의 전역 부수효과도 회피 |
| **URL 정책** | **병존**: `/weekly` 신규 + `/weekly/{userId}` 유지 (deprecated) | 프론트가 기존 URL 호출하는지 확인 안 하고 안전하게 가는 선택 |
| **Deprecated 표시** | `@Deprecated` 어노테이션 + Swagger `@Operation(description=...)`에 "deprecated, /weekly 사용 권장" **둘 다** 명시 | 한쪽만 박으면 누락될 위험 |
| **테스트 전략** | 우선 **옵션 (1) `@WebMvcTest` + `@WithMockUser`** 시도. 시간 부족하면 **옵션 (3) Postman 수동 검증**으로 폴백 | 실제 작업 시점에 한 번 더 결정. 옵션 (1) 채택 시 `HealthAnalysisService`는 `@MockBean`으로 mock (Service 로직 자체는 이미 3순위에서 검증됨) |
| **변경 범위** | `HealthAnalysisController`만 (Step 4에서 내가 만든 본인 코드). 팀원 합의 불필요 | 프론트팀 URL 추가 알림은 사용자가 별도 처리 |
| **하위 호환** | 기존 `/weekly/{userId}`는 deprecated 표시만 하고 동작은 그대로 유지. 본인 토큰으로 다른 userId 넣으면 일단 200 OK 나오는 상태도 유지 (병존 기간 단순화) | 향후 안 B로 완전 전환 시 기존 엔드포인트 제거 — Step 7 완료 후 별도 단계 |

### 12-3. Step 7 작업 항목 (다음 세션 첫 작업)

**1) Controller 수정** — [HealthAnalysisController.java](../src/main/java/com/prologue/ballife/web/analysis/HealthAnalysisController.java)
- 신규 메서드 추가: `GET /api/health-analysis/weekly` — `@AuthenticationPrincipal CustomUserDetails me` 파라미터로 `me.getUserId()` 꺼내서 `service.analyzeWeekly(userId)` 호출
- 기존 `GET /api/health-analysis/weekly/{userId}` — `@Deprecated` 어노테이션 + Swagger `@Operation(description=...)`에 "deprecated, /weekly 사용 권장" 추가. 동작/구현은 그대로 유지
- Swagger `@Tag`, `@RequiredArgsConstructor` 그대로
- 추가 import: `org.springframework.security.core.annotation.AuthenticationPrincipal`, `com.prologue.ballife.security.CustomUserDetails`

**2) 테스트 작성 (옵션 1 선택 시)** — `src/test/java/com/prologue/ballife/web/analysis/HealthAnalysisControllerTest.java`
- `@WebMvcTest(HealthAnalysisController.class)` 슬라이스 테스트
- `MockMvc`로 HTTP 호출 시뮬레이션
- `HealthAnalysisService`는 `@MockBean`으로 mock (Service 자체 로직은 3순위에서 검증됨)
- 케이스 후보 (5개 정도):
  - 신규 `/weekly` + `@WithMockUser(...principal=CustomUserDetails)` → 200 OK + `service.analyzeWeekly(me.userId)` 호출 검증
  - 신규 `/weekly` 인증 없이 → 401 "로그인이 필요합니다." (JSON 메시지)
  - 기존 `/weekly/{userId}` + `@WithMockUser` → 200 OK (하위 호환)
  - 기존 `/weekly/{userId}` 인증 없이 → 401
  - 신규 `/weekly`에서 principal의 userId가 정확히 service로 전달되는지 `ArgumentCaptor`로 검증
- **주의**: `@WebMvcTest`는 SecurityConfig를 자동으로 로드함. JwtAuthenticationFilter도 같이 로드되니 `@WithMockUser`로 SecurityContext 직접 세팅하는 게 가장 깔끔. JWT 토큰 발급/검증은 이 테스트 범위 아님.

**3) Postman 검증**
- 신규 `/weekly` + Bearer 토큰 → 200 OK + 본인(token의 user) 데이터
- 신규 `/weekly` 인증 없이 → 401
- 기존 `/weekly/{userId}` + Bearer 토큰 → 200 OK (하위 호환 유지 검증)
- 신규 응답 = 기존 응답(같은 userId) 동일 데이터 검증

**4) 인계 문서 갱신 → `handoff-step7-done.md` (또는 일관성 위해 `handoff-step7-mid.md` → `handoff-step7-done.md` 흐름)**
- Step 7 완료 표시
- 컨벤션 §8-3 Controller 테스트 패턴 추가 (옵션 1 선택 시)
- §12 → §13 (또는 §12 자체를 "완료"로 이동) — 정리 방식은 그때 결정
- 다음 작업: Step 8 분석 기간 확장으로 갱신

### 12-4. Step 7 완료 시점 누적 테스트 예상치
- 옵션 (1) 채택: 112 + 5 = **117 PASS** 예상
- 옵션 (3) 채택: 112 그대로 + Postman 수동 검증 결과 (자동화 X)
