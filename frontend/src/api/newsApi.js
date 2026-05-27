import api from "./api";

const newsApi = {
  // 메인 카드뉴스 목록 (하이닥 RSS 기반, 백엔드 캐시)
  getCards: () => {
    return api.get("/news/cards");
  },
};

export default newsApi;
