import api from "./api";

const authApi = {
  // 회원가입
  signUp: (userData) => api.post("/auth/signup", userData),

  // 로그인
  login: (credentials) => api.post("/auth/login", credentials),

  // 로그인 아이디 중복 체크
  checkUsername: (userId) =>
    api.get("auth/check-loginid", { params: { userId } }),

  // 닉네임 중복 체크
  checkNickname: (nickname) =>
    api.get("auth/check-nickname", { params: { nickname } }),

  // 이메일 중복 체크
  checkEmail: (email) => api.get("auth/check-email", { params: { email } }),
};

export default authApi;
