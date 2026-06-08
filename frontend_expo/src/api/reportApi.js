import api from "./api";

/**
 * 건강 분석 보고서 PDF 다운로드 API.
 *
 * 백엔드: GET /api/health-analysis/report/monthly
 *   - JWT 인증 필요 (api 인스턴스가 Authorization 헤더 자동 부착)
 *   - 응답: application/pdf 바이너리 + Content-Disposition 헤더
 *   - LLM(OpenAI Chat Completions) 호출 포함 → 최대 ~15초 소요 가능
 */
const reportApi = {
  // 월간(최근 30일) 보고서 PDF — responseType: blob 으로 받아 다운로드 트리거
  downloadMonthlyReport: () =>
    api.get("/health-analysis/report/monthly", {
      responseType: "blob",
      timeout: 30000, // 기본 10초 → 30초 (LLM 응답 + 여유)
    }),
};

export default reportApi;
