-- ============================================================
--  Ballife 더미 기록 데이터 (portable / 파라미터화)
--  기간: 2026-06-01 ~ 2026-06-11 (11일)  ※ 06-10/06-11 은 데모용 미래 데이터
--  포함: 생체수치(혈당/혈압/체중/수분) · 식사(+음식 영양) · 복약(혈압약) · 운동
--
--  ▶ 사용법 (다른 컴퓨터에서도 동일):
--    1) 아래 SET @USER_ID 값을 본인 USER_ID 로만 바꾼다.
--    2) 전체 실행.
--       - CLI:        mysql -u ballife -p project_ballife < dummy_records.sql
--       - Workbench:  파일 열기 → 번개(⚡) 실행
--
--  ▶ 메모
--    - 맨 앞에 같은 기간(6/1~6/11) 정리(DELETE) 블록이 있어, 여러 번 실행해도
--      중복 없이 항상 깨끗하게 재시드됩니다. ("지우고 한 번에 재시드")
--    - 혈압약 처방은 해당 유저에게 없으면 자동 생성하고, 있으면 재사용합니다.
--    - 운동: 이 파일은 MySQL user_exercise 행만 넣습니다. 운동 '종류명'(exercise_type_id 는
--      머신마다 다른 MongoDB ObjectId)과 '세트/중량/횟수/시간'(MongoDB user_exercise_detail)
--      까지 채우려면, 실행 후 seed/seed_exercise.mjs 를 1회 실행하세요. (seed/README.md 참고)
--      ※ 팀원 PC 에서 운동이 제대로 보이려면 이 단계가 필수입니다.
--    - 깨끗한 DB(해당 날짜 기록 없음) 기준입니다.
-- ============================================================

-- ▼▼▼ 여기 ID 만 바꾸세요 ▼▼▼
SET @USER_ID := 1;
-- ▲▲▲ 여기 ID 만 바꾸세요 ▲▲▲

START TRANSACTION;

-- ===== 혈압약 처방 확보 (없으면 생성, 있으면 재사용) → @PRESCRIPTION_ID =====
SET @PRESCRIPTION_ID := (
  SELECT prescription_id FROM PRESCRIPTION
  WHERE user_id = @USER_ID
    AND prescription_name = '혈압약'
    AND intakeintervals = 'MORNING,DINNER,BEDTIME'
    AND (is_deleted = 0 OR is_deleted IS NULL)
  ORDER BY prescription_id DESC LIMIT 1
);
INSERT INTO PRESCRIPTION (user_id, p_category, prescription_name, prescription_date, intakeintervals, dosage, is_deleted)
SELECT @USER_ID, 'MEDICINE', '혈압약', '2026-06-01', 'MORNING,DINNER,BEDTIME', '1정', 0
FROM dual WHERE @PRESCRIPTION_ID IS NULL;
SET @PRESCRIPTION_ID := COALESCE(@PRESCRIPTION_ID, LAST_INSERT_ID());


-- ============================================================
-- 0) 같은 유저·같은 기간(2026-06-01 ~ 2026-06-11) 기존 기록 정리
--    → 이 블록 덕분에 파일을 여러 번 실행해도 중복 없이 깨끗하게 재시드됩니다.
--    (이 기간에 실제로 직접 기록한 데이터가 있으면 함께 지워지니 주의)
-- ============================================================
DELETE FROM MEAL_ITEM
  WHERE meal_id IN (SELECT meal_id FROM MEAL WHERE user_id = @USER_ID AND meal_date BETWEEN '2026-06-01' AND '2026-06-11');
DELETE FROM MEAL          WHERE user_id = @USER_ID AND meal_date   BETWEEN '2026-06-01' AND '2026-06-11';
DELETE FROM BIO_VALUE_RECORD WHERE user_id = @USER_ID AND record_date BETWEEN '2026-06-01' AND '2026-06-11';
DELETE r FROM USER_MEDICINE_RECORD r
  JOIN PRESCRIPTION p ON p.prescription_id = r.prescription_id
  WHERE p.user_id = @USER_ID AND r.intake_date BETWEEN '2026-06-01' AND '2026-06-11';
DELETE FROM user_exercise WHERE user_id = @USER_ID AND exercise_date BETWEEN '2026-06-01' AND '2026-06-11';


-- ============================================================
-- 1) 생체 수치 (BIO_VALUE_RECORD) : 2026-06-01 .. 2026-06-11 (11일 x 9건 = 99건)
--    건강해지는 완만한 하향 추세 + 미세 노이즈. user_id = @USER_ID
-- ============================================================

-- 2026-06-01
INSERT INTO BIO_VALUE_RECORD (user_id, record_date, record_time, category, bloodsugar, systolic_bp, diastolic_bp, weight, water_intake_cup) VALUES
(@USER_ID, '2026-06-01', '07:00:00', 'BloodSugar-공복', 98, NULL, NULL, NULL, NULL),
(@USER_ID, '2026-06-01', '07:05:00', 'Weight', NULL, NULL, NULL, 69.8, NULL),
(@USER_ID, '2026-06-01', '07:15:00', 'BloodPressure-아침', NULL, 121, 79, NULL, NULL),
(@USER_ID, '2026-06-01', '08:40:00', 'BloodSugar-아침식후', 134, NULL, NULL, NULL, NULL),
(@USER_ID, '2026-06-01', '12:20:00', 'BloodSugar-점심식전', 93, NULL, NULL, NULL, NULL),
(@USER_ID, '2026-06-01', '13:10:00', 'BloodSugar-점심식후', 135, NULL, NULL, NULL, NULL),
(@USER_ID, '2026-06-01', '19:40:00', 'BloodSugar-저녁식후', 137, NULL, NULL, NULL, NULL),
(@USER_ID, '2026-06-01', '20:30:00', 'BloodPressure-저녁', NULL, 123, 80, NULL, NULL),
(@USER_ID, '2026-06-01', '22:00:00', 'WaterIntake', NULL, NULL, NULL, NULL, 4);

-- 2026-06-02
INSERT INTO BIO_VALUE_RECORD (user_id, record_date, record_time, category, bloodsugar, systolic_bp, diastolic_bp, weight, water_intake_cup) VALUES
(@USER_ID, '2026-06-02', '07:00:00', 'BloodSugar-공복', 97, NULL, NULL, NULL, NULL),
(@USER_ID, '2026-06-02', '07:05:00', 'Weight', NULL, NULL, NULL, 69.7, NULL),
(@USER_ID, '2026-06-02', '07:15:00', 'BloodPressure-아침', NULL, 120, 78, NULL, NULL),
(@USER_ID, '2026-06-02', '08:40:00', 'BloodSugar-아침식후', 133, NULL, NULL, NULL, NULL),
(@USER_ID, '2026-06-02', '12:20:00', 'BloodSugar-점심식전', 92, NULL, NULL, NULL, NULL),
(@USER_ID, '2026-06-02', '13:10:00', 'BloodSugar-점심식후', 134, NULL, NULL, NULL, NULL),
(@USER_ID, '2026-06-02', '19:40:00', 'BloodSugar-저녁식후', 136, NULL, NULL, NULL, NULL),
(@USER_ID, '2026-06-02', '20:30:00', 'BloodPressure-저녁', NULL, 122, 80, NULL, NULL),
(@USER_ID, '2026-06-02', '22:00:00', 'WaterIntake', NULL, NULL, NULL, NULL, 5);

