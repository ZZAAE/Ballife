import api from "./api";

const missionApi = {
  // 내 미션 현황 + 보유 포인트 조회
  getMissions: () => api.get("/users/missions"),

  // 미션 보상 수령 (code: MissionType 이름, 예: "DAILY_RECORD")
  claim: (code) => api.post(`/users/missions/${code}/claim`),
};

export default missionApi;
