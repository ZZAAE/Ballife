import api from './api';

const medicineApi = {
    search: (itemName) => {
        return api.get('/medicines', { params: { itemName } })
    },

};

export default medicineApi;