-- 2026-06-03
INSERT INTO BIO_VALUE_RECORD (user_id, record_date, record_time, category, bloodsugar, systolic_bp, diastolic_bp, weight, water_intake_cup) VALUES
(@USER_ID, '2026-06-03', '07:00:00', 'BloodSugar-공복', 96, NULL, NULL, NULL, NULL),
(@USER_ID, '2026-06-03', '07:05:00', 'Weight', NULL, NULL, NULL, 69.6, NULL),
(@USER_ID, '2026-06-03', '07:15:00', 'BloodPressure-아침', NULL, 119, 77, NULL, NULL),
(@USER_ID, '2026-06-03', '08:40:00', 'BloodSugar-아침식후', 132, NULL, NULL, NULL, NULL),
(@USER_ID, '2026-06-03', '12:20:00', 'BloodSugar-점심식전', 91, NULL, NULL, NULL, NULL),
(@USER_ID, '2026-06-03', '13:10:00', 'BloodSugar-점심식후', 133, NULL, NULL, NULL, NULL),
(@USER_ID, '2026-06-03', '19:40:00', 'BloodSugar-저녁식후', 135, NULL, NULL, NULL, NULL),
(@USER_ID, '2026-06-03', '20:30:00', 'BloodPressure-저녁', NULL, 121, 79, NULL, NULL),
(@USER_ID, '2026-06-03', '22:00:00', 'WaterIntake', NULL, NULL, NULL, NULL, 5);

-- 2026-06-04 (baseline)
INSERT INTO BIO_VALUE_RECORD (user_id, record_date, record_time, category, bloodsugar, systolic_bp, diastolic_bp, weight, water_intake_cup) VALUES
(@USER_ID, '2026-06-04', '07:00:00', 'BloodSugar-공복', 95, NULL, NULL, NULL, NULL),
(@USER_ID, '2026-06-04', '07:05:00', 'Weight', NULL, NULL, NULL, 69.5, NULL),
(@USER_ID, '2026-06-04', '07:15:00', 'BloodPressure-아침', NULL, 118, 76, NULL, NULL),
(@USER_ID, '2026-06-04', '08:40:00', 'BloodSugar-아침식후', 130, NULL, NULL, NULL, NULL),
(@USER_ID, '2026-06-04', '12:20:00', 'BloodSugar-점심식전', 90, NULL, NULL, NULL, NULL),
(@USER_ID, '2026-06-04', '13:10:00', 'BloodSugar-점심식후', 132, NULL, NULL, NULL, NULL),
(@USER_ID, '2026-06-04', '19:40:00', 'BloodSugar-저녁식후', 134, NULL, NULL, NULL, NULL),
(@USER_ID, '2026-06-04', '20:30:00', 'BloodPressure-저녁', NULL, 120, 78, NULL, NULL),
(@USER_ID, '2026-06-04', '22:00:00', 'WaterIntake', NULL, NULL, NULL, NULL, 6);

-- 2026-06-05
INSERT INTO BIO_VALUE_RECORD (user_id, record_date, record_time, category, bloodsugar, systolic_bp, diastolic_bp, weight, water_intake_cup) VALUES
(@USER_ID, '2026-06-05', '07:00:00', 'BloodSugar-공복', 94, NULL, NULL, NULL, NULL),
(@USER_ID, '2026-06-05', '07:05:00', 'Weight', NULL, NULL, NULL, 69.4, NULL),
(@USER_ID, '2026-06-05', '07:15:00', 'BloodPressure-아침', NULL, 117, 76, NULL, NULL),
(@USER_ID, '2026-06-05', '08:40:00', 'BloodSugar-아침식후', 130, NULL, NULL, NULL, NULL),
(@USER_ID, '2026-06-05', '12:20:00', 'BloodSugar-점심식전', 89, NULL, NULL, NULL, NULL),
(@USER_ID, '2026-06-05', '13:10:00', 'BloodSugar-점심식후', 131, NULL, NULL, NULL, NULL),
(@USER_ID, '2026-06-05', '19:40:00', 'BloodSugar-저녁식후', 133, NULL, NULL, NULL, NULL),
(@USER_ID, '2026-06-05', '20:30:00', 'BloodPressure-저녁', NULL, 119, 77, NULL, NULL),
(@USER_ID, '2026-06-05', '22:00:00', 'WaterIntake', NULL, NULL, NULL, NULL, 6);

-- 2026-06-06
INSERT INTO BIO_VALUE_RECORD (user_id, record_date, record_time, category, bloodsugar, systolic_bp, diastolic_bp, weight, water_intake_cup) VALUES
(@USER_ID, '2026-06-06', '07:00:00', 'BloodSugar-공복', 94, NULL, NULL, NULL, NULL),
(@USER_ID, '2026-06-06', '07:05:00', 'Weight', NULL, NULL, NULL, 69.3, NULL),
(@USER_ID, '2026-06-06', '07:15:00', 'BloodPressure-아침', NULL, 117, 75, NULL, NULL),
(@USER_ID, '2026-06-06', '08:40:00', 'BloodSugar-아침식후', 129, NULL, NULL, NULL, NULL),
(@USER_ID, '2026-06-06', '12:20:00', 'BloodSugar-점심식전', 89, NULL, NULL, NULL, NULL),
(@USER_ID, '2026-06-06', '13:10:00', 'BloodSugar-점심식후', 131, NULL, NULL, NULL, NULL),
(@USER_ID, '2026-06-06', '19:40:00', 'BloodSugar-저녁식후', 132, NULL, NULL, NULL, NULL),
(@USER_ID, '2026-06-06', '20:30:00', 'BloodPressure-저녁', NULL, 119, 77, NULL, NULL),
(@USER_ID, '2026-06-06', '22:00:00', 'WaterIntake', NULL, NULL, NULL, NULL, 7);

-- 2026-06-07
INSERT INTO BIO_VALUE_RECORD (user_id, record_date, record_time, category, bloodsugar, systolic_bp, diastolic_bp, weight, water_intake_cup) VALUES
(@USER_ID, '2026-06-07', '07:00:00', 'BloodSugar-공복', 92, NULL, NULL, NULL, NULL),
(@USER_ID, '2026-06-07', '07:05:00', 'Weight', NULL, NULL, NULL, 69.2, NULL),
(@USER_ID, '2026-06-07', '07:15:00', 'BloodPressure-아침', NULL, 116, 75, NULL, NULL),
(@USER_ID, '2026-06-07', '08:40:00', 'BloodSugar-아침식후', 128, NULL, NULL, NULL, NULL),
(@USER_ID, '2026-06-07', '12:20:00', 'BloodSugar-점심식전', 88, NULL, NULL, NULL, NULL),
(@USER_ID, '2026-06-07', '13:10:00', 'BloodSugar-점심식후', 130, NULL, NULL, NULL, NULL),
(@USER_ID, '2026-06-07', '19:40:00', 'BloodSugar-저녁식후', 132, NULL, NULL, NULL, NULL),
(@USER_ID, '2026-06-07', '20:30:00', 'BloodPressure-저녁', NULL, 118, 76, NULL, NULL),
(@USER_ID, '2026-06-07', '22:00:00', 'WaterIntake', NULL, NULL, NULL, NULL, 6);

-- 2026-06-08
INSERT INTO BIO_VALUE_RECORD (user_id, record_date, record_time, category, bloodsugar, systolic_bp, diastolic_bp, weight, water_intake_cup) VALUES
(@USER_ID, '2026-06-08', '07:00:00', 'BloodSugar-공복', 92, NULL, NULL, NULL, NULL),
(@USER_ID, '2026-06-08', '07:05:00', 'Weight', NULL, NULL, NULL, 69.1, NULL),
(@USER_ID, '2026-06-08', '07:15:00', 'BloodPressure-아침', NULL, 115, 74, NULL, NULL),
(@USER_ID, '2026-06-08', '08:40:00', 'BloodSugar-아침식후', 127, NULL, NULL, NULL, NULL),
(@USER_ID, '2026-06-08', '12:20:00', 'BloodSugar-점심식전', 88, NULL, NULL, NULL, NULL),
(@USER_ID, '2026-06-08', '13:10:00', 'BloodSugar-점심식후', 129, NULL, NULL, NULL, NULL),
(@USER_ID, '2026-06-08', '19:40:00', 'BloodSugar-저녁식후', 131, NULL, NULL, NULL, NULL),
(@USER_ID, '2026-06-08', '20:30:00', 'BloodPressure-저녁', NULL, 117, 75, NULL, NULL),
(@USER_ID, '2026-06-08', '22:00:00', 'WaterIntake', NULL, NULL, NULL, NULL, 7);

