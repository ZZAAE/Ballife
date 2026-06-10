import api from "./api";

const petApi = {
    createPet: (userId) => {
        return api.post(`/pet/${userId}`);
    },

    getPetInfo: (userId) =>{
        return api.get(`/pet/${userId}`);
    },

    updatePetInfo: (userId, payload) => {
        return api.put(`/pet/${userId}`, payload);
    },

    createAsset: (userId, payload) => {
        return api.post(`/pet/asset/${userId}`, payload);
    },

    getAssetList: (userId) => {
        return api.get(`/pet/asset/${userId}`);
    }
}

export default petApi;