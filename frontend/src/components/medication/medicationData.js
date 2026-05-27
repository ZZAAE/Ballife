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

// 기존 코드 호환용 (정적 import도 가능)
export const weekData = getCurrentWeekData();
