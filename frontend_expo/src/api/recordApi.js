import api from './api';

//회원 API 서비스
const recordApi = {

    //수분 섭취 등록
    createWaterRecord: (userId, data) => {
        return api.post(`/bioValueRecords/${userId}`, data);
    },
};

export default recordApi;
