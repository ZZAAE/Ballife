import { ACCESS_TOKEN_KEY } from "./api";

const EXERCISE_API_BASE =
  (typeof import.meta !== "undefined" &&
    (import.meta.env?.VITE_EXERCISE_API_BASE_URL ||
      import.meta.env?.VITE_API_BASE_URL)) ||
  "http://localhost:8080/api";

async function request(path, options = {}) {
  const accessToken = localStorage.getItem(ACCESS_TOKEN_KEY);
  const response = await fetch(`${EXERCISE_API_BASE}${path}`, {
    headers: {
      "Content-Type": "application/json",
      ...(accessToken ? { Authorization: `Bearer ${accessToken}` } : {}),
      ...(options.headers || {}),
    },
    ...options,
  });

  if (!response.ok) {
    let message = "운동 기록 요청에 실패했습니다.";
    try {
      const data = await response.json();
      message = data?.message || message;
    } catch {
      // ignore parse errors and use the default message
    }
    throw new Error(message);
  }

  if (response.status === 204) {
    return null;
  }

  return response.json();
}

export function createExercise(userId, payload) {
  return request(`/users/${userId}/exercises`, {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

// 특정 날짜(미지정 시 오늘)의 소모 칼로리 합계
export function getBurnedCalorieByDate(userId, date) {
  const query = date ? `?date=${date}` : "";
  return request(`/users/${userId}/exercises/burned-calorie${query}`);
}
