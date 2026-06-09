import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import toast from "react-hot-toast";
import { useAuth } from "../../contexts/AuthContext";
import postApi from "../../api/boardApi";
import Button from "../../components/button";
import RichTextEditor from "../../components/board/RichTextEditor";
import { isRichTextEmpty } from "../../components/board/richTextEditorUtils";

function createEmptyFormData() {
  return {
    category: "",
    title: "",
    content: "",
  };
}

function PostCreatePage() {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  // 등록을 누르지 않고 나갔다 다시 들어오면 항상 빈 폼으로 시작한다 (임시저장/복원 없음)
  const [formData, setFormData] = useState(createEmptyFormData);

  // 비로그인 사용자는 작성 페이지 진입 차단
  useEffect(() => {
    if (!user?.userId) {
      toast.error(t("postCreatePage.toast.loginRequired"));
      navigate("/login", { replace: true });
    }
  }, [user?.userId, navigate]);

  const categories = [
    { value: "", label: t("postCreatePage.category.placeholder") },
    { value: "GENERAL", label: t("postCreatePage.category.general") },
    { value: "HYPERLIPIDEMIA", label: t("postCreatePage.category.hyperlipidemia") },
    { value: "HYPERTENSION", label: t("postCreatePage.category.hypertension") },
    { value: "OSTEOPOROSIS", label: t("postCreatePage.category.osteoporosis") },
    { value: "DIABETES", label: t("postCreatePage.category.diabetes") },
    { value: "OBESITY", label: t("postCreatePage.category.obesity") },
    { value: "GOUT", label: t("postCreatePage.category.gout") },
    { value: "QNA", label: t("postCreatePage.category.qna") },
  ];

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleContentChange = (content) => {
    setFormData((prev) => ({ ...prev, content }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.category) {
      toast.error(t("postCreatePage.toast.selectCategory"));
      return;
    }

    if (!formData.title.trim()) {
      toast.error(t("postCreatePage.toast.enterTitle"));
      return;
    }

    if (isRichTextEmpty(formData.content)) {
      toast.error(t("postCreatePage.toast.enterContent"));
      return;
    }

    if (!user?.userId) {
      toast.error(t("postCreatePage.toast.missingLoginId"));
      return;
    }

    try {
      setLoading(true);
      const res = await postApi.createPost(user.userId, formData);
      toast.success(t("postCreatePage.toast.created"));
      navigate(`/posts/${res.data.id}`);
    } catch (error) {
      console.error("게시글 등록 실패:", error);
      toast.error(t("postCreatePage.toast.createFailed"));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F9FAFB] font-['Noto_Sans_KR'] text-[#0F172A]">
      <div className="flex pt-[55px]">
        <main className="flex-1">
          <div className="max-w-[1280px] mx-auto px-4 sm:px-6 py-8">
        <h1 className="text-[26px] font-extrabold tracking-tight text-[#0F172A] sm:text-[30px]">
          {t("postCreatePage.title")}
        </h1>
        <p className="mb-8 text-sm text-gray-500">
          {t("postCreatePage.subtitle")}
        </p>

        <form onSubmit={handleSubmit} className="space-y-7">
          <div className="space-y-6">
            <div>
              <label
                htmlFor="category"
                className="mb-2 block text-sm font-semibold text-gray-700"
              >
                {t("postCreatePage.label.category")}
              </label>
              <select
                id="category"
                name="category"
                value={formData.category}
                onChange={handleChange}
                className="h-12 w-full appearance-none rounded-xl border border-[#d8dee8] bg-white bg-no-repeat pl-4 pr-10 text-[15px] text-gray-700 outline-none transition focus:border-[#8fb4ff] focus:ring-4 focus:ring-blue-100"
                style={{
                  backgroundImage:
                    "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20' stroke='%2364748B'%3E%3Cpath stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='m6 8 4 4 4-4'/%3E%3C/svg%3E\")",
                  backgroundPosition: "right 16px center",
                  backgroundSize: "18px 18px",
                }}
              >
                {categories.map((category) => (
                  <option key={category.value} value={category.value}>
                    {category.label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label
                htmlFor="title"
                className="mb-2 block text-sm font-semibold text-gray-700"
              >
                {t("postCreatePage.label.title")}
              </label>
              <input
                id="title"
                name="title"
                type="text"
                value={formData.title}
                onChange={handleChange}
                placeholder={t("postCreatePage.placeholder.title")}
                maxLength={120}
                className="h-12 w-full rounded-xl border border-[#d8dee8] bg-white px-4 text-[15px] text-gray-700 outline-none transition placeholder:text-gray-300 focus:border-[#8fb4ff] focus:ring-4 focus:ring-blue-100"
              />
            </div>

            <div>
              <label
                htmlFor="content"
                className="mb-2 block text-sm font-semibold text-gray-700"
              >
                {t("postCreatePage.label.content")}
              </label>
              <RichTextEditor
                value={formData.content}
                onChange={handleContentChange}
                placeholder={t("postCreatePage.placeholder.content")}
              />
              <div className="mt-7 flex flex-wrap items-end justify-between gap-3">
                <p className="mb-3 text-sm text-gray-400 lg:ml-6">
                  {t("postCreatePage.imageHint")}
                </p>
                <div className="flex flex-wrap items-center gap-3">
                  <Button
                    type="button"
                    variant="secondary"
                    onClick={() => navigate(-1)}
                    className="rounded-[10px] border border-gray-200 !bg-white px-5 py-2.5 text-sm font-semibold !text-gray-700 shadow-sm transition hover:!bg-gray-50"
                  >
                    {t("postCreatePage.button.exit")}
                  </Button>
                  <Button
                    type="submit"
                    disabled={loading}
                    className="rounded-[10px] !bg-[#0F172A] px-6 py-2.5 text-sm font-semibold text-white transition hover:!bg-[#1E293B]"
                  >
                    {loading ? t("postCreatePage.button.submitting") : t("postCreatePage.button.submit")}
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </form>
          </div>
        </main>
      </div>
    </div>
  );
}

export default PostCreatePage;
