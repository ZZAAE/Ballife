import api from "./api";

const medalApi = {
  // 내 보유 메달 전체 조회
  getMyMedals: () => api.get("/users/medals"),

  // 전체 메달 목록 조회
  getAllMedals: () => api.get("/medals"),

  // 메달 획득
  acquireMedal: (medalId) => api.post("/users/medals", { medalId }),

  // 보유 메달 삭제
  removeUserMedal: (medalId) => api.delete(`/users/medals/${medalId}`),

  // 포인트 기준 메달 자동 지급 체크
  checkMedals: () => api.post("/users/medals/check"),

  // 메달 장착 (대표 메달 설정)
  equipMedal: (medalId) => api.put(`/users/medals/${medalId}/equip`),
};

export default medalApi;
