-- ============================================================
-- 혈당 / 혈압 / 복약 더미 데이터 (월간 리포트용)
-- 날짜는 모두 "오늘(CURDATE) 기준 최근 30일" = 오늘-29 ~ 오늘.
-- 월간 리포트가 LocalDate.now() 기준 롤링 30일만 읽으므로,
-- 언제 실행하든 이 스크립트만 돌리면 리포트가 항상 꽉 찬다.
--
-- 사용법:
--   1) 아래 SET @userId 줄의 ? 를 본인 USER_ID(숫자)로 바꾼다.  예) SET @userId = 1;
--      (모르면:  SELECT USER_ID, LOGIN_ID, NICKNAME FROM USER; )
--   2) mysql -u ballife -p1234 --default-character-set=utf8mb4 project_ballife < dummy_health_30days.sql
--      (Workbench 사용 시: 연결 charset 을 utf8mb4 로 두고 통째로 실행)
--
-- ⚠ 한글 카테고리("BloodSugar-공복" 등)가 있으므로 반드시 utf8mb4 로 실행할 것! (안 그러면 글자 깨짐)
-- ⚠ 복약 이행률(분모)은 "그 사용자의 모든 활성 처방전" 기준이라, 기존 처방전이 있으면 70%가 틀어진다.
--    깨끗한 테스트 계정(처방전 없는 사용자) 권장.
-- ============================================================

-- ▼▼▼ 여기에 본인 USER_ID 를 넣으세요 ▼▼▼
SET @userId = ?;   -- <== ? 를 실제 USER_ID 숫자로 변경 (예: 1)

-- (선택) 다시 돌릴 때 중복이 싫으면, 아래 주석을 풀어 최근 30일 더미부터 지우고 시작:
--   ※ 같은 기간에 실제로 기록한 데이터가 있으면 그것도 지워지니 주의!
-- DELETE FROM BIO_VALUE_RECORD
--   WHERE USER_ID = @userId AND RECORD_DATE >= CURDATE() - INTERVAL 29 DAY;
-- DELETE r FROM USER_MEDICINE_RECORD r
--   JOIN PRESCRIPTION p ON r.PRESCRIPTION_ID = p.PRESCRIPTION_ID
--   WHERE p.USER_ID = @userId AND r.INTAKE_DATE >= CURDATE() - INTERVAL 29 DAY;


-- ============================================================
-- Section A. 혈당 / 혈압 / 체중 / 물  →  BIO_VALUE_RECORD (최근 30일)
--   - 재귀 CTE days(n=0..29) 로 날짜 = CURDATE() - n 생성
--   - 값은 (n % …) 로 결정적 변주 → 매 실행 동일, 건강 범위 유지
-- ============================================================

-- 혈당: 공복 (07:00) ── 95~109
INSERT INTO BIO_VALUE_RECORD
  (USER_ID, RECORD_DATE, RECORD_TIME, CATEGORY, BLOODSUGAR, SYSTOLIC_BP, DIASTOLIC_BP, WEIGHT, WATER_INTAKE_CUP)
WITH RECURSIVE days AS (SELECT 0 AS n UNION ALL SELECT n + 1 FROM days WHERE n < 29)
SELECT @userId, CURDATE() - INTERVAL n DAY, '07:00:00', 'BloodSugar-공복',
       95 + (n % 15), NULL, NULL, NULL, NULL
FROM days;

-- 혈당: 점심식전 (12:20) ── 90~100
INSERT INTO BIO_VALUE_RECORD
  (USER_ID, RECORD_DATE, RECORD_TIME, CATEGORY, BLOODSUGAR, SYSTOLIC_BP, DIASTOLIC_BP, WEIGHT, WATER_INTAKE_CUP)
WITH RECURSIVE days AS (SELECT 0 AS n UNION ALL SELECT n + 1 FROM days WHERE n < 29)
SELECT @userId, CURDATE() - INTERVAL n DAY, '12:20:00', 'BloodSugar-점심식전',
       90 + (n % 11), NULL, NULL, NULL, NULL
FROM days;

-- 혈당: 아침식후 (08:40) ── 130~159
INSERT INTO BIO_VALUE_RECORD
  (USER_ID, RECORD_DATE, RECORD_TIME, CATEGORY, BLOODSUGAR, SYSTOLIC_BP, DIASTOLIC_BP, WEIGHT, WATER_INTAKE_CUP)
