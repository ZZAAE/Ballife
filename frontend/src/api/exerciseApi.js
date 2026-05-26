const EXERCISE_API_BASE =
  (typeof import.meta !== "undefined" &&
    (import.meta.env?.VITE_EXERCISE_API_BASE_URL ||
      import.meta.env?.VITE_API_BASE_URL)) ||
  "http://localhost:8080/api";

async function request(path, options = {}) {
  const response = await fetch(`${EXERCISE_API_BASE}${path}`, {
    headers: {
      "Content-Type": "application/json",
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

export function createMockExercise(userId, payload) {
  return request(`/mock/users/${userId}/exercises`, {
    method: "POST",
    body: JSON.stringify(payload),
  });
}
