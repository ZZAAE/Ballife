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

  // 처방전 수정 (처방전 정보만)
  updatePrescription: (prescriptionId, payload) => {
    // payload: { prescriptionName, prescriptionDate, memo, intakeIntervals, dosage }
    return api.put(`/prescriptions/${prescriptionId}`, payload);
  },

  // 처방전 + 약 전체 수정 (약 목록까지 교체)
  updateMedicine: (prescriptionId, payload) => {
    // payload: { prescriptionName, memo, intakeIntervals, medicines: [{ medicineName }], ... }
    return api.put(`/register/medicine/${prescriptionId}`, payload);
  },

  // 처방전 삭제
  deletePrescription: (prescriptionId) => {
    return api.delete(`/prescriptions/${prescriptionId}`);
  },

  //OCR 스캔 (OCR + LLM + 식약처 조회로 시간이 걸려 타임아웃을 넉넉히 둔다)
  ocrScan: (formData) => {
    return api.post("/ocr", formData, { timeout: 60000 });
  },

  //약 조회
  search: (itemName) => {
    return api.get('/medicines/search', {params: {itemName}});
  }
};

export default medicineApi;
