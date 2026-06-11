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
    return api.get(`/prescriptions/${prescriptionId}/medicines`);
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
  },

  // ── 복약 체크(복용 기록) — DB 영속 ──────────────────────────
  // 특정 날짜의 복용 기록 목록 (로그인 유저 기준). date: "YYYY-MM-DD"
  getMedicineRecords: (date) => api.get('/medicine-records', { params: { date } }),

  // 복용 체크 ON. payload: { prescriptionId, intakeDate, intakeTime, takenCategory }
  markMedicineTaken: (payload) => api.post('/medicine-records', payload),

  // 복용 체크 OFF. { prescriptionId, date:"YYYY-MM-DD", takenCategory }
  unmarkMedicineTaken: ({ prescriptionId, date, takenCategory }) =>
    api.delete('/medicine-records', { params: { prescriptionId, date, takenCategory } }),

  // ── 상비약 직접 기록(PRN) — MongoDB 영속 (로그아웃해도 유지) ──────
  // 로그인 사용자의 상비약 기록 목록 (최신순)
  getPrnMedications: () => api.get('/prn-medications'),
  // 상비약 기록 추가. payload: { drugName, dosage, date:"YYYY-MM-DD", time:"HH:mm" }
  createPrnMedication: (payload) => api.post('/prn-medications', payload),
  // 상비약 기록 삭제 (id 는 Mongo 문자열 id)
  deletePrnMedication: (id) => api.delete(`/prn-medications/${id}`),
};

export default medicineApi;
