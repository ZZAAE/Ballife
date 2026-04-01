import axios from 'axios'; //http 요청(API 호출)
import toast from 'react-hot-toast'; //알림 메세지(토스트)


//axios 인스턴스 생성
const api = axios.create({
    baseURL: 'http://localhost:8080/api',
    timeout: 10000, //1o초안에 응답 없으면 자동으로 요청 철회
    headers: {
        'content-Type': 'application/json',
    },
});


//요청 인터셉터: 요청시 반드시 거쳐야 하는 구간(미들웨어)
api.interceptors.request.use(
    (config) =>{
        //토큰이 있으면 헤더에 추가
        const token = localStorage.getItem('token'); //로컬스토리지에서 토큰 꺼내
        if(token){//토큰이 있으면
            config.headers.Authorization = `Bearer ${token}`; //헤더에 추가
        }
        return config; //수정된 설정 반환
    },
    (error) => {
        return Promise.reject(error);
    }
);

//응답 인터셉터(AOP)
api.interceptors.response.use(
    (response) => {
        return response;
    },
    (error) => {
        //에러 메세지 표시
        const message = error.response?.data?.message || '오류가 발생했습니다.';
        toast.error(message);

        //401 에러 (인증 실패) 시 로그인 페이지로 이동
        if(error.response?.status ==401){
            localStorage.removeItem('token'); //만료된 토큰 삭제
            window.location.href = '/login' //로그인 페이지로 강제 이동
        }

        return Promise.reject(error);
    }
);

export default api;