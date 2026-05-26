import api from "./api";

const userConfigApi = {
  getTargetWeight: (userId) =>
    api.get(`/user-config/${userId}/targetWeight`),

  getTargetDailyCaloriesBurned: (userId) =>
    api.get(`/user-config/${userId}/targetDailyCaloriesBurned`),

  getTargetDailyCaloriesIntake: (userId) =>
    api.get(`/user-config/${userId}/targetDailyCaloriesIntake`),

  getTargetDailyWaterIntake: (userId) =>
    api.get(`/user-config/${userId}/targetDailyWaterIntake`),

  getMealTimes: (userId) =>
    api.get(`/user-config/${userId}/mealTimes`),
};

export default userConfigApi;
