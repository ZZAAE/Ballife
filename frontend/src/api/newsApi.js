import api from "./api";

const newsApi = {
  // 메인 카드뉴스 (하이닥 최신 6건)
  getCards: () => {
    return api.get("/news/cards");
  },
};

export default newsApi;
