const STORAGE_KEY_PREFIX = "ballife.exerciseRecords";

export const CARDIO_OPTIONS = [
  { value: "cycling", label: "사이클", iconType: "cycling" },
  { value: "running", label: "러닝", iconType: "running" },
  { value: "jumprope", label: "줄넘기", iconType: "jumprope" },
  { value: "walking", label: "걷기", iconType: "walking" },
  { value: "stair", label: "천국의 계단", iconType: "stair" },
];

export const STRENGTH_OPTIONS = [
  { value: "dumbbellpress", label: "벤치프레스", iconType: "dumbbellpress" },
  { value: "squat", label: "스쿼트", iconType: "squat" },
  { value: "deadlift", label: "데드리프트", iconType: "deadlift" },
  { value: "shoulderpress", label: "숄더프레스", iconType: "dumbbellpress" },
  { value: "barbellrow", label: "바벨로우", iconType: "barbelllow" },
];

export const EXERCISE_META = [...CARDIO_OPTIONS, ...STRENGTH_OPTIONS].reduce(
  (accumulator, option) => {
    accumulator[option.value] = option;
    return accumulator;
  },
  {},
);

const EXERCISE_META_BY_LABEL = [...CARDIO_OPTIONS, ...STRENGTH_OPTIONS].reduce(
  (accumulator, option) => {
    accumulator[option.label] = option;
    return accumulator;
  },
  {},
);

export const ICON_BY_TYPE = {
  cycling: "🚴",
  running: "🏃",
  stair: "🪜",
  walking: "🚶",
  swimming: "🏊",
  jumprope: "🤸",
  dumbbellpress: "🏋️",
  bumbellpress: "🏋️",
  barbelllow: "🏋️",
  latpulldown: "🏋️",
  squat: "🏋️",
  deadlift: "💪",
  pullup: "🧗",
  shoulderpress: "🏋️",
  barbellrow: "🏋️",
};

export const INTENSITY_OPTIONS = ["낮음", "보통", "높음"];

// 무산소(웨이트): 볼륨(중량 × 횟수 × 세트)에 비례해 MET 가 연속적으로 변함
//   MET = 4 + 4 × √(볼륨 / 5000)   (볼륨 0 → 4, 볼륨 5000 → 8, 이후로도 완만히 증가)
// kcal = MET × 체중(kg) × 운동시간(h)
export function anaerobicVolume(row) {
  const weight = Number(row.weightKg) || 0;
  const reps = Number(row.exerciseReps) || 0;
  const sets = Number(row.exerciseSet) || 0;
  return weight * reps * sets;
}

export function anaerobicMetByVolume(volume) {
  const v = Math.max(0, Number(volume) || 0);
  return 4 + 4 * Math.sqrt(v / 5000);
}

// 유산소: 운동 종류 × 강도(낮음/보통/높음) → MET
// (CARDIO_OPTIONS 의 value 키 기준)
export const AEROBIC_MET_BY_INTENSITY = {
  walking: { 낮음: 3, 보통: 4, 높음: 5 }, // 걷기 (4km/h 등)
  running: { 낮음: 8, 보통: 10, 높음: 12 }, // 러닝 (조깅 8 / 달리기 10 / 빠른 달리기 12 km/h)
  cycling: { 낮음: 4.5, 보통: 7, 높음: 11 }, // 사이클
  jumprope: { 낮음: 8, 보통: 11, 높음: 13 }, // 줄넘기
  stair: { 낮음: 6, 보통: 8.5, 높음: 11 }, // 천국의 계단(스텝밀)
};

export function aerobicMet(exerciseTypeId, intensity) {
  const tiers = AEROBIC_MET_BY_INTENSITY[exerciseTypeId];
  if (!tiers) return 0;
  return tiers[intensity] ?? tiers["보통"];
}

// 천국의 계단 강도 선택 안내 (단계 → 강도)
export const STAIR_INTENSITY_HINT =
  "1~2단계 = 낮음 · 3~5단계 = 보통 · 6단계~ = 높음";

export function createAerobicRow(id) {
  return {
    id,
    exerciseTypeId: CARDIO_OPTIONS[0].value,
    distanceKm: "",
    durationText: "",
    intensity: "보통",
  };
}

