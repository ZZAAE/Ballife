import api from "./api";

const bioValueRecordApi = {
  createBioValueRecord: (userId, payload) => {
    return api.post(`/bioValueRecords/${userId}`, JSON.stringify(payload), {
      headers: { "Content-Type": "application/json" },
    });
  },

  getLastBioValueRecord: (userId, category) => {
    return api.get(`/bioValueRecords/searchBioValueTop/${userId}`, {
      params: { category },
    });
  },

  searchByDate: (userId, category, recordDate) => {
    return api.get(`/bioValueRecords/searchRecordDate/${userId}`, {
      params: { category, recordDate },
    });
  },

  searchByDateBetween: (userId, category, start, end) => {
    return api.get(`/bioValueRecords/searchRecordDateBetween/${userId}`, {
      params: { category, start, end },
    });
  },

  // 카테고리별 최신 기록 1건 
  getLatestPageByCategory: (userId, category) => {
    return api.get(`/bioValueRecords/searchBioValuePage/${userId}`, {
      params: { category, page: 0, size: 1 },
    });
  },

  updateBioValueRecord: (recordId, payload) => {
    return api.put(`/bioValueRecords/${recordId}`, payload);
  },

  deleteBioValueRecord: (recordId) => {
    return api.delete(`/bioValueRecords/${recordId}`);
  },
};

export default bioValueRecordApi;
