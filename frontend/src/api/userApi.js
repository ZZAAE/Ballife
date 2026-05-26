import api from "./api";

//회원 API 서비스
const userApi = {
  //회원 조회(ID)
  getMember: (userId) => {
    return api.get(`/users/${userId}`);
  },

  //회원 정보 수정
  updateMember: (userId, memberData) => {
    return api.put(`/users/${userId}`, memberData);
  },

  //회원 질병 정보 수정
  updateDisease: (userId, memberData) => {
    return api.put(`/users/disease/${userId}`, memberData);
  },

  //회원 삭제
  deleteMember: (userId) => {
    return api.delete(`/users/${userId}`);
  },
};

export default userApi;
