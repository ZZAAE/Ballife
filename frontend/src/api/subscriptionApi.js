import api from "./api";

// 구독 API — 모의 결제 기반
const subscriptionApi = {
  // 내 구독 상태 { plan, planName, monthlyPrice, status, startedAt, expiresAt, active, reportAccess, familyAccess }
  getMySubscription: () => {
    return api.get("/subscriptions/me");
  },

  // 모의 결제로 플랜 활성화 (plan: "INDIVIDUAL" | "FAMILY")
  activate: (plan) => {
    return api.post("/subscriptions/activate", { plan });
  },

  // 구독 해지
  cancel: () => {
    return api.post("/subscriptions/cancel");
  },
};

export default subscriptionApi;
