import { getToken } from "../lib/tokenStore";
import { API_BASE_URL } from "../lib/runtime";

// 운동 기록 전용 베이스 URL — RN 에서는 runtime.js 의 API_BASE_URL 사용
const EXERCISE_API_BASE =
  process.env.EXPO_PUBLIC_EXERCISE_API_BASE_URL || API_BASE_URL;

async function request(path, options = {}) {
  const accessToken = getToken();
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