export function createAnaerobicRow(id) {
  return {
    id,
    exerciseTypeId: STRENGTH_OPTIONS[0].value,
    exerciseSet: 1,
    weightKg: "",
    exerciseReps: "",
    durationText: "",
  };
}

export function parseDurationToSeconds(value) {
  const raw = String(value || "").trim();
  if (!raw) {
    return 0;
  }

  if (/^\d+$/.test(raw)) {
    return Number(raw) * 60;
  }

  if (/^\d{1,2}:\d{1,2}(:\d{1,2})?$/.test(raw)) {
    const units = raw.split(":").map(Number);
    if (units.length === 2) {
      return units[0] * 60 + units[1];
    }
    return units[0] * 3600 + units[1] * 60 + units[2];
  }

  const compact = raw.replace(/\s+/g, "");
  const match = compact.match(/^(?:(\d+)시간)?(?:(\d+)분)?(?:(\d+)초)?$/);
  if (!match) {
    return 0;
  }

  const hours = Number(match[1] || 0);
  const minutes = Number(match[2] || 0);
  const seconds = Number(match[3] || 0);
  return hours * 3600 + minutes * 60 + seconds;
}

export function formatDateParts(date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  const hours = String(date.getHours()).padStart(2, "0");
  const minutes = String(date.getMinutes()).padStart(2, "0");
  const seconds = String(date.getSeconds()).padStart(2, "0");

  return {
    exerciseDate: `${year}-${month}-${day}`,
    exerciseTime: `${hours}:${minutes}:${seconds}`,
  };
}

export function buildCreatePayload(kind, row, recordedAt) {
  const base = {
    exerciseTypeId: row.exerciseTypeId,
    ...formatDateParts(recordedAt),
  };

  const durationSec = parseDurationToSeconds(row.durationText);
  const exerciseMin = Math.max(1, Math.ceil(durationSec / 60));

  if (kind === "aerobic") {
    return {
      ...base,
      exerciseMin,
      exerciseHard: row.intensity,
      distanceKm: row.distanceKm !== "" ? Number(row.distanceKm) : null,
    };
  }

  // 무산소: 세트/중량/횟수(볼륨 계산용) + 시간
  return {
    ...base,
    exerciseMin,
    exerciseSet: Number(row.exerciseSet) || 0,
    exerciseReps: Number(row.exerciseReps) || 0,
    exerciseWeight: row.weightKg !== "" ? Number(row.weightKg) : null,
  };
}

function getStorageKey(userId) {
  return `${STORAGE_KEY_PREFIX}.${userId}`;
}

