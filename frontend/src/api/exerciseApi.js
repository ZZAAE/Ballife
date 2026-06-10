import { ACCESS_TOKEN_KEY } from "./api";
import i18n from "../i18n";

const EXERCISE_API_BASE =
  (typeof import.meta !== "undefined" &&
    (import.meta.env?.VITE_EXERCISE_API_BASE_URL ||
      import.meta.env?.VITE_API_BASE_URL)) ||
  "/api";

async function request(path, options = {}) {
  const accessToken = localStorage.getItem(ACCESS_TOKEN_KEY);
  const response = await fetch(`${EXERCISE_API_BASE}${path}`, {
    headers: {
      "Content-Type": "application/json",
      "Accept-Language": i18n.language || "ko",
      ...(accessToken ? { Authorization: `Bearer ${accessToken}` } : {}),
      ...(options.headers || {}),
    },
    ...options,
  });

  if (!response.ok) {
    let message = i18n.t("errors.exerciseRequestFailed");
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

export function updateExercise(userId, userExerciseId, payload) {
  return request(`/users/${userId}/exercises/${userExerciseId}`, {
    method: "PUT",
    body: JSON.stringify(payload),
  });
}

export function deleteExercise(userId, userExerciseId) {
  return request(`/users/${userId}/exercises/${userExerciseId}`, {
    method: "DELETE",
  });
}

// 특정 날짜(미지정 시 오늘)의 소모 칼로리 합계
export function getBurnedCalorieByDate(userId, date) {
  const query = date ? `?date=${date}` : "";
  return request(`/users/${userId}/exercises/burned-calorie${query}`);
}

// 기간 내 운동 + 상세를 한 번에 가져옴
export function getExercisesInRange(userId, startDate, endDate) {
  return request(
    `/users/${userId}/exercises/detailed?start=${startDate}&end=${endDate}`,
  );
}

// 모든 운동 종류 조회 (MET 값 포함)
export function getExerciseTypes() {
  return request(`/exercise-types`);
}