WITH RECURSIVE days AS (SELECT 0 AS n UNION ALL SELECT n + 1 FROM days WHERE n < 29)
SELECT @userId, CURDATE() - INTERVAL n DAY, '08:40:00', 'BloodSugar-아침식후',
       130 + (n % 30), NULL, NULL, NULL, NULL
FROM days;

-- 혈당: 점심식후 (13:10) ── 132~159
INSERT INTO BIO_VALUE_RECORD
  (USER_ID, RECORD_DATE, RECORD_TIME, CATEGORY, BLOODSUGAR, SYSTOLIC_BP, DIASTOLIC_BP, WEIGHT, WATER_INTAKE_CUP)
WITH RECURSIVE days AS (SELECT 0 AS n UNION ALL SELECT n + 1 FROM days WHERE n < 29)
SELECT @userId, CURDATE() - INTERVAL n DAY, '13:10:00', 'BloodSugar-점심식후',
       132 + (n % 28), NULL, NULL, NULL, NULL
FROM days;

-- 혈당: 저녁식후 (19:40) ── 134~158
INSERT INTO BIO_VALUE_RECORD
  (USER_ID, RECORD_DATE, RECORD_TIME, CATEGORY, BLOODSUGAR, SYSTOLIC_BP, DIASTOLIC_BP, WEIGHT, WATER_INTAKE_CUP)
WITH RECURSIVE days AS (SELECT 0 AS n UNION ALL SELECT n + 1 FROM days WHERE n < 29)
SELECT @userId, CURDATE() - INTERVAL n DAY, '19:40:00', 'BloodSugar-저녁식후',
       134 + (n % 25), NULL, NULL, NULL, NULL
FROM days;

-- 혈압: 아침 (07:15) ── 수축 118~138 / 이완 76~88
INSERT INTO BIO_VALUE_RECORD
  (USER_ID, RECORD_DATE, RECORD_TIME, CATEGORY, BLOODSUGAR, SYSTOLIC_BP, DIASTOLIC_BP, WEIGHT, WATER_INTAKE_CUP)
WITH RECURSIVE days AS (SELECT 0 AS n UNION ALL SELECT n + 1 FROM days WHERE n < 29)
SELECT @userId, CURDATE() - INTERVAL n DAY, '07:15:00', 'BloodPressure-아침',
       NULL, 118 + (n % 21), 76 + (n % 13), NULL, NULL
FROM days;

-- 혈압: 저녁 (20:30) ── 수축 120~138 / 이완 78~88
INSERT INTO BIO_VALUE_RECORD
  (USER_ID, RECORD_DATE, RECORD_TIME, CATEGORY, BLOODSUGAR, SYSTOLIC_BP, DIASTOLIC_BP, WEIGHT, WATER_INTAKE_CUP)
WITH RECURSIVE days AS (SELECT 0 AS n UNION ALL SELECT n + 1 FROM days WHERE n < 29)
SELECT @userId, CURDATE() - INTERVAL n DAY, '20:30:00', 'BloodPressure-저녁',
       NULL, 120 + (n % 19), 78 + (n % 11), NULL, NULL
FROM days;

-- 체중 (07:05) ── 69.5~71.9 kg
INSERT INTO BIO_VALUE_RECORD
  (USER_ID, RECORD_DATE, RECORD_TIME, CATEGORY, BLOODSUGAR, SYSTOLIC_BP, DIASTOLIC_BP, WEIGHT, WATER_INTAKE_CUP)
WITH RECURSIVE days AS (SELECT 0 AS n UNION ALL SELECT n + 1 FROM days WHERE n < 29)
SELECT @userId, CURDATE() - INTERVAL n DAY, '07:05:00', 'Weight',
       NULL, NULL, NULL, 69.5 + (n % 25) * 0.1, NULL
FROM days;

-- 물 섭취 (22:00) ── 6~12 잔
INSERT INTO BIO_VALUE_RECORD
  (USER_ID, RECORD_DATE, RECORD_TIME, CATEGORY, BLOODSUGAR, SYSTOLIC_BP, DIASTOLIC_BP, WEIGHT, WATER_INTAKE_CUP)
WITH RECURSIVE days AS (SELECT 0 AS n UNION ALL SELECT n + 1 FROM days WHERE n < 29)
SELECT @userId, CURDATE() - INTERVAL n DAY, '22:00:00', 'WaterIntake',
       NULL, NULL, NULL, NULL, 6 + (n % 7)
