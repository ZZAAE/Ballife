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
    };
  }

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

export function hydrateExerciseSessions(records) {
  return records.map((record) => ({
    ...record,
    date: new Date(record.dateIso),
  }));
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
          (Number(row.exerciseSet) || 0) * (Number(row.exerciseReps) || 0) * 3,
          (Number(row.exerciseSet) || 0) * 60,
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
