import api from './index';

const authApi = {

    //회원가입
    signUp: (userData) => {
        return api.post('/auth/signup', userData);
    },

    //로그인
    login: (credentials) => {
        return api.post('/auth/login', credentials);
    },

    //사용자명 중복 체크
    checkUsername: (username) => {
        return api.get('auth/check-loginid', 
            {params: {username}});
    },

    //닉네임 중복 체크
    checkEmail: (email) => {
        return api.get('auth/check-nickname', 
            {params: {email}});
    },

    //이메일 중복 체크
    checkEmail: (email) => {
        return api.get('auth/check-email', 
            {params: {email}});
    },
};

export default authApi;