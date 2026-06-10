// ============================================================
//  Ballife 운동 더미데이터 — 이식 가능(portable) 시드
//  dummy_records.sql 실행 "후" 1회 실행하면, 팀원 누구의 PC 에서도
//  운동 종류명 + 세트/중량/횟수/시간/거리/강도 가 정상 표시됩니다.
//
//  왜 필요한가:
//   - 운동 종류(exercise_type) _id 는 머신마다 다르게 자동생성됩니다
//     (ExerciseTypeDataInitializer 가 @Id 를 지정하지 않음). 그래서
//     dummy_records.sql 의 하드코딩 ObjectId 는 "이 작성자 PC" 값이라
//     다른 PC 에선 종류명이 안 잡힙니다. → 여기서 '이름'으로 다시 매핑.
//   - 세트/중량/횟수/시간 은 MySQL 이 아니라 MongoDB user_exercise_detail
//     에 저장됩니다. dummy_records.sql 은 이 컬렉션을 안 건드립니다. → 여기서 시드.
//
//  실행:
//    cd seed
//    npm install                 # 최초 1회
//    USER_ID=<본인ID> node seed_exercise.mjs           # bash/git-bash
//    $env:USER_ID="<본인ID>"; node seed_exercise.mjs   # PowerShell
//
//  멱등(idempotent): 여러 번 실행해도 중복 없이 같은 결과. dummy_records.sql
//  을 재실행해 운동 행 id 가 바뀌어도, 자연키로 다시 찾아 맞춥니다.
// ============================================================
import mysql from "mysql2/promise";
import { MongoClient, Long } from "mongodb";

const USER_ID = Number(process.env.USER_ID ?? 1);
const MYSQL = {
  host: process.env.MYSQL_HOST ?? "127.0.0.1",
  port: Number(process.env.MYSQL_PORT ?? 3306),
  user: process.env.MYSQL_USER ?? "ballife",
  password: process.env.MYSQL_PASSWORD ?? "1234",
  database: process.env.MYSQL_DB ?? "project_ballife",
};
const MONGO_URI = process.env.MONGO_URI ?? "mongodb://127.0.0.1:27017";
const MONGO_DB = process.env.MONGO_DB ?? "Ballife";
const DETAIL_CLASS = "com.prologue.ballife.domain.exercise.UserExerciseDetail";

// dummy_records.sql 이 넣는 9개 운동을 (날짜, 시각, 운동이름)으로 식별.
// 운동이름은 모든 머신에서 동일하므로 머신별 ObjectId 문제를 우회한다.
//   무산소 → exerciseSet/exerciseReps/exerciseWeight, 유산소 → exerciseHard/distanceKm. (둘 다 exerciseMin)
const WORKOUTS = [
  { date: "2026-06-01", time: "09:00:00", name: "벤치프레스", detail: { exerciseMin: 30, exerciseSet: 5, exerciseReps: 10, exerciseWeight: 60 } },
  { date: "2026-06-03", time: "18:30:00", name: "사이클",     detail: { exerciseMin: 40, exerciseHard: "보통", distanceKm: 15 } },
  { date: "2026-06-04", time: "08:15:00", name: "벤치프레스", detail: { exerciseMin: 28, exerciseSet: 5, exerciseReps: 8,  exerciseWeight: 65 } },
  { date: "2026-06-06", time: "07:40:00", name: "사이클",     detail: { exerciseMin: 45, exerciseHard: "높음", distanceKm: 18 } },
  { date: "2026-06-06", time: "18:25:00", name: "바벨로우",   detail: { exerciseMin: 25, exerciseSet: 4, exerciseReps: 12, exerciseWeight: 50 } },
  { date: "2026-06-07", time: "12:05:00", name: "벤치프레스", detail: { exerciseMin: 30, exerciseSet: 5, exerciseReps: 10, exerciseWeight: 60 } },
  { date: "2026-06-09", time: "19:10:00", name: "사이클",     detail: { exerciseMin: 35, exerciseHard: "보통", distanceKm: 13 } },
  { date: "2026-06-10", time: "17:50:00", name: "바벨로우",   detail: { exerciseMin: 30, exerciseSet: 4, exerciseReps: 12, exerciseWeight: 55 } },
  { date: "2026-06-11", time: "09:30:00", name: "벤치프레스", detail: { exerciseMin: 32, exerciseSet: 6, exerciseReps: 10, exerciseWeight: 62 } },
];