-- 2026-06-09 (오늘)
INSERT INTO BIO_VALUE_RECORD (user_id, record_date, record_time, category, bloodsugar, systolic_bp, diastolic_bp, weight, water_intake_cup) VALUES
(@USER_ID, '2026-06-09', '07:00:00', 'BloodSugar-공복', 91, NULL, NULL, NULL, NULL),
(@USER_ID, '2026-06-09', '07:05:00', 'Weight', NULL, NULL, NULL, 69.0, NULL),
(@USER_ID, '2026-06-09', '07:15:00', 'BloodPressure-아침', NULL, 114, 73, NULL, NULL),
(@USER_ID, '2026-06-09', '08:40:00', 'BloodSugar-아침식후', 126, NULL, NULL, NULL, NULL),
(@USER_ID, '2026-06-09', '12:20:00', 'BloodSugar-점심식전', 87, NULL, NULL, NULL, NULL),
(@USER_ID, '2026-06-09', '13:10:00', 'BloodSugar-점심식후', 128, NULL, NULL, NULL, NULL),
(@USER_ID, '2026-06-09', '19:40:00', 'BloodSugar-저녁식후', 130, NULL, NULL, NULL, NULL),
(@USER_ID, '2026-06-09', '20:30:00', 'BloodPressure-저녁', NULL, 116, 75, NULL, NULL),
(@USER_ID, '2026-06-09', '22:00:00', 'WaterIntake', NULL, NULL, NULL, NULL, 7);

-- 2026-06-10 (데모용 미래)
INSERT INTO BIO_VALUE_RECORD (user_id, record_date, record_time, category, bloodsugar, systolic_bp, diastolic_bp, weight, water_intake_cup) VALUES
(@USER_ID, '2026-06-10', '07:00:00', 'BloodSugar-공복', 90, NULL, NULL, NULL, NULL),
(@USER_ID, '2026-06-10', '07:05:00', 'Weight', NULL, NULL, NULL, 68.9, NULL),
(@USER_ID, '2026-06-10', '07:15:00', 'BloodPressure-아침', NULL, 114, 73, NULL, NULL),
(@USER_ID, '2026-06-10', '08:40:00', 'BloodSugar-아침식후', 126, NULL, NULL, NULL, NULL),
(@USER_ID, '2026-06-10', '12:20:00', 'BloodSugar-점심식전', 86, NULL, NULL, NULL, NULL),
(@USER_ID, '2026-06-10', '13:10:00', 'BloodSugar-점심식후', 128, NULL, NULL, NULL, NULL),
(@USER_ID, '2026-06-10', '19:40:00', 'BloodSugar-저녁식후', 129, NULL, NULL, NULL, NULL),
(@USER_ID, '2026-06-10', '20:30:00', 'BloodPressure-저녁', NULL, 116, 74, NULL, NULL),
(@USER_ID, '2026-06-10', '22:00:00', 'WaterIntake', NULL, NULL, NULL, NULL, 6);

-- 2026-06-11 (데모용 미래)
INSERT INTO BIO_VALUE_RECORD (user_id, record_date, record_time, category, bloodsugar, systolic_bp, diastolic_bp, weight, water_intake_cup) VALUES
(@USER_ID, '2026-06-11', '07:00:00', 'BloodSugar-공복', 90, NULL, NULL, NULL, NULL),
(@USER_ID, '2026-06-11', '07:05:00', 'Weight', NULL, NULL, NULL, 68.9, NULL),
(@USER_ID, '2026-06-11', '07:15:00', 'BloodPressure-아침', NULL, 113, 72, NULL, NULL),
(@USER_ID, '2026-06-11', '08:40:00', 'BloodSugar-아침식후', 125, NULL, NULL, NULL, NULL),
(@USER_ID, '2026-06-11', '12:20:00', 'BloodSugar-점심식전', 86, NULL, NULL, NULL, NULL),
(@USER_ID, '2026-06-11', '13:10:00', 'BloodSugar-점심식후', 127, NULL, NULL, NULL, NULL),
(@USER_ID, '2026-06-11', '19:40:00', 'BloodSugar-저녁식후', 129, NULL, NULL, NULL, NULL),
(@USER_ID, '2026-06-11', '20:30:00', 'BloodPressure-저녁', NULL, 115, 73, NULL, NULL),
(@USER_ID, '2026-06-11', '22:00:00', 'WaterIntake', NULL, NULL, NULL, NULL, 7);


-- ============================================================
-- 2) 식사 (MEAL + MEAL_ITEM) : 2026-06-01 .. 2026-06-11
--    각 MEAL insert 직후 LAST_INSERT_ID() 로 MEAL_ITEM 연결. user_id = @USER_ID
-- ============================================================

-- ===== 2026-06-01 =====
INSERT INTO MEAL (meal_date, meal_category, meal_time, meal_photo, user_id) VALUES ('2026-06-01','BREAKFAST','08:00:00',NULL,@USER_ID);
INSERT INTO MEAL_ITEM (food_name, meal_photo, grams, calorie, carbohydrate, sugar, sodium, cholesterol, saturated_fat, protein, meal_id) VALUES ('백미밥',NULL,210,310,68.4,0.1,3,0,0.1,5.6,LAST_INSERT_ID());

INSERT INTO MEAL (meal_date, meal_category, meal_time, meal_photo, user_id) VALUES ('2026-06-01','BREAKFAST','08:00:00',NULL,@USER_ID);
INSERT INTO MEAL_ITEM (food_name, meal_photo, grams, calorie, carbohydrate, sugar, sodium, cholesterol, saturated_fat, protein, meal_id) VALUES ('된장찌개',NULL,400,190,16,5,1300,10,2,13,LAST_INSERT_ID());

INSERT INTO MEAL (meal_date, meal_category, meal_time, meal_photo, user_id) VALUES ('2026-06-01','LUNCH','12:30:00',NULL,@USER_ID);
INSERT INTO MEAL_ITEM (food_name, meal_photo, grams, calorie, carbohydrate, sugar, sodium, cholesterol, saturated_fat, protein, meal_id) VALUES ('김치찌개',NULL,400,240,14,6,1400,30,3.5,16,LAST_INSERT_ID());

INSERT INTO MEAL (meal_date, meal_category, meal_time, meal_photo, user_id) VALUES ('2026-06-01','LUNCH','12:30:00',NULL,@USER_ID);
INSERT INTO MEAL_ITEM (food_name, meal_photo, grams, calorie, carbohydrate, sugar, sodium, cholesterol, saturated_fat, protein, meal_id) VALUES ('백미밥',NULL,210,310,68.4,0.1,3,0,0.1,5.6,LAST_INSERT_ID());

INSERT INTO MEAL (meal_date, meal_category, meal_time, meal_photo, user_id) VALUES ('2026-06-01','DINNER','19:00:00',NULL,@USER_ID);
INSERT INTO MEAL_ITEM (food_name, meal_photo, grams, calorie, carbohydrate, sugar, sodium, cholesterol, saturated_fat, protein, meal_id) VALUES ('고등어구이',NULL,150,280,0,0,320,80,5,30,LAST_INSERT_ID());

INSERT INTO MEAL (meal_date, meal_category, meal_time, meal_photo, user_id) VALUES ('2026-06-01','DINNER','19:00:00',NULL,@USER_ID);
INSERT INTO MEAL_ITEM (food_name, meal_photo, grams, calorie, carbohydrate, sugar, sodium, cholesterol, saturated_fat, protein, meal_id) VALUES ('백미밥',NULL,210,310,68.4,0.1,3,0,0.1,5.6,LAST_INSERT_ID());

