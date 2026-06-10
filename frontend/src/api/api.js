import axios from "axios";
import toast from 'react-hot-toast'
import i18n from "../i18n";

export const ACCESS_TOKEN_KEY = 'accessToken';
export const USER_KEY = 'loginUser';

// 운영 배포에서는 /api 를 사용해 nginx 프록시를 탄다.
// 개발에서 직접 백엔드를 호출해야 할 때만 .env.local에 VITE_API_BASE_URL을 지정한다.
const api = axios.create({
    baseURL: import.meta.env.VITE_API_BASE_URL || "/api",
});

function clearContentTypeForMultipart(config){
    if(!(config.data instanceof FormData)) return;

    const h = config.headers;
    if(h && typeof h.delete === 'function'){
        h.delete('Content-Type');
        h.delete('content=type');
    }
    delete config.headers['Content-Type'];
    delete config.headers['content-type'];
}

function setJsonIfNeeded(config){
    const m = (config.method || 'get').toLowerCase();
    if(!['post', 'put', 'patch'].includes(m)) return;

    if(config.data == null || config.data instanceof FormData) return;
    if(typeof config.data === "string") return;
    const h = config.headers;

    const hasCt = (h && typeof h.has === 'function' && h.has('Content-Type')) ||
                   h?.['Content-Type'] ||
                   h?.['content-type'];
    if (hasCt) return;

    if (h && typeof h.set === 'function') {
        h.set('Content-Type', 'application/json');
    } else {
        config.headers['Content-Type'] = 'application/json';
    }
}

api.interceptors.request.use(
    (config) => {
        clearContentTypeForMultipart(config);
        setJsonIfNeeded(config);

        // 선택된 언어를 백엔드에 전달 (Spring LocaleResolver 가 Accept-Language 로 해석)
        const lang = i18n.language || "ko";
        const h = config.headers;
        if (h && typeof h.set === "function") {
            h.set("Accept-Language", lang);
        } else {
            config.headers["Accept-Language"] = lang;
        }

        const accessToken = localStorage.getItem(ACCESS_TOKEN_KEY);
        if(accessToken){
            const h = config.headers;
            if(h && typeof h.set === "function"){
                h.set('Authorization', `Bearer ${accessToken}`);
            } else {
                config.headers.Authorization = `Bearer ${accessToken}`;
            }
        }

        return config;
    },
    (error) => Promise.reject(error)
);

api.interceptors.response.use(
    (response) => response,

    (error) => {
        const message = error.response?.data?.message || i18n.t('errors.generic');

        toast.error(message);

        if(error.response?.status === 401){
            localStorage.removeItem(ACCESS_TOKEN_KEY);
            localStorage.removeItem(USER_KEY);
            localStorage.removeItem('user');
            localStorage.removeItem('token');

            // 사용자 기록 캐시 정리 — 다음 로그인 시 DB 에서 다시 불러오도록
            for (let i = localStorage.length - 1; i >= 0; i -= 1) {
                const key = localStorage.key(i);
                if (!key) continue;
                if (
                    key.startsWith('ballife.exerciseRecords.') ||
                    key === 'savedMedicationRecords' ||
                    key.startsWith('medicationSchedules_')
                ) {
                    localStorage.removeItem(key);
                }
            }
            //window.location.href = './login'
        }

        return Promise.reject(error);
    }
);

export default api


