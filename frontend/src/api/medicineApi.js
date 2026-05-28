import api from "./api";

// 처방전(Prescription) / 처방 약(UserMedicine) API
// baseURL 에 이미 "/api" 가 포함되어 있으므로 경로에는 "/api" 를 붙이지 않는다.
const medicineApi = {
  // 사용자 처방전 목록 조회 (복용량 dosage 포함)
  getPrescriptions: (userId) => {
    return api.get(`/prescriptions/user/${userId}`);
  },

  // 처방전 + 약 등록 (복용량 dosage 포함)
  registerMedicine: (payload) => {
    // payload: { prescriptionName, prescriptionDate, memo, intakeIntervals, dosage, medicines: [{ kdCode, supplementId }] }
    return api.post(`/register/medicine`, payload);
  },

  // 처방전별 약 목록 조회
  getUserMedicine: (prescriptionId) => {
    return api.post(`/${prescriptionId}`);
  },
};

export default medicineApi;