INSERT INTO MEAL (meal_date, meal_category, meal_time, meal_photo, user_id) VALUES ('2026-06-01','SNACK','15:30:00',NULL,@USER_ID);
INSERT INTO MEAL_ITEM (food_name, meal_photo, grams, calorie, carbohydrate, sugar, sodium, cholesterol, saturated_fat, protein, meal_id) VALUES ('사과',NULL,200,104,28,21,2,0,0,0.5,LAST_INSERT_ID());

-- ===== 2026-06-02 =====
INSERT INTO MEAL (meal_date, meal_category, meal_time, meal_photo, user_id) VALUES ('2026-06-02','BREAKFAST','07:50:00',NULL,@USER_ID);
INSERT INTO MEAL_ITEM (food_name, meal_photo, grams, calorie, carbohydrate, sugar, sodium, cholesterol, saturated_fat, protein, meal_id) VALUES ('그릭요거트',NULL,120,90,9,7,50,10,1.5,10,LAST_INSERT_ID());

INSERT INTO MEAL (meal_date, meal_category, meal_time, meal_photo, user_id) VALUES ('2026-06-02','BREAKFAST','07:50:00',NULL,@USER_ID);
INSERT INTO MEAL_ITEM (food_name, meal_photo, grams, calorie, carbohydrate, sugar, sodium, cholesterol, saturated_fat, protein, meal_id) VALUES ('바나나',NULL,120,105,27,14,1,0,0.1,1.3,LAST_INSERT_ID());

INSERT INTO MEAL (meal_date, meal_category, meal_time, meal_photo, user_id) VALUES ('2026-06-02','LUNCH','12:40:00',NULL,@USER_ID);
INSERT INTO MEAL_ITEM (food_name, meal_photo, grams, calorie, carbohydrate, sugar, sodium, cholesterol, saturated_fat, protein, meal_id) VALUES ('햄버거',NULL,100,264,21.7,3.1,450,45,4.4,12.9,LAST_INSERT_ID());

INSERT INTO MEAL (meal_date, meal_category, meal_time, meal_photo, user_id) VALUES ('2026-06-02','DINNER','18:50:00',NULL,@USER_ID);
INSERT INTO MEAL_ITEM (food_name, meal_photo, grams, calorie, carbohydrate, sugar, sodium, cholesterol, saturated_fat, protein, meal_id) VALUES ('제육볶음',NULL,200,410,18,9,900,70,7,26,LAST_INSERT_ID());

INSERT INTO MEAL (meal_date, meal_category, meal_time, meal_photo, user_id) VALUES ('2026-06-02','DINNER','18:50:00',NULL,@USER_ID);
INSERT INTO MEAL_ITEM (food_name, meal_photo, grams, calorie, carbohydrate, sugar, sodium, cholesterol, saturated_fat, protein, meal_id) VALUES ('백미밥',NULL,210,310,68.4,0.1,3,0,0.1,5.6,LAST_INSERT_ID());

-- ===== 2026-06-03 =====
INSERT INTO MEAL (meal_date, meal_category, meal_time, meal_photo, user_id) VALUES ('2026-06-03','BREAKFAST','08:10:00',NULL,@USER_ID);
INSERT INTO MEAL_ITEM (food_name, meal_photo, grams, calorie, carbohydrate, sugar, sodium, cholesterol, saturated_fat, protein, meal_id) VALUES ('백미밥',NULL,210,310,68.4,0.1,3,0,0.1,5.6,LAST_INSERT_ID());

INSERT INTO MEAL (meal_date, meal_category, meal_time, meal_photo, user_id) VALUES ('2026-06-03','BREAKFAST','08:10:00',NULL,@USER_ID);
INSERT INTO MEAL_ITEM (food_name, meal_photo, grams, calorie, carbohydrate, sugar, sodium, cholesterol, saturated_fat, protein, meal_id) VALUES ('계란후라이',NULL,60,110,1,0.5,180,210,2.5,7,LAST_INSERT_ID());

INSERT INTO MEAL (meal_date, meal_category, meal_time, meal_photo, user_id) VALUES ('2026-06-03','LUNCH','13:00:00',NULL,@USER_ID);
INSERT INTO MEAL_ITEM (food_name, meal_photo, grams, calorie, carbohydrate, sugar, sodium, cholesterol, saturated_fat, protein, meal_id) VALUES ('라면',NULL,100,82,13.7,0,283,0,0.8,1.7,LAST_INSERT_ID());

INSERT INTO MEAL (meal_date, meal_category, meal_time, meal_photo, user_id) VALUES ('2026-06-03','DINNER','19:10:00',NULL,@USER_ID);
INSERT INTO MEAL_ITEM (food_name, meal_photo, grams, calorie, carbohydrate, sugar, sodium, cholesterol, saturated_fat, protein, meal_id) VALUES ('닭가슴살샐러드',NULL,300,260,12,6,480,75,2.5,35,LAST_INSERT_ID());

INSERT INTO MEAL (meal_date, meal_category, meal_time, meal_photo, user_id) VALUES ('2026-06-03','SNACK','15:00:00',NULL,@USER_ID);
INSERT INTO MEAL_ITEM (food_name, meal_photo, grams, calorie, carbohydrate, sugar, sodium, cholesterol, saturated_fat, protein, meal_id) VALUES ('아메리카노',NULL,200,10,2,0,5,0,0,0.5,LAST_INSERT_ID());

-- ===== 2026-06-04 =====
INSERT INTO MEAL (meal_date, meal_category, meal_time, meal_photo, user_id) VALUES ('2026-06-04','BREAKFAST','08:05:00',NULL,@USER_ID);
INSERT INTO MEAL_ITEM (food_name, meal_photo, grams, calorie, carbohydrate, sugar, sodium, cholesterol, saturated_fat, protein, meal_id) VALUES ('백미밥',NULL,210,310,68.4,0.1,3,0,0.1,5.6,LAST_INSERT_ID());

INSERT INTO MEAL (meal_date, meal_category, meal_time, meal_photo, user_id) VALUES ('2026-06-04','BREAKFAST','08:05:00',NULL,@USER_ID);
INSERT INTO MEAL_ITEM (food_name, meal_photo, grams, calorie, carbohydrate, sugar, sodium, cholesterol, saturated_fat, protein, meal_id) VALUES ('계란후라이',NULL,60,110,1,0.5,180,210,2.5,7,LAST_INSERT_ID());

INSERT INTO MEAL (meal_date, meal_category, meal_time, meal_photo, user_id) VALUES ('2026-06-04','LUNCH','12:30:00',NULL,@USER_ID);
INSERT INTO MEAL_ITEM (food_name, meal_photo, grams, calorie, carbohydrate, sugar, sodium, cholesterol, saturated_fat, protein, meal_id) VALUES ('김치찌개',NULL,400,240,14,6,1400,30,3.5,16,LAST_INSERT_ID());

INSERT INTO MEAL (meal_date, meal_category, meal_time, meal_photo, user_id) VALUES ('2026-06-04','LUNCH','12:30:00',NULL,@USER_ID);
INSERT INTO MEAL_ITEM (food_name, meal_photo, grams, calorie, carbohydrate, sugar, sodium, cholesterol, saturated_fat, protein, meal_id) VALUES ('백미밥',NULL,210,310,68.4,0.1,3,0,0.1,5.6,LAST_INSERT_ID());

INSERT INTO MEAL (meal_date, meal_category, meal_time, meal_photo, user_id) VALUES ('2026-06-04','DINNER','19:00:00',NULL,@USER_ID);
INSERT INTO MEAL_ITEM (food_name, meal_photo, grams, calorie, carbohydrate, sugar, sodium, cholesterol, saturated_fat, protein, meal_id) VALUES ('제육볶음',NULL,200,410,18,9,900,70,7,26,LAST_INSERT_ID());