FROM days;


-- ============================================================
-- Section B. 복약  →  PRESCRIPTION + USER_MEDICINE + USER_MEDICINE_RECORD
--   - 처방전 1건: 하루 3회(MORNING,DINNER,BEDTIME) → 예정 = 3 × 30 = 90
--   - 복용 기록: 90건 후보 중 결정적으로 27건 누락 → 63건 → 63/90 = 70.0% (CAUTION)
-- ============================================================

-- 1) 처방전 (활성, 하루 3회)
INSERT INTO PRESCRIPTION
  (USER_ID, P_CATEGORY, PRESCRIPTION_NAME, PRESCRIPTION_DATE, MEMO, INTAKEINTERVALS, DOSAGE, IS_DELETED)
VALUES
  (@userId, 'MEDICINE', '혈압약', CURDATE() - INTERVAL 29 DAY, '아침/저녁/취침 복용', 'MORNING,DINNER,BEDTIME', '1정', FALSE);

SET @prescriptionId = LAST_INSERT_ID();

-- 2) 약 목록 (앱 목록 화면용)
INSERT INTO USER_MEDICINE
  (PRESCRIPTION_ID, MEDICINE_NAME, SUPPLEMENT_ID)
VALUES
  (@prescriptionId, '암로디핀', NULL);

-- 3) 복용 기록 (최근 30일, 이행률 ~70%)
--    days(0..29) × {MORNING,DINNER,BEDTIME} = 90건 후보.
--    (3n+slot) 은 0..89 를 정확히 1번씩 → %10 잔차 0,1,2 인 27건만 누락 → 정확히 63건.
INSERT INTO USER_MEDICINE_RECORD
  (PRESCRIPTION_ID, INTAKE_DATE, INTAKE_TIME, SUPPLEMENT_ID, TAKEN_CATEGORY)
WITH RECURSIVE days AS (SELECT 0 AS n UNION ALL SELECT n + 1 FROM days WHERE n < 29)
SELECT @prescriptionId, CURDATE() - INTERVAL d.n DAY, s.t, NULL, s.cat
FROM days d
CROSS JOIN (
  SELECT 'MORNING' AS cat, '08:00:00' AS t, 0 AS slot
  UNION ALL SELECT 'DINNER',  '19:00:00', 1
  UNION ALL SELECT 'BEDTIME', '22:30:00', 2
) s
WHERE (d.n * 3 + s.slot) % 10 >= 3;   -- 잔차 0,1,2(=3/10) 누락 → 63/90 = 70%


-- ============================================================
-- 검증 쿼리 (실행 후 확인용)
-- ============================================================
-- 혈당/혈압 카테고리별 행 수:
--   SELECT CATEGORY, COUNT(*) FROM BIO_VALUE_RECORD
--     WHERE USER_ID = @userId AND RECORD_DATE >= CURDATE() - INTERVAL 29 DAY
--     GROUP BY CATEGORY;
-- 복약 기록 수 (63 기대):
--   SELECT COUNT(*) FROM USER_MEDICINE_RECORD r
--     JOIN PRESCRIPTION p ON r.PRESCRIPTION_ID = p.PRESCRIPTION_ID
--     WHERE p.USER_ID = @userId AND r.INTAKE_DATE >= CURDATE() - INTERVAL 29 DAY;
--   → 이행률 = 63 / (3 × 30 = 90) = 70%  (CAUTION)

-- ============================================================
-- 전체 정리(롤백) — 이 스크립트로 넣은 더미만 지우려면:
-- ============================================================
-- DELETE FROM BIO_VALUE_RECORD
--   WHERE USER_ID = @userId AND RECORD_DATE >= CURDATE() - INTERVAL 29 DAY;
-- DELETE r FROM USER_MEDICINE_RECORD r
--   JOIN PRESCRIPTION p ON r.PRESCRIPTION_ID = p.PRESCRIPTION_ID
--   WHERE p.USER_ID = @userId AND p.PRESCRIPTION_NAME = '혈압약';
-- DELETE um FROM USER_MEDICINE um
--   JOIN PRESCRIPTION p ON um.PRESCRIPTION_ID = p.PRESCRIPTION_ID
--   WHERE p.USER_ID = @userId AND p.PRESCRIPTION_NAME = '혈압약';
-- DELETE FROM PRESCRIPTION
--   WHERE USER_ID = @userId AND PRESCRIPTION_NAME = '혈압약';
