import api from "./api";

const petApi = {
    createPet: (userId) => {
        return api.post(`/pet/${userId}`);
    },

    getPetInfo: (userId) =>{
        return api.get(`/pet/${userId}`);
    },

    updatePetInnfo: (userId, payload) => {
        return api.put(`/pet/${userId}`, payload);
    },

    createAsset: (userId) => {
        return api.post(`/pet/asset/${userId}`);
    },

    getAssetList: (userId) => {
        return api.get(`/pet/asset/${userId}`);
    }
}