INSERT INTO MEAL (meal_date, meal_category, meal_time, meal_photo, user_id) VALUES ('2026-06-04','DINNER','19:00:00',NULL,@USER_ID);
INSERT INTO MEAL_ITEM (food_name, meal_photo, grams, calorie, carbohydrate, sugar, sodium, cholesterol, saturated_fat, protein, meal_id) VALUES ('백미밥',NULL,210,310,68.4,0.1,3,0,0.1,5.6,LAST_INSERT_ID());

INSERT INTO MEAL (meal_date, meal_category, meal_time, meal_photo, user_id) VALUES ('2026-06-04','SNACK','15:20:00',NULL,@USER_ID);
INSERT INTO MEAL_ITEM (food_name, meal_photo, grams, calorie, carbohydrate, sugar, sodium, cholesterol, saturated_fat, protein, meal_id) VALUES ('사과',NULL,200,104,28,21,2,0,0,0.5,LAST_INSERT_ID());

-- ===== 2026-06-05 =====
INSERT INTO MEAL (meal_date, meal_category, meal_time, meal_photo, user_id) VALUES ('2026-06-05','BREAKFAST','07:45:00',NULL,@USER_ID);
INSERT INTO MEAL_ITEM (food_name, meal_photo, grams, calorie, carbohydrate, sugar, sodium, cholesterol, saturated_fat, protein, meal_id) VALUES ('그릭요거트',NULL,120,90,9,7,50,10,1.5,10,LAST_INSERT_ID());

INSERT INTO MEAL (meal_date, meal_category, meal_time, meal_photo, user_id) VALUES ('2026-06-05','BREAKFAST','07:45:00',NULL,@USER_ID);
INSERT INTO MEAL_ITEM (food_name, meal_photo, grams, calorie, carbohydrate, sugar, sodium, cholesterol, saturated_fat, protein, meal_id) VALUES ('바나나',NULL,120,105,27,14,1,0,0.1,1.3,LAST_INSERT_ID());

INSERT INTO MEAL (meal_date, meal_category, meal_time, meal_photo, user_id) VALUES ('2026-06-05','LUNCH','12:15:00',NULL,@USER_ID);
INSERT INTO MEAL_ITEM (food_name, meal_photo, grams, calorie, carbohydrate, sugar, sodium, cholesterol, saturated_fat, protein, meal_id) VALUES ('라면',NULL,100,82,13.7,0,283,0,0.8,1.7,LAST_INSERT_ID());

INSERT INTO MEAL (meal_date, meal_category, meal_time, meal_photo, user_id) VALUES ('2026-06-05','DINNER','18:40:00',NULL,@USER_ID);
INSERT INTO MEAL_ITEM (food_name, meal_photo, grams, calorie, carbohydrate, sugar, sodium, cholesterol, saturated_fat, protein, meal_id) VALUES ('고등어구이',NULL,150,280,0,0,320,80,5,30,LAST_INSERT_ID());

INSERT INTO MEAL (meal_date, meal_category, meal_time, meal_photo, user_id) VALUES ('2026-06-05','DINNER','18:40:00',NULL,@USER_ID);
INSERT INTO MEAL_ITEM (food_name, meal_photo, grams, calorie, carbohydrate, sugar, sodium, cholesterol, saturated_fat, protein, meal_id) VALUES ('백미밥',NULL,210,310,68.4,0.1,3,0,0.1,5.6,LAST_INSERT_ID());

-- ===== 2026-06-06 =====
INSERT INTO MEAL (meal_date, meal_category, meal_time, meal_photo, user_id) VALUES ('2026-06-06','BREAKFAST','08:20:00',NULL,@USER_ID);
INSERT INTO MEAL_ITEM (food_name, meal_photo, grams, calorie, carbohydrate, sugar, sodium, cholesterol, saturated_fat, protein, meal_id) VALUES ('백미밥',NULL,210,310,68.4,0.1,3,0,0.1,5.6,LAST_INSERT_ID());

INSERT INTO MEAL (meal_date, meal_category, meal_time, meal_photo, user_id) VALUES ('2026-06-06','BREAKFAST','08:20:00',NULL,@USER_ID);
INSERT INTO MEAL_ITEM (food_name, meal_photo, grams, calorie, carbohydrate, sugar, sodium, cholesterol, saturated_fat, protein, meal_id) VALUES ('된장찌개',NULL,400,190,16,5,1300,10,2,13,LAST_INSERT_ID());

INSERT INTO MEAL (meal_date, meal_category, meal_time, meal_photo, user_id) VALUES ('2026-06-06','LUNCH','12:50:00',NULL,@USER_ID);
INSERT INTO MEAL_ITEM (food_name, meal_photo, grams, calorie, carbohydrate, sugar, sodium, cholesterol, saturated_fat, protein, meal_id) VALUES ('햄버거',NULL,100,264,21.7,3.1,450,45,4.4,12.9,LAST_INSERT_ID());

INSERT INTO MEAL (meal_date, meal_category, meal_time, meal_photo, user_id) VALUES ('2026-06-06','DINNER','19:15:00',NULL,@USER_ID);
INSERT INTO MEAL_ITEM (food_name, meal_photo, grams, calorie, carbohydrate, sugar, sodium, cholesterol, saturated_fat, protein, meal_id) VALUES ('닭가슴살샐러드',NULL,300,260,12,6,480,75,2.5,35,LAST_INSERT_ID());

INSERT INTO MEAL (meal_date, meal_category, meal_time, meal_photo, user_id) VALUES ('2026-06-06','SNACK','15:40:00',NULL,@USER_ID);
INSERT INTO MEAL_ITEM (food_name, meal_photo, grams, calorie, carbohydrate, sugar, sodium, cholesterol, saturated_fat, protein, meal_id) VALUES ('아메리카노',NULL,200,10,2,0,5,0,0,0.5,LAST_INSERT_ID());

-- ===== 2026-06-07 =====
INSERT INTO MEAL (meal_date, meal_category, meal_time, meal_photo, user_id) VALUES ('2026-06-07','BREAKFAST','08:00:00',NULL,@USER_ID);
INSERT INTO MEAL_ITEM (food_name, meal_photo, grams, calorie, carbohydrate, sugar, sodium, cholesterol, saturated_fat, protein, meal_id) VALUES ('백미밥',NULL,210,310,68.4,0.1,3,0,0.1,5.6,LAST_INSERT_ID());

INSERT INTO MEAL (meal_date, meal_category, meal_time, meal_photo, user_id) VALUES ('2026-06-07','BREAKFAST','08:00:00',NULL,@USER_ID);
INSERT INTO MEAL_ITEM (food_name, meal_photo, grams, calorie, carbohydrate, sugar, sodium, cholesterol, saturated_fat, protein, meal_id) VALUES ('계란후라이',NULL,60,110,1,0.5,180,210,2.5,7,LAST_INSERT_ID());

INSERT INTO MEAL (meal_date, meal_category, meal_time, meal_photo, user_id) VALUES ('2026-06-07','LUNCH','13:00:00',NULL,@USER_ID);
INSERT INTO MEAL_ITEM (food_name, meal_photo, grams, calorie, carbohydrate, sugar, sodium, cholesterol, saturated_fat, protein, meal_id) VALUES ('김치찌개',NULL,400,240,14,6,1400,30,3.5,16,LAST_INSERT_ID());

INSERT INTO MEAL (meal_date, meal_category, meal_time, meal_photo, user_id) VALUES ('2026-06-07','LUNCH','13:00:00',NULL,@USER_ID);
INSERT INTO MEAL_ITEM (food_name, meal_photo, grams, calorie, carbohydrate, sugar, sodium, cholesterol, saturated_fat, protein, meal_id) VALUES ('백미밥',NULL,210,310,68.4,0.1,3,0,0.1,5.6,LAST_INSERT_ID());

