// 데모용 상태 (요일 기반) — 실제 데이터 연결 전 시각화용
const STATUS_BY_DAY = {
  MON: { morning: "done", lunch: "done", dinner: "done" },
  TUE: { morning: "done", lunch: "miss", dinner: "done" },
  WED: { morning: "done", lunch: "partial", dinner: "miss" },
  THU: { morning: "done", lunch: "done", dinner: "partial" },
  FRI: { morning: "done", lunch: "done", dinner: null },
  SAT: { morning: null, lunch: null, dinner: null },
  SUN: { morning: null, lunch: null, dinner: null },
};

const DAY_LABELS = ["MON", "TUE", "WED", "THU", "FRI", "SAT", "SUN"];

const isSameDay = (a, b) =>
  a.getFullYear() === b.getFullYear() &&
  a.getMonth() === b.getMonth() &&
  a.getDate() === b.getDate();

// 오늘이 속한 주의 월~일 데이터 생성. 오늘 이후(미래)는 기록 없음으로 처리.
export function getCurrentWeekData(today = new Date()) {
  const dow = today.getDay(); // 0=일, 1=월, ...
  const offsetFromMonday = dow === 0 ? -6 : 1 - dow;
  const monday = new Date(today);
  monday.setDate(today.getDate() + offsetFromMonday);

  const todayMid = new Date(today.getFullYear(), today.getMonth(), today.getDate());

  return DAY_LABELS.map((label, i) => {
    const d = new Date(monday);
    d.setDate(monday.getDate() + i);
    const dMid = new Date(d.getFullYear(), d.getMonth(), d.getDate());
    const isFuture = dMid > todayMid;

    const entry = {
      day: label,
      date: d.getDate(),
      ...(isFuture
        ? { morning: null, lunch: null, dinner: null }
        : STATUS_BY_DAY[label]),
    };
    if (isSameDay(d, today)) entry.today = true;
    if (label === "SAT" || label === "SUN") entry.weekend = true;
    return entry;
  });
}

// 특정 날짜의 데모 복용 상태(요일 기반)를 반환. 미래 날짜는 기록 없음으로 처리.
// 주간 달력(getCurrentWeekData)과 동일한 STATUS_BY_DAY 를 사용하므로 카드와 달력이 일치한다.
export function getDayStatus(date, today = new Date()) {
  const d =
    typeof date === "string" ? new Date(date + "T00:00:00") : new Date(date);
  if (Number.isNaN(d.getTime())) {
    return { morning: null, lunch: null, dinner: null };
  }
  const todayMid = new Date(
    today.getFullYear(),
    today.getMonth(),
    today.getDate()
  );
  const dMid = new Date(d.getFullYear(), d.getMonth(), d.getDate());
  if (dMid > todayMid) {
    return { morning: null, lunch: null, dinner: null };
  }
  // JS getDay(): 일=0 → DAY_LABELS 인덱스(월=0)로 변환
  const label = DAY_LABELS[(d.getDay() + 6) % 7];
  return STATUS_BY_DAY[label] || { morning: null, lunch: null, dinner: null };
}

// 기존 코드 호환용 (정적 import도 가능)
export const weekData = getCurrentWeekData();