export function loadExerciseRecords(userId) {
  const raw = localStorage.getItem(getStorageKey(userId));
  if (!raw) {
    return [];
  }

  try {
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export function saveExerciseRecords(userId, records) {
  localStorage.setItem(getStorageKey(userId), JSON.stringify(records));
}

export function appendExerciseRecords(userId, newRecords) {
  const nextRecords = [...loadExerciseRecords(userId), ...newRecords].sort(
    (left, right) => new Date(right.dateIso) - new Date(left.dateIso),
  );
  saveExerciseRecords(userId, nextRecords);
  return nextRecords;
}

export function replaceExerciseRecord(userId, recordId, updatedRecord) {
  const next = loadExerciseRecords(userId).map((record) =>
    record.id === recordId || record.serverId === recordId
      ? { ...record, ...updatedRecord }
      : record,
  );
  saveExerciseRecords(userId, next);
  return next;
}

export function removeExerciseRecord(userId, recordId) {
  const next = loadExerciseRecords(userId).filter(
    (record) => record.id !== recordId && record.serverId !== recordId,
  );
  saveExerciseRecords(userId, next);
  return next;
}

export function hydrateExerciseSessions(records) {
  return records.map((record) => ({
    ...record,
    date: new Date(record.dateIso),
  }));
}

// 백엔드 DetailedResponse → 프론트 session 객체로 변환
export function dbExerciseToRecord(dto) {
  const meta = EXERCISE_META_BY_LABEL[dto.exerciseName] || null;
  const isCardio = dto.exerciseCategory === "유산소";
  const time = dto.exerciseTime || "00:00:00";
  const dateIso = `${dto.exerciseDate}T${time.length >= 5 ? time : `${time}:00`}`;

  const durationSec = (() => {
    const min = Number(dto.exerciseMin) || 0;
    if (min > 0) return min * 60;
    if (!isCardio) {
      const sets = Number(dto.exerciseSet) || 0;
      const reps = Number(dto.exerciseReps) || 0;
      return Math.max(sets * reps * 3, sets * 60);
    }
    return 0;
  })();

  return {
    id: dto.userExerciseId,
    serverId: dto.userExerciseId,
    // 프론트에서 사용하는 영문 키로 정규화 (모달 select 값과 일치)
    exerciseTypeId: meta?.value ?? dto.exerciseTypeId,
    iconType: meta?.iconType ?? (isCardio ? "running" : "dumbbellpress"),
    name: dto.exerciseName ?? "운동",
    kind: isCardio ? "cardio" : "strength",
    dateIso,
    durationSec,
    calories: dto.burnedCalorie ?? 0,
    distanceKm: isCardio ? (dto.distanceKm ?? null) : null,
    sets: isCardio ? null : (dto.exerciseSet ?? null),
    reps: isCardio ? null : (dto.exerciseReps ?? null),
    weightKg: isCardio ? null : (dto.exerciseWeight ?? null),
    // 강도는 유산소에서만 사용 (무산소는 볼륨으로 MET/칼로리 결정)
    intensity: isCardio ? (dto.exerciseHard ?? "보통") : null,
    createdAt: dateIso,
  };
}

export function secondsToDurationText(totalSec) {
  const sec = Math.max(0, Math.round(Number(totalSec) || 0));
  const m = Math.floor(sec / 60);
  const s = sec % 60;
  if (m > 0 && s > 0) return `${m}분${s}초`;
  if (m > 0) return `${m}분`;
  return `${s}초`;
}

export function recordToRow(record, rowId) {
  const kind = record.kind === "cardio" ? "aerobic" : "anaerobic";
  if (kind === "aerobic") {
    return {
      kind,
      row: {
        id: rowId,
        exerciseTypeId: record.exerciseTypeId,
        distanceKm: record.distanceKm != null ? String(record.distanceKm) : "",
        durationText: secondsToDurationText(record.durationSec),
        intensity: record.intensity || "보통",
      },
    };
  }
  return {
    kind,
    row: {
      id: rowId,
      exerciseTypeId: record.exerciseTypeId,
      exerciseSet: Number(record.sets) || 1,
      weightKg: record.weightKg != null ? String(record.weightKg) : "",
      exerciseReps: record.reps != null ? String(record.reps) : "",
      durationText: secondsToDurationText(record.durationSec),
    },
  };
}

export function buildStoredExerciseRecord(response, kind, row, recordedAt) {
  const meta = EXERCISE_META[row.exerciseTypeId] || {
    label: row.exerciseTypeId,
    iconType: row.exerciseTypeId,
  };

  const durationSec =
    kind === "aerobic"
      ? parseDurationToSeconds(row.durationText)
      : Math.max(
          parseDurationToSeconds(row.durationText),
          (Number(row.exerciseSet) || 0) * (Number(row.exerciseReps) || 0) * 3,
        );

  return {
    id: response.userExerciseId,
    serverId: response.userExerciseId,
    exerciseTypeId: response.exerciseTypeId,
    iconType: meta.iconType,
    name: meta.label,
    kind: kind === "aerobic" ? "cardio" : "strength",
    dateIso: `${response.exerciseDate}T${response.exerciseTime || "00:00:00"}`,
    durationSec,
    calories: response.burnedCalorie ?? 0,
    distanceKm:
      kind === "aerobic" && row.distanceKm !== ""
        ? Number(row.distanceKm)
        : null,
    sets: kind === "anaerobic" ? Number(row.exerciseSet) || 0 : null,
    reps: kind === "anaerobic" ? Number(row.exerciseReps) || 0 : null,
    weightKg:
      kind === "anaerobic" && row.weightKg !== "" ? Number(row.weightKg) : null,
    intensity: kind === "aerobic" ? row.intensity : null,
    createdAt: recordedAt.toISOString(),
  };
}
