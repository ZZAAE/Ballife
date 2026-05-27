-- ════════════════════════════════════════════════════════════════════
--  Ballife 수동 마이그레이션 모음
--  Hibernate ddl-auto: update 는 컬럼 타입 변경을 따라잡지 못합니다.
--  코드를 새로 받은 사람은 이 파일을 한 번 실행해서 스키마를 정렬하세요.
--
--  실행 방법:
--    mysql -u ballife -p1234 project_ballife < manual_migrations.sql
--    또는 MySQL Workbench / IntelliJ Database 에서 통째로 실행
--
--  모든 ALTER 는 "있으면 그대로, 없거나 다르면 변경" 의미라 여러 번 실행해도 안전합니다.
-- ════════════════════════════════════════════════════════════════════

USE project_ballife;

-- ────────────────────────────────────────────────────────────────────
-- 1) user_exercise.exercise_type_id : BIGINT FK → VARCHAR(24)
--    ExerciseType 이 MySQL → MongoDB 로 이전되면서 FK 가 MongoDB ObjectId(24 자 hex)로 변경됨.
-- ────────────────────────────────────────────────────────────────────

-- 1-a. 옛 FK 제약이 있으면 제거 (없으면 에러 무시)
SET @fk := (SELECT CONSTRAINT_NAME
            FROM information_schema.KEY_COLUMN_USAGE
            WHERE TABLE_SCHEMA = DATABASE()
              AND TABLE_NAME   = 'user_exercise'
              AND COLUMN_NAME  = 'exercise_type_id'
              AND REFERENCED_TABLE_NAME IS NOT NULL
            LIMIT 1);
SET @sql := IF(@fk IS NULL,
               'SELECT "no FK on user_exercise.exercise_type_id"',
               CONCAT('ALTER TABLE user_exercise DROP FOREIGN KEY ', @fk));
PREPARE stmt FROM @sql; EXECUTE stmt; DEALLOCATE PREPARE stmt;

-- 1-b. 타입 변경 (BIGINT → VARCHAR(24))
ALTER TABLE user_exercise
    MODIFY COLUMN exercise_type_id VARCHAR(24) NULL;

-- ────────────────────────────────────────────────────────────────────
-- 2) post.content / image_url : VARCHAR → LONGTEXT
--    게시판 본문에 base64 인라인 이미지가 들어가므로 LONGTEXT 필요.
-- ────────────────────────────────────────────────────────────────────
ALTER TABLE post MODIFY COLUMN content   LONGTEXT NOT NULL;
ALTER TABLE post MODIFY COLUMN image_url LONGTEXT NULL;

-- ────────────────────────────────────────────────────────────────────
-- 적용 확인 (선택)
-- ────────────────────────────────────────────────────────────────────
-- DESCRIBE user_exercise;   -- exercise_type_id 가 varchar(24) NULL 이어야 함
-- DESCRIBE post;            -- content / image_url 이 longtext 여야 함