INSERT INTO MEAL (meal_date, meal_category, meal_time, meal_photo, user_id) VALUES ('2026-06-07','DINNER','18:50:00',NULL,@USER_ID);
INSERT INTO MEAL_ITEM (food_name, meal_photo, grams, calorie, carbohydrate, sugar, sodium, cholesterol, saturated_fat, protein, meal_id) VALUES ('고등어구이',NULL,150,280,0,0,320,80,5,30,LAST_INSERT_ID());

-- ===== 2026-06-08 =====
INSERT INTO MEAL (meal_date, meal_category, meal_time, meal_photo, user_id) VALUES ('2026-06-08','BREAKFAST','07:55:00',NULL,@USER_ID);
INSERT INTO MEAL_ITEM (food_name, meal_photo, grams, calorie, carbohydrate, sugar, sodium, cholesterol, saturated_fat, protein, meal_id) VALUES ('그릭요거트',NULL,120,90,9,7,50,10,1.5,10,LAST_INSERT_ID());

INSERT INTO MEAL (meal_date, meal_category, meal_time, meal_photo, user_id) VALUES ('2026-06-08','BREAKFAST','07:55:00',NULL,@USER_ID);
INSERT INTO MEAL_ITEM (food_name, meal_photo, grams, calorie, carbohydrate, sugar, sodium, cholesterol, saturated_fat, protein, meal_id) VALUES ('바나나',NULL,120,105,27,14,1,0,0.1,1.3,LAST_INSERT_ID());

INSERT INTO MEAL (meal_date, meal_category, meal_time, meal_photo, user_id) VALUES ('2026-06-08','LUNCH','12:20:00',NULL,@USER_ID);
INSERT INTO MEAL_ITEM (food_name, meal_photo, grams, calorie, carbohydrate, sugar, sodium, cholesterol, saturated_fat, protein, meal_id) VALUES ('된장찌개',NULL,400,190,16,5,1300,10,2,13,LAST_INSERT_ID());

INSERT INTO MEAL (meal_date, meal_category, meal_time, meal_photo, user_id) VALUES ('2026-06-08','LUNCH','12:20:00',NULL,@USER_ID);
INSERT INTO MEAL_ITEM (food_name, meal_photo, grams, calorie, carbohydrate, sugar, sodium, cholesterol, saturated_fat, protein, meal_id) VALUES ('백미밥',NULL,210,310,68.4,0.1,3,0,0.1,5.6,LAST_INSERT_ID());

INSERT INTO MEAL (meal_date, meal_category, meal_time, meal_photo, user_id) VALUES ('2026-06-08','DINNER','19:25:00',NULL,@USER_ID);
INSERT INTO MEAL_ITEM (food_name, meal_photo, grams, calorie, carbohydrate, sugar, sodium, cholesterol, saturated_fat, protein, meal_id) VALUES ('제육볶음',NULL,200,410,18,9,900,70,7,26,LAST_INSERT_ID());

INSERT INTO MEAL (meal_date, meal_category, meal_time, meal_photo, user_id) VALUES ('2026-06-08','SNACK','15:00:00',NULL,@USER_ID);
INSERT INTO MEAL_ITEM (food_name, meal_photo, grams, calorie, carbohydrate, sugar, sodium, cholesterol, saturated_fat, protein, meal_id) VALUES ('사과',NULL,200,104,28,21,2,0,0,0.5,LAST_INSERT_ID());

-- ===== 2026-06-09 =====
INSERT INTO MEAL (meal_date, meal_category, meal_time, meal_photo, user_id) VALUES ('2026-06-09','BREAKFAST','08:10:00',NULL,@USER_ID);
INSERT INTO MEAL_ITEM (food_name, meal_photo, grams, calorie, carbohydrate, sugar, sodium, cholesterol, saturated_fat, protein, meal_id) VALUES ('백미밥',NULL,210,310,68.4,0.1,3,0,0.1,5.6,LAST_INSERT_ID());

INSERT INTO MEAL (meal_date, meal_category, meal_time, meal_photo, user_id) VALUES ('2026-06-09','BREAKFAST','08:10:00',NULL,@USER_ID);
INSERT INTO MEAL_ITEM (food_name, meal_photo, grams, calorie, carbohydrate, sugar, sodium, cholesterol, saturated_fat, protein, meal_id) VALUES ('계란후라이',NULL,60,110,1,0.5,180,210,2.5,7,LAST_INSERT_ID());

INSERT INTO MEAL (meal_date, meal_category, meal_time, meal_photo, user_id) VALUES ('2026-06-09','LUNCH','12:40:00',NULL,@USER_ID);
INSERT INTO MEAL_ITEM (food_name, meal_photo, grams, calorie, carbohydrate, sugar, sodium, cholesterol, saturated_fat, protein, meal_id) VALUES ('라면',NULL,100,82,13.7,0,283,0,0.8,1.7,LAST_INSERT_ID());

INSERT INTO MEAL (meal_date, meal_category, meal_time, meal_photo, user_id) VALUES ('2026-06-09','DINNER','19:05:00',NULL,@USER_ID);
INSERT INTO MEAL_ITEM (food_name, meal_photo, grams, calorie, carbohydrate, sugar, sodium, cholesterol, saturated_fat, protein, meal_id) VALUES ('제육볶음',NULL,200,410,18,9,900,70,7,26,LAST_INSERT_ID());

INSERT INTO MEAL (meal_date, meal_category, meal_time, meal_photo, user_id) VALUES ('2026-06-09','DINNER','19:05:00',NULL,@USER_ID);
INSERT INTO MEAL_ITEM (food_name, meal_photo, grams, calorie, carbohydrate, sugar, sodium, cholesterol, saturated_fat, protein, meal_id) VALUES ('백미밥',NULL,210,310,68.4,0.1,3,0,0.1,5.6,LAST_INSERT_ID());

-- ===== 2026-06-10 (데모용 미래) =====
INSERT INTO MEAL (meal_date, meal_category, meal_time, meal_photo, user_id) VALUES ('2026-06-10','BREAKFAST','08:25:00',NULL,@USER_ID);
INSERT INTO MEAL_ITEM (food_name, meal_photo, grams, calorie, carbohydrate, sugar, sodium, cholesterol, saturated_fat, protein, meal_id) VALUES ('그릭요거트',NULL,120,90,9,7,50,10,1.5,10,LAST_INSERT_ID());

INSERT INTO MEAL (meal_date, meal_category, meal_time, meal_photo, user_id) VALUES ('2026-06-10','BREAKFAST','08:25:00',NULL,@USER_ID);
INSERT INTO MEAL_ITEM (food_name, meal_photo, grams, calorie, carbohydrate, sugar, sodium, cholesterol, saturated_fat, protein, meal_id) VALUES ('바나나',NULL,120,105,27,14,1,0,0.1,1.3,LAST_INSERT_ID());

INSERT INTO MEAL (meal_date, meal_category, meal_time, meal_photo, user_id) VALUES ('2026-06-10','LUNCH','12:10:00',NULL,@USER_ID);
INSERT INTO MEAL_ITEM (food_name, meal_photo, grams, calorie, carbohydrate, sugar, sodium, cholesterol, saturated_fat, protein, meal_id) VALUES ('김치찌개',NULL,400,240,14,6,1400,30,3.5,16,LAST_INSERT_ID());

INSERT INTO MEAL (meal_date, meal_category, meal_time, meal_photo, user_id) VALUES ('2026-06-10','LUNCH','12:10:00',NULL,@USER_ID);
INSERT INTO MEAL_ITEM (food_name, meal_photo, grams, calorie, carbohydrate, sugar, sodium, cholesterol, saturated_fat, protein, meal_id) VALUES ('백미밥',NULL,210,310,68.4,0.1,3,0,0.1,5.6,LAST_INSERT_ID());

