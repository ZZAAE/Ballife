# Ballife 백엔드 — Step 6 진행 중 인계 문서

> 작성 시점: Step 6 (테스트 코드 작성) 1순위 완료, 2순위 시작 전.
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

- **위치**: `C:\gabia\Ballife\Ballife`
- **별도 프로젝트**: `C:\gabia\Ballife\ai-service` (Python, 팀원 영역)
- **언어**: Java 17 (`build.gradle` toolchain)
- **프레임워크**: Spring Boot 3.5.12, Spring Data JPA, MySQL, Spring Security, JWT, Swagger
- **DB**: MySQL `project_ballife` @ localhost:3306 (user=`ballife` / pw=`1234`), MongoDB(localhost:27017, Ballife)
- **base 패키지**: `com.prologue.ballife`
- **빌드/실행**:
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
├─ service/          도메인 Service + HealthAnalysisService ★ 신규
├─ standard/         ★ 상수 5개 (이전 세션 이전부터 존재)
├─ analyzer/         ★ Analyzer 5개 + Result record 5개 (BloodSugar 이번에 확장됨)
├─ util/
└─ web/
   ├─ ...
   └─ analysis/      ★ 신규
      ├─ HealthAnalysisController.java
      └─ dto/
         └─ HealthAnalysisResponse.java

src/test/java/com/prologue/ballife/
└─ standard/         ★ 1순위 테스트 5개 작성 완료
   ├─ BloodSugarStandardTest.java        (16)
   ├─ BmiStandardTest.java               (18)
   ├─ BloodPressureStandardTest.java     (24)
   ├─ MedicationStandardTest.java        (13)
   └─ DiseaseProfileStandardTest.java    (19)
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

### Step 6 — 테스트 코드 (1순위 완료)
`gradlew test --tests "com.prologue.ballife.standard.*"` 실행 결과: **5개 클래스, 총 90개 테스트, 100% PASS**.

| 파일 | 테스트 수 | 검증 포인트 |
|---|---|---|
| BloodSugarStandardTest | 16 | 공복/식후 각 구간 경계값 + label + status |
| BmiStandardTest | 18 | 계산 + 6구간 경계 + classifyFrom + 0/음수 예외 |
| BloodPressureStandardTest | 24 | 수축기·이완기 등급 + GRADE_MAX 시나리오 + 이완기 1등급 안 나오는지 0~200 전수검사 + Grade.of 예외 |
| MedicationStandardTest | 13 | 이행률 반올림 + 경계값(0/59/60/79/80/100) + scheduled=0 예외 |
| DiseaseProfileStandardTest | 19 | null/공백/모르는 키/NONE 대소문자/모르는 subtype/연속 콤마 안전 처리 |

### 사전 사전 작업 (Step 6 진입 전, 사용자 동의 후 수정)
혈당 분석을 **공복/식전/식후 3그룹**으로 만드는 (C)안 적용:
- `analyzer/BloodSugarAnalysisResult.java` — 식전 필드 3개 추가 (`preMealValue/Status/Label`)
- `analyzer/BloodSugarAnalyzer.java` — `analyze` 시그니처에 `List<Integer> preMealValues` 인자 추가, 식전 분류는 `classifyFasting` 재사용

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

### 7-4. `BioValueRecord.category` prefix 매칭
- `BioValueRecordRepository.findByUserAndCategoryAndRecordDateBetween` 가 `LIKE 'BloodSugar%'` prefix로 잡음
- `"BloodSugar"` 한 번 호출 후 Service에서 카테고리 접미사(공복/식전/식후/취침전) 보고 3그룹 분류

### 7-5. SecurityConfig 미등록 — 의도된 상태
- 우리 `/api/health-analysis/**`는 `.anyRequest().authenticated()` 정책에 걸려 JWT 필수
- Step 7에서 `@PreAuthorize`로 본인 데이터만 접근 가능하게 보강 예정

---

## 8. 테스트 컨벤션 (이미 검증된 패턴 — 그대로 따라가기)

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

### 패턴 룰
- 파일 위치: 메인 패키지와 미러링 (예: `com.prologue.ballife.analyzer.BloodSugarAnalyzerTest`)
- 클래스명: `대상명 + Test`
- 그룹화: `@Nested` 클래스로 메서드/기능별 묶음
- 라벨: `@Test` + `@DisplayName` 한국어 병행 (메서드명은 짧게)
- 주석: 첫 케이스에만 `// given - when - then` (반복 케이스에선 생략 OK)
- 어서션: AssertJ (`assertThat(...).isEqualTo(...)`, `.isEmpty()`, `.hasSize(n)`, `.extracting(::method)` 등)
- 예외: `assertThatThrownBy(() -> ...).isInstanceOf(Exception.class).hasMessageContaining("...")`
- Spring 컨텍스트 **사용 안 함** (`@SpringBootTest` 없이 순수 단위 테스트). 빠르게 실행됨
- 라벨(label)/상태(status)까지 같이 검증 — LLM 출력 정확성이 여기 달려있음
- 경계값 위주 (각 구간의 양 끝 + 극단값 1~2개)

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

