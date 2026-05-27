import axios from "axios";
import toast from 'react-hot-toast'

export const ACCESS_TOKEN_KEY = 'accessToken';
export const USER_KEY = 'loginUser';

const api = axios.create({
    baseURL: "http://localhost:8080/api",
    timeout: 10000
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
        const message = error.response?.data?.message || '오류가 발생했습니다';

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