INSERT INTO MEAL (meal_date, meal_category, meal_time, meal_photo, user_id) VALUES ('2026-06-10','DINNER','18:35:00',NULL,@USER_ID);
INSERT INTO MEAL_ITEM (food_name, meal_photo, grams, calorie, carbohydrate, sugar, sodium, cholesterol, saturated_fat, protein, meal_id) VALUES ('닭가슴살샐러드',NULL,300,260,12,6,480,75,2.5,35,LAST_INSERT_ID());

INSERT INTO MEAL (meal_date, meal_category, meal_time, meal_photo, user_id) VALUES ('2026-06-10','SNACK','15:50:00',NULL,@USER_ID);
INSERT INTO MEAL_ITEM (food_name, meal_photo, grams, calorie, carbohydrate, sugar, sodium, cholesterol, saturated_fat, protein, meal_id) VALUES ('아메리카노',NULL,200,10,2,0,5,0,0,0.5,LAST_INSERT_ID());

-- ===== 2026-06-11 (데모용 미래) =====
INSERT INTO MEAL (meal_date, meal_category, meal_time, meal_photo, user_id) VALUES ('2026-06-11','BREAKFAST','07:35:00',NULL,@USER_ID);
INSERT INTO MEAL_ITEM (food_name, meal_photo, grams, calorie, carbohydrate, sugar, sodium, cholesterol, saturated_fat, protein, meal_id) VALUES ('백미밥',NULL,210,310,68.4,0.1,3,0,0.1,5.6,LAST_INSERT_ID());

INSERT INTO MEAL (meal_date, meal_category, meal_time, meal_photo, user_id) VALUES ('2026-06-11','BREAKFAST','07:35:00',NULL,@USER_ID);
INSERT INTO MEAL_ITEM (food_name, meal_photo, grams, calorie, carbohydrate, sugar, sodium, cholesterol, saturated_fat, protein, meal_id) VALUES ('된장찌개',NULL,400,190,16,5,1300,10,2,13,LAST_INSERT_ID());

INSERT INTO MEAL (meal_date, meal_category, meal_time, meal_photo, user_id) VALUES ('2026-06-11','LUNCH','12:55:00',NULL,@USER_ID);
INSERT INTO MEAL_ITEM (food_name, meal_photo, grams, calorie, carbohydrate, sugar, sodium, cholesterol, saturated_fat, protein, meal_id) VALUES ('라면',NULL,100,82,13.7,0,283,0,0.8,1.7,LAST_INSERT_ID());

INSERT INTO MEAL (meal_date, meal_category, meal_time, meal_photo, user_id) VALUES ('2026-06-11','DINNER','18:45:00',NULL,@USER_ID);
INSERT INTO MEAL_ITEM (food_name, meal_photo, grams, calorie, carbohydrate, sugar, sodium, cholesterol, saturated_fat, protein, meal_id) VALUES ('고등어구이',NULL,150,280,0,0,320,80,5,30,LAST_INSERT_ID());

INSERT INTO MEAL (meal_date, meal_category, meal_time, meal_photo, user_id) VALUES ('2026-06-11','DINNER','18:45:00',NULL,@USER_ID);
INSERT INTO MEAL_ITEM (food_name, meal_photo, grams, calorie, carbohydrate, sugar, sodium, cholesterol, saturated_fat, protein, meal_id) VALUES ('백미밥',NULL,210,310,68.4,0.1,3,0,0.1,5.6,LAST_INSERT_ID());


-- ============================================================
-- 3) 복약 기록 (USER_MEDICINE_RECORD) : 2026-06-01 .. 2026-06-11
--    혈압약(@PRESCRIPTION_ID). 슬롯 MORNING 08:00 / DINNER 19:00 / BEDTIME 22:30
--    부분 이행: 06-06 BEDTIME 누락, 06-09 MORNING 누락 (이행률 100% 아님)
-- ============================================================

-- 2026-06-01 (3회)
INSERT INTO USER_MEDICINE_RECORD (prescription_id, intake_date, intake_time, supplement_id, taken_category) VALUES (@PRESCRIPTION_ID, '2026-06-01', '08:00:00', NULL, 'MORNING');
INSERT INTO USER_MEDICINE_RECORD (prescription_id, intake_date, intake_time, supplement_id, taken_category) VALUES (@PRESCRIPTION_ID, '2026-06-01', '19:00:00', NULL, 'DINNER');
INSERT INTO USER_MEDICINE_RECORD (prescription_id, intake_date, intake_time, supplement_id, taken_category) VALUES (@PRESCRIPTION_ID, '2026-06-01', '22:30:00', NULL, 'BEDTIME');

-- 2026-06-02 (3회)
INSERT INTO USER_MEDICINE_RECORD (prescription_id, intake_date, intake_time, supplement_id, taken_category) VALUES (@PRESCRIPTION_ID, '2026-06-02', '08:00:00', NULL, 'MORNING');
INSERT INTO USER_MEDICINE_RECORD (prescription_id, intake_date, intake_time, supplement_id, taken_category) VALUES (@PRESCRIPTION_ID, '2026-06-02', '19:00:00', NULL, 'DINNER');
INSERT INTO USER_MEDICINE_RECORD (prescription_id, intake_date, intake_time, supplement_id, taken_category) VALUES (@PRESCRIPTION_ID, '2026-06-02', '22:30:00', NULL, 'BEDTIME');

-- 2026-06-03 (3회)
INSERT INTO USER_MEDICINE_RECORD (prescription_id, intake_date, intake_time, supplement_id, taken_category) VALUES (@PRESCRIPTION_ID, '2026-06-03', '08:00:00', NULL, 'MORNING');
INSERT INTO USER_MEDICINE_RECORD (prescription_id, intake_date, intake_time, supplement_id, taken_category) VALUES (@PRESCRIPTION_ID, '2026-06-03', '19:00:00', NULL, 'DINNER');
INSERT INTO USER_MEDICINE_RECORD (prescription_id, intake_date, intake_time, supplement_id, taken_category) VALUES (@PRESCRIPTION_ID, '2026-06-03', '22:30:00', NULL, 'BEDTIME');

-- 2026-06-04 (3회)
INSERT INTO USER_MEDICINE_RECORD (prescription_id, intake_date, intake_time, supplement_id, taken_category) VALUES (@PRESCRIPTION_ID, '2026-06-04', '08:00:00', NULL, 'MORNING');
INSERT INTO USER_MEDICINE_RECORD (prescription_id, intake_date, intake_time, supplement_id, taken_category) VALUES (@PRESCRIPTION_ID, '2026-06-04', '19:00:00', NULL, 'DINNER');
INSERT INTO USER_MEDICINE_RECORD (prescription_id, intake_date, intake_time, supplement_id, taken_category) VALUES (@PRESCRIPTION_ID, '2026-06-04', '22:30:00', NULL, 'BEDTIME');

-- 2026-06-05 (3회)
INSERT INTO USER_MEDICINE_RECORD (prescription_id, intake_date, intake_time, supplement_id, taken_category) VALUES (@PRESCRIPTION_ID, '2026-06-05', '08:00:00', NULL, 'MORNING');
INSERT INTO USER_MEDICINE_RECORD (prescription_id, intake_date, intake_time, supplement_id, taken_category) VALUES (@PRESCRIPTION_ID, '2026-06-05', '19:00:00', NULL, 'DINNER');
INSERT INTO USER_MEDICINE_RECORD (prescription_id, intake_date, intake_time, supplement_id, taken_category) VALUES (@PRESCRIPTION_ID, '2026-06-05', '22:30:00', NULL, 'BEDTIME');