### Step 6 — 테스트 코드 (계속)

#### 2순위 (다음 차례) ← 여기서부터 시작
`src/test/java/com/prologue/ballife/analyzer/BloodSugarAnalyzerTest.java`

이번 세션에서 식전 그룹이 추가된 **회귀 방지 우선**. 시나리오:
- 공복만 / 식전만 / 식후만 → 해당 필드만 채워지고 나머지는 null
- 빈 리스트 / null → 모든 필드 null
- 평균 계산 (홀/짝수 개수, 반올림)
- 식전이 `BloodSugarStandard.classifyFasting` 기준으로 분류되는지 (공복과 같은 label 나옴)
- 한 그룹에 여러 값 → 평균 후 분류

예상 10~12개 테스트.

#### 3순위
`src/test/java/com/prologue/ballife/service/HealthAnalysisServiceTest.java` (Mockito 사용)

5개 Repository를 Mock으로 두고:
- 전체 NORMAL 시나리오
- 한 항목만 RISK
- 측정 0건 (각 필드 null로 반환되는지)
- 식전만 있고 공복 없음 → `fastingValue=null, preMealValue=값`
- `BloodSugar-취침전` 데이터 1건만 있음 → 모든 혈당 필드 null
- `intakeIntervals` 케이스별 (`null` / `"MORNING,DINNER"` / `"morning, dinner"` / `"아침,저녁"`)
- 보유 질환 다중 (3개 질환)

### Step 7 — 인증·권한 보강
- `SecurityConfig`에 `/api/health-analysis/**` 등록 (다른 사람 코드, **동의 받아야 함**)
- `@PreAuthorize`로 본인 데이터만 접근 가능하게 (또는 PathVariable userId 대신 SecurityContext에서 가져오기 — 더 안전)

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
| 5-1 | **진행 사항을 모두 한국어로 설명.** 파일 만들기 **전**에 무엇/어디/왜 설명, 만든 **후**에 핵심 로직 요약. 어려운 자바/Spring 문법(어노테이션, record, 제네릭)은 풀어서 설명 |
| 5-2 | **추측 금지.** 엔티티 필드명, Repository 메서드 이름 등 실제 파일 열어 확인. 모르면 먼저 물어보기 |
| 5-3 | **한 번에 한 단계씩.** 각 Step 끝나면 확인 받고 다음으로. 5개 파일 한 번에 우르르 금지 (단, 패턴이 검증된 후라면 같은 패턴의 여러 파일 동시 작성 OK — 이번에 1순위 5개를 그렇게 진행함) |
| 5-4 | **기존 기능 로직 변경 금지.** 다른 사람의 controller/service/repository 함부로 수정 ❌. 수정 필요시 사용자 동의 받기. 이미 동의 받고 수정한 파일들(`BloodSugarAnalyzer`, `BloodSugarAnalysisResult`, `UserMedicineRecordRepository`, `SecurityConfig` 향후 예정)은 추가 수정 시에도 매번 동의 받기 |
| 5-5 | **에러나 막힘 시 임의 우회 금지.** 에러 메시지 그대로 사용자에게 보여주고 같이 해결. 테스트 FAIL 나오면 어떤 케이스가 깨졌는지 그대로 보고 |

---

## 11. 시작 지시

새 세션은 위 1~10을 다 읽고 다음 응답:

1. "이전 진행 상황을 이해했다"는 짧은 확인 (1~2문장)
2. 다음 작업 — **Step 6 2순위 `BloodSugarAnalyzerTest`** 진행 계획 간단 요약 (어떤 시나리오를 어떤 순서로 검증할지)
3. 사용자 확인 대기

코드부터 짜지 마라. 계획 동의 받은 다음 작성 → `gradlew test --tests "...BloodSugarAnalyzerTest"` 실행 → 결과(PASS 개수 / FAIL 케이스) 보고 순으로 진행.

### 다음 세션의 첫 작업
> **`BloodSugarAnalyzerTest` 작성 시작** — `src/test/java/com/prologue/ballife/analyzer/BloodSugarAnalyzerTest.java`
> 위 8번 컨벤션 그대로 따라가기. 약 10~12개 테스트 예상.