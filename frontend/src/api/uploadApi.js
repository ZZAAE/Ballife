import api from "./api";

const uploadApi = {
  /**
   * 이미지 업로드 → 서버가 저장 후 URL 반환
   * @param {File} file
   * @param {string} subDir "meal" / "profile" 등 (영문)
   * @returns {Promise<{ url: string }>}
   */
  uploadImage: async (file, subDir = "meal") => {
    const form = new FormData();
    form.append("file", file);
    form.append("subDir", subDir);
    const res = await api.post("/upload", form, {
      headers: { "Content-Type": "multipart/form-data" },
      timeout: 30000,
    });
    return res.data; // { url: "/uploads/meal/..." }
  },
};

export default uploadApi;
