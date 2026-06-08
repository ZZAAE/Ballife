import axios from "axios";
import toast from "../lib/toast";
import { API_BASE_URL } from "../lib/runtime";
import { getToken, clearToken } from "../lib/tokenStore";

// 401 등으로 세션이 끊겼을 때 AuthContext 가 사용자 상태를 비우도록 등록하는 훅.
let unauthorizedHandler = null;
export function setUnauthorizedHandler(fn) {
  unauthorizedHandler = fn;
}

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
});

api.interceptors.request.use(
  (config) => {
    // FormData 면 Content-Type 자동 설정에 맡김
    if (!(config.data instanceof FormData)) {
      const method = (config.method || "get").toLowerCase();
      if (["post", "put", "patch"].includes(method) && config.data != null) {
        config.headers = config.headers || {};
        if (!config.headers["Content-Type"]) {
          config.headers["Content-Type"] = "application/json";
        }
      }
    }

    const token = getToken(); // 메모리 캐시(동기)
    if (token) {
      config.headers = config.headers || {};
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error),
);

api.interceptors.response.use(
  (response) => response,
  (error) => {
    const message = error.response?.data?.message || "오류가 발생했습니다";
    toast.error(message);

    if (error.response?.status === 401) {
      clearToken();
      if (unauthorizedHandler) unauthorizedHandler();
    }
    return Promise.reject(error);
  },
);

export default api;
