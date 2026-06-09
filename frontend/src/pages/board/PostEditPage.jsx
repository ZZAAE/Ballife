import { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import toast from "react-hot-toast";
import { useAuth } from "../../contexts/AuthContext";
import postApi from "../../api/boardApi";
import Button from "../../components/button";
import RichTextEditor from "../../components/board/RichTextEditor";
import { isRichTextEmpty } from "../../components/board/richTextEditorUtils";

function formatEditorContent(content) {
  if (!content) {
    return "";
  }

  const hasHtmlTag = /<\/?[a-z][\s\S]*>/i.test(content);
  return hasHtmlTag ? content : content.replace(/\n/g, "<br />");
}

function PostEditPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { t } = useTranslation();
  const { user, isAuthenticated, loading: authLoading } = useAuth();
  const [bootLoading, setBootLoading] = useState(true);
  const [saving, setSaving] = useState(null);
  const [formData, setFormData] = useState({
    category: "GENERAL",
    title: "",
    content: "",
  });
  const categories = [
    { value: "GENERAL", label: t("postEditPage.category.general") },
    { value: "DIABETES", label: t("postEditPage.category.diabetes") },
    { value: "OBESITY", label: t("postEditPage.category.obesity") },
    { value: "OSTEOPOROSIS", label: t("postEditPage.category.osteoporosis") },
    { value: "HYPERLIPIDEMIA", label: t("postEditPage.category.hyperlipidemia") },
    { value: "HYPERTENSION", label: t("postEditPage.category.hypertension") },
    { value: "GOUT", label: t("postEditPage.category.gout") },
    { value: "QNA", label: t("postEditPage.category.qna") },
  ];

  useEffect(() => {
    if (authLoading) return;
    if (!isAuthenticated || !user?.userId) {
      toast.error(t("postEditPage.toast.loginRequired"));
      //navigate('/login', { replace: true, state: { from: `/posts/${id}/edit` } });
      return;
    }

    (async () => {
      try {
        setBootLoading(true);
        const res = await postApi.getPost(id);
        const p = res.data;
        if (user.userId !== p.userId) {
          toast.error(t("postEditPage.toast.onlyOwnPost"));
          navigate(`/posts/${id}`, { replace: true });
          return;
        }
        setFormData({
          category: p.category ?? "",
          title: p.title ?? "",
          content: formatEditorContent(p.content ?? ""),
        });
      } catch {
        navigate("/boards");
      } finally {
        setBootLoading(false);
      }
    })();
  }, [authLoading, isAuthenticated, user?.userId, id, navigate]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleContentChange = (content) => {
    setFormData((prev) => ({ ...prev, content }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.title.trim() || isRichTextEmpty(formData.content)) {
      toast.error(t("postEditPage.toast.titleContentRequired"));
      return;
    }
    if (!user?.userId) {
      toast.error(t("postEditPage.toast.noUserId"));
      return;
    }
    try {
      setSaving(true);
      await postApi.updatePost(user.userId, id, formData);
      toast.success(t("postEditPage.toast.updated"));
      navigate(`/posts/${id}`);
    } catch (error) {
      console.error(error);
    } finally {
      setSaving(false);
    }
  };

  if (authLoading || bootLoading) {
    return (
      <div className="flex justify-center items-center min-h-[320px]">
        <p className="text-gray-500">{t("postEditPage.checking")}</p>
      </div>
    );
  }

  if (!isAuthenticated) {
    return null;
  }

  return (
    <div className="min-h-screen bg-[#F9FAFB] font-['Noto_Sans_KR'] text-[#0F172A]">
      <div className="flex pt-[55px]">
        <main className="flex-1">
          <div className="max-w-[1280px] mx-auto px-4 sm:px-6 py-8">
        <h1 className="text-[26px] font-extrabold tracking-tight text-[#0F172A] sm:text-[30px]">
          {t("postEditPage.title")}
        </h1>
        <p className="mb-8 text-sm text-gray-500">
          {t("postEditPage.subtitle")}
        </p>

            <form onSubmit={handleSubmit} className="space-y-7">
              <div className="space-y-6">
                <div>
                  <label
                    htmlFor="category"
                    className="mb-2 block text-sm font-semibold text-gray-700"
                  >
                    {t("postEditPage.label.category")}
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
                    {t("postEditPage.label.title")}
                  </label>
                  <input
                    id="title"
                    name="title"
                    type="text"
                    value={formData.title}
                    onChange={handleChange}
                    placeholder={t("postEditPage.placeholder.title")}
                    maxLength={120}
                    className="h-12 w-full rounded-xl border border-[#d8dee8] bg-white px-4 text-[15px] text-gray-700 outline-none transition placeholder:text-gray-300 focus:border-[#8fb4ff] focus:ring-4 focus:ring-blue-100"
                  />
                </div>

                <div>
                  <label
                    htmlFor="content"
                    className="mb-2 block text-sm font-semibold text-gray-700"
                  >
                    {t("postEditPage.label.content")}
                  </label>
                  <RichTextEditor
                    value={formData.content}
                    onChange={handleContentChange}
                    placeholder={t("postEditPage.placeholder.content")}
                  />
                  <div className="mt-7 flex flex-wrap items-end justify-between gap-3">
                    <p className="mb-3 text-sm text-gray-400 lg:ml-6">
                      {t("postEditPage.imageHint")}
                    </p>
                    <div className="flex flex-wrap items-center gap-3">
                      <Button
                        type="button"
                        variant="secondary"
                        onClick={() => navigate(-1)}
                        className="rounded-[10px] border border-gray-200 !bg-white px-5 py-2.5 text-sm font-semibold !text-gray-700 shadow-sm transition hover:!bg-gray-50"
                      >
                        {t("postEditPage.button.cancel")}
                      </Button>
                      <Button
                        type="submit"
                        disabled={saving}
                        className="rounded-[10px] !bg-[#0F172A] px-6 py-2.5 text-sm font-semibold text-white transition hover:!bg-[#1E293B]"
                      >
                        {saving ? t("postEditPage.button.saving") : t("postEditPage.button.submit")}
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

export default PostEditPage;