-- 2026-06-06 (BEDTIME 누락)
INSERT INTO USER_MEDICINE_RECORD (prescription_id, intake_date, intake_time, supplement_id, taken_category) VALUES (@PRESCRIPTION_ID, '2026-06-06', '08:00:00', NULL, 'MORNING');
INSERT INTO USER_MEDICINE_RECORD (prescription_id, intake_date, intake_time, supplement_id, taken_category) VALUES (@PRESCRIPTION_ID, '2026-06-06', '19:00:00', NULL, 'DINNER');

-- 2026-06-07 (3회)
INSERT INTO USER_MEDICINE_RECORD (prescription_id, intake_date, intake_time, supplement_id, taken_category) VALUES (@PRESCRIPTION_ID, '2026-06-07', '08:00:00', NULL, 'MORNING');
INSERT INTO USER_MEDICINE_RECORD (prescription_id, intake_date, intake_time, supplement_id, taken_category) VALUES (@PRESCRIPTION_ID, '2026-06-07', '19:00:00', NULL, 'DINNER');
INSERT INTO USER_MEDICINE_RECORD (prescription_id, intake_date, intake_time, supplement_id, taken_category) VALUES (@PRESCRIPTION_ID, '2026-06-07', '22:30:00', NULL, 'BEDTIME');

-- 2026-06-08 (3회)
INSERT INTO USER_MEDICINE_RECORD (prescription_id, intake_date, intake_time, supplement_id, taken_category) VALUES (@PRESCRIPTION_ID, '2026-06-08', '08:00:00', NULL, 'MORNING');
INSERT INTO USER_MEDICINE_RECORD (prescription_id, intake_date, intake_time, supplement_id, taken_category) VALUES (@PRESCRIPTION_ID, '2026-06-08', '19:00:00', NULL, 'DINNER');
INSERT INTO USER_MEDICINE_RECORD (prescription_id, intake_date, intake_time, supplement_id, taken_category) VALUES (@PRESCRIPTION_ID, '2026-06-08', '22:30:00', NULL, 'BEDTIME');

-- 2026-06-09 (MORNING 누락)
INSERT INTO USER_MEDICINE_RECORD (prescription_id, intake_date, intake_time, supplement_id, taken_category) VALUES (@PRESCRIPTION_ID, '2026-06-09', '19:00:00', NULL, 'DINNER');
INSERT INTO USER_MEDICINE_RECORD (prescription_id, intake_date, intake_time, supplement_id, taken_category) VALUES (@PRESCRIPTION_ID, '2026-06-09', '22:30:00', NULL, 'BEDTIME');

-- 2026-06-10 (3회, 데모용 미래)
INSERT INTO USER_MEDICINE_RECORD (prescription_id, intake_date, intake_time, supplement_id, taken_category) VALUES (@PRESCRIPTION_ID, '2026-06-10', '08:00:00', NULL, 'MORNING');
INSERT INTO USER_MEDICINE_RECORD (prescription_id, intake_date, intake_time, supplement_id, taken_category) VALUES (@PRESCRIPTION_ID, '2026-06-10', '19:00:00', NULL, 'DINNER');
INSERT INTO USER_MEDICINE_RECORD (prescription_id, intake_date, intake_time, supplement_id, taken_category) VALUES (@PRESCRIPTION_ID, '2026-06-10', '22:30:00', NULL, 'BEDTIME');

-- 2026-06-11 (3회, 데모용 미래)
INSERT INTO USER_MEDICINE_RECORD (prescription_id, intake_date, intake_time, supplement_id, taken_category) VALUES (@PRESCRIPTION_ID, '2026-06-11', '08:00:00', NULL, 'MORNING');
INSERT INTO USER_MEDICINE_RECORD (prescription_id, intake_date, intake_time, supplement_id, taken_category) VALUES (@PRESCRIPTION_ID, '2026-06-11', '19:00:00', NULL, 'DINNER');
INSERT INTO USER_MEDICINE_RECORD (prescription_id, intake_date, intake_time, supplement_id, taken_category) VALUES (@PRESCRIPTION_ID, '2026-06-11', '22:30:00', NULL, 'BEDTIME');


-- ============================================================
-- 4) 운동 (user_exercise) : 2026-06-01 .. 2026-06-11 (11일 중 9세션, 휴식일 포함)
--    exercise_type_id 는 MongoDB 시드 ObjectId. is_deleted = 0. user_id = @USER_ID
-- ============================================================
INSERT INTO user_exercise (user_id, exercise_type_id, exercise_date, exercise_time, burned_calorie, is_deleted) VALUES (@USER_ID, '6a179263ec2b30eaac8bd743', '2026-06-01', '09:00:00', 300, 0);
INSERT INTO user_exercise (user_id, exercise_type_id, exercise_date, exercise_time, burned_calorie, is_deleted) VALUES (@USER_ID, '6a179263ec2b30eaac8bd73e', '2026-06-03', '18:30:00', 420, 0);
INSERT INTO user_exercise (user_id, exercise_type_id, exercise_date, exercise_time, burned_calorie, is_deleted) VALUES (@USER_ID, '6a179263ec2b30eaac8bd743', '2026-06-04', '08:15:00', 320, 0);
INSERT INTO user_exercise (user_id, exercise_type_id, exercise_date, exercise_time, burned_calorie, is_deleted) VALUES (@USER_ID, '6a179263ec2b30eaac8bd73e', '2026-06-06', '07:40:00', 455, 0);
INSERT INTO user_exercise (user_id, exercise_type_id, exercise_date, exercise_time, burned_calorie, is_deleted) VALUES (@USER_ID, '6a179263ec2b30eaac8bd747', '2026-06-06', '18:25:00', 270, 0);
INSERT INTO user_exercise (user_id, exercise_type_id, exercise_date, exercise_time, burned_calorie, is_deleted) VALUES (@USER_ID, '6a179263ec2b30eaac8bd743', '2026-06-07', '12:05:00', 245, 0);
INSERT INTO user_exercise (user_id, exercise_type_id, exercise_date, exercise_time, burned_calorie, is_deleted) VALUES (@USER_ID, '6a179263ec2b30eaac8bd73e', '2026-06-09', '19:10:00', 310, 0);
INSERT INTO user_exercise (user_id, exercise_type_id, exercise_date, exercise_time, burned_calorie, is_deleted) VALUES (@USER_ID, '6a179263ec2b30eaac8bd747', '2026-06-10', '17:50:00', 295, 0);
INSERT INTO user_exercise (user_id, exercise_type_id, exercise_date, exercise_time, burned_calorie, is_deleted) VALUES (@USER_ID, '6a179263ec2b30eaac8bd743', '2026-06-11', '09:30:00', 360, 0);


COMMIT;

-- ============================================================
-- (선택) 삽입 결과 확인용 — 필요하면 아래 주석을 풀고 실행
-- SELECT 'bio'  k, COUNT(*) c FROM BIO_VALUE_RECORD WHERE user_id=@USER_ID AND record_date BETWEEN '2026-06-01' AND '2026-06-11'
-- UNION ALL SELECT 'meal',      COUNT(*) FROM MEAL WHERE user_id=@USER_ID AND meal_date BETWEEN '2026-06-01' AND '2026-06-11'
-- UNION ALL SELECT 'meal_item', COUNT(*) FROM MEAL_ITEM mi JOIN MEAL m ON m.meal_id=mi.meal_id WHERE m.user_id=@USER_ID AND m.meal_date BETWEEN '2026-06-01' AND '2026-06-11'
-- UNION ALL SELECT 'medicine',  COUNT(*) FROM USER_MEDICINE_RECORD WHERE prescription_id=@PRESCRIPTION_ID AND intake_date BETWEEN '2026-06-01' AND '2026-06-11'
-- UNION ALL SELECT 'exercise',  COUNT(*) FROM user_exercise WHERE user_id=@USER_ID AND exercise_date BETWEEN '2026-06-01' AND '2026-06-11';
