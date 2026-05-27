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

  // 카테고리별 최신 기록 1건 
  getLatestPageByCategory: (userId, category) => {
    return api.get(`/bioValueRecords/searchBioValuePage/${userId}`, {
      params: { category, page: 0, size: 1 },
    });
  },

  // 카테고리별 페이지 조회 (page, size 직접 지정)
  getPageByCategory: (userId, category, page = 0, size = 30) => {
    return api.get(`/bioValueRecords/searchBioValuePage/${userId}`, {
      params: { category, page, size },
    });
  },

  getPageByCategorySugar: (userId, page = 0, size = 200) => {
  return api.get(`/bioValueRecords/searchBioValuePageBloodSugar/${userId}`, {
    params: { page, size },
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
