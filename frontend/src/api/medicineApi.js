import api from './api';

const medicineApi = {
    search: (itemName) => api.get('/medicines', { params: { itemName } }),
};

export default medicineApi;