async function main() {
  console.log(`[seed-exercise] USER_ID=${USER_ID}  mysql=${MYSQL.host}:${MYSQL.port}/${MYSQL.database}  mongo=${MONGO_DB}`);
  const sql = await mysql.createConnection(MYSQL);
  const mongo = new MongoClient(MONGO_URI);
  try {
    await mongo.connect();
    const exTypeCol = mongo.db(MONGO_DB).collection("exercise_type");
    const detailCol = mongo.db(MONGO_DB).collection("user_exercise_detail");

    // 1) 운동이름 → 이 PC 의 실제 exercise_type ObjectId
    const types = await exTypeCol.find({}, { projection: { exerciseName: 1 } }).toArray();
    const nameToId = new Map(types.map((t) => [t.exerciseName, t._id.toString()]));
    const needed = [...new Set(WORKOUTS.map((w) => w.name))];
    const missing = needed.filter((n) => !nameToId.has(n));
    if (missing.length) {
      console.error(`[seed-exercise] exercise_type 에 다음 이름이 없습니다: ${missing.join(", ")}`);
      console.error(`  → 백엔드를 한 번 부팅해 ExerciseTypeDataInitializer 가 exercise_type 을 시드하게 한 뒤 다시 실행하세요.`);
      process.exitCode = 1;
      return;
    }

    // 2) 시드된 운동 행의 exercise_type_id 를 '이름 기준 실제 id' 로 교정 + 실제 user_exercise_id 확보
    const resolved = [];
    for (const w of WORKOUTS) {
      const realTypeId = nameToId.get(w.name);
      const [upd] = await sql.execute(
        `UPDATE user_exercise SET exercise_type_id = ?
           WHERE user_id = ? AND exercise_date = ? AND exercise_time = ?
             AND (is_deleted = 0 OR is_deleted IS NULL)`,
        [realTypeId, USER_ID, w.date, w.time]
      );
      if (upd.affectedRows === 0) {
        console.warn(`[seed-exercise] WARN ${w.date} ${w.time} 운동 행이 없음 (USER_ID=${USER_ID}). dummy_records.sql 를 먼저 실행했나요? 건너뜀.`);
        continue;
      }
      const [rows] = await sql.execute(
        `SELECT user_exercise_id FROM user_exercise
           WHERE user_id = ? AND exercise_date = ? AND exercise_time = ?
             AND (is_deleted = 0 OR is_deleted IS NULL)
           ORDER BY user_exercise_id DESC LIMIT 1`,
        [USER_ID, w.date, w.time]
      );
      resolved.push({ id: Number(rows[0].user_exercise_id), detail: w.detail });
    }
    if (!resolved.length) {
      console.error("[seed-exercise] 매칭된 운동 행이 없습니다. dummy_records.sql 를 본인 USER_ID 로 먼저 실행하세요.");
      process.exitCode = 1;
      return;
    }

    // 3) 상세 문서 upsert (해당 id 들만 정리 후 삽입 → 멱등, 중복 없음)
    const ids = resolved.map((r) => Long.fromNumber(r.id));
    const del = await detailCol.deleteMany({ userExerciseId: { $in: ids } });
    const docs = resolved.map((r) => ({ userExerciseId: Long.fromNumber(r.id), ...r.detail, _class: DETAIL_CLASS }));
    const ins = await detailCol.insertMany(docs);

    console.log(`[seed-exercise] 운동종류 id 교정 완료, 상세 ${Object.keys(ins.insertedIds).length}건 삽입 (기존 ${del.deletedCount}건 정리). 완료.`);
    console.log(`[seed-exercise] 검증: db.user_exercise_detail.countDocuments({userExerciseId:{$in:[${ids.map(String).join(",")}]}}) == ${resolved.length}`);
  } finally {
    await sql.end();
    await mongo.close();
  }
}

main().catch((e) => {
  console.error("[seed-exercise] FAILED:", e);
  process.exit(1);
});
