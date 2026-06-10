# Ballife 더미데이터 시드 (팀원용)

`user_id` 한 명에게 2026-06-01 ~ 06-11(11일)치 데모 데이터를 채웁니다.
**혈당·혈압·체중·수분·식사·복약**은 MySQL `dummy_records.sql` 한 방으로 끝나지만,
**운동**은 두 군데(MySQL + MongoDB)에 나뉘어 있어 한 단계가 더 필요합니다.

## 왜 운동만 추가 단계가 필요한가
- **운동 종류 id 가 PC마다 다름**: `exercise_type` 컬렉션의 `_id`(ObjectId)는 백엔드 첫 부팅 때
  머신마다 새로 자동생성됩니다(`ExerciseTypeDataInitializer`가 `@Id`를 안 박음). 그래서
  `dummy_records.sql`에 하드코딩된 ObjectId는 *작성자 PC* 값이라, 그대로 두면 다른 PC에선
  운동 **종류명이 안 잡힙니다**(행·소모칼로리는 정상).
- **세트·중량·횟수·시간은 MongoDB에만 있음**: 이 값들은 MySQL이 아니라
  `user_exercise_detail` 컬렉션(`UserExerciseDetail`)에 저장되는데, SQL 파일은 이걸 안 건드립니다.

`seed_exercise.mjs`가 이 두 가지를 한 번에 해결합니다 — 운동 종류를 **이름**으로 다시 매핑해
FK를 교정하고, 방금 들어간 운동 행의 **실제 auto-increment id**를 자연키로 찾아 상세 문서를 넣습니다.
앱 코드는 전혀 안 바꿉니다. 멱등(여러 번 실행해도 안전)합니다.

## 사전 준비
- MySQL: db `project_ballife`, 계정 `ballife` / 비번 `1234` (application.yml local 기준)
- MongoDB: db `Ballife` @ `127.0.0.1:27017`
- Node 18+ (`node -v`)
- 백엔드를 **최소 1회 부팅**해 둘 것 → Hibernate가 테이블 생성, `ExerciseTypeDataInitializer`가
  `exercise_type` 10종을 시드함.

## 실행 순서 (`<ID>` = 본인 USER_ID)
```bash
# 1) (최초 1회) 스키마 보정 — ddl-auto 가 못 따라잡는 컬럼들
mysql -u ballife -p1234 project_ballife < ../Ballife/src/main/resources/db/manual_migrations.sql

# 2) dummy_records.sql 상단 SET @USER_ID := <ID>; 로 바꾼 뒤 MySQL 시드
mysql -u ballife -p1234 --default-character-set=utf8mb4 project_ballife < ../dummy_records.sql

# 3) 운동 종류 교정 + 상세(세트/중량/횟수/시간/거리/강도) 시드  ← 이 폴더에서
npm install            # 최초 1회 (mysql2, mongodb 설치)
USER_ID=<ID> node seed_exercise.mjs
#   PowerShell:  $env:USER_ID="<ID>"; node seed_exercise.mjs
```

> `--default-character-set=utf8mb4` 필수(한글 카테고리/강도 깨짐 방지).
> mongosh 가 PATH에 없어도 됩니다 — 이 스크립트는 Node 드라이버로 직접 접속합니다.

## 다른 DB 주소를 쓸 때 (환경변수)
`USER_ID`, `MYSQL_HOST/PORT/USER/PASSWORD/DB`, `MONGO_URI`, `MONGO_DB` 로 덮어쓸 수 있습니다.

## 멱등성 / 재실행
- 세 단계 모두 재실행 안전. `dummy_records.sql`은 같은 기간을 지우고 다시 넣고,
  `seed_exercise.mjs`는 그 9개 운동을 자연키(날짜+시각)로 다시 찾아 상세를 교체합니다.
- 그래서 **재시드할 땐 2)와 3)을 다시(같은 순서로) 돌리면** 됩니다. 운동 행 id가 바뀌어도 자동 정합.

## 검증
```bash
# 상세 9건 확인
npx -y mongosh --quiet "mongodb://127.0.0.1:27017/Ballife" \
  --eval 'print(db.user_exercise_detail.countDocuments())'
```
또는 앱에서 6/1~6/11 운동 카드에 세트·중량·횟수·시간이 보이는지 확인.
