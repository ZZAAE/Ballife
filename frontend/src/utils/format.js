import i18n from "../i18n";

/**
 * 로케일 인지 숫자/날짜 포맷 헬퍼.
 * 기존의 `${y}년 ${m}월 ${d}일`, `toLocaleString()` 같은 한국어 고정 포맷을
 * 현재 선택된 언어(i18n.language)에 맞춰 출력하기 위한 공용 유틸.
 */

/** 현재 i18n 언어 (Intl 로케일로 사용). */
export function currentLocale() {
  return i18n.language || "ko";
}

/** 숫자 포맷 (천단위 구분 등). value 가 숫자가 아니면 원본 반환. */
export function formatNumber(value, options) {
  if (value == null || value === "" || isNaN(Number(value))) return value;
  return new Intl.NumberFormat(currentLocale(), options).format(Number(value));
}

/** 날짜 포맷. 기본은 "연 월 일" (로케일 표기). 잘못된 날짜는 빈 문자열. */
export function formatDate(
  date,
  options = { year: "numeric", month: "long", day: "numeric" }
) {
  if (date == null || date === "") return "";
  const d = date instanceof Date ? date : new Date(date);
  if (isNaN(d.getTime())) return "";
  return new Intl.DateTimeFormat(currentLocale(), options).format(d);
}

/** 짧은 날짜 (예: 2026. 6. 9. / Jun 9, 2026). */
export function formatDateShort(date) {
  return formatDate(date, { year: "numeric", month: "short", day: "numeric" });
}

/** 월/일만 (예: 6월 9일 / Jun 9). */
export function formatMonthDay(date) {
  return formatDate(date, { month: "long", day: "numeric" });
}

/** 시각 HH:MM. */
export function formatTime(date, options = { hour: "2-digit", minute: "2-digit" }) {
  if (date == null || date === "") return "";
  const d = date instanceof Date ? date : new Date(date);
  if (isNaN(d.getTime())) return "";
  return new Intl.DateTimeFormat(currentLocale(), options).format(d);
}
