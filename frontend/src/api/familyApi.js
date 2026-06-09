import api from "./api";

// 가족 그룹 API — 초대 코드 + 항목별 동의 기반 공유
const familyApi = {
  // 내 가족 상태 { inGroup, role, groupId, groupName, inviteCode, ownerNickname, groupActive, myConsent, members }
  getMyFamily: () => {
    return api.get("/family/me");
  },

  // 가족 그룹 생성/조회 (FAMILY 오너)
  createGroup: () => {
    return api.post("/family/group");
  },

  // 초대 코드 재발급 → { inviteCode }
  rotateInviteCode: () => {
    return api.post("/family/group/invite-code/rotate");
  },

  // 초대 코드로 합류
  join: (inviteCode) => {
    return api.post("/family/join", { inviteCode });
  },

  // 가족 구성원 목록 (동의 기반 공유 데이터 포함)
  getMembers: () => {
    return api.get("/family/members");
  },

  // 특정 구성원 건강 상세
  getMemberHealth: (targetUserId) => {
    return api.get(`/family/members/${targetUserId}/health`);
  },

  // 내 공유 동의 갱신 { shareBloodSugar, shareBloodPressure, shareMedication?, shareExercise? }
  updateConsent: (payload) => {
    return api.put("/family/me/consent", payload);
  },

  // 그룹 나가기 (구성원)
  leave: () => {
    return api.delete("/family/me");
  },

  // 구성원 추방 (오너)
  removeMember: (targetUserId) => {
    return api.delete(`/family/members/${targetUserId}`);
  },
};

export default familyApi;
