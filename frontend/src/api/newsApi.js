import api from "./api";

const newsApi = {
  // 카테고리별 카드뉴스 (전체/당뇨/고혈압/통풍/비만/골다공증/고지혈증)
  getCards: (category = "전체") => {
    return api.get("/news/cards", { params: { category } });
  },
};

export default newsApi;
