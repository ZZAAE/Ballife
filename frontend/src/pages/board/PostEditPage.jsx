import { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import toast from "react-hot-toast";
import { useAuth } from "../../contexts/AuthContext";
import postApi from "../../api/boardApi";
import Button from "../../components/Button";
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
  const { user, isAuthenticated, authLoading } = useAuth();
  const [bootLoading, setBootLoading] = useState(true);
  const [saving, setSaving] = useState(null);
  const [formData, setFormData] = useState({
    category: "GENERAL",
    title: "",
    content: "",
  });
  const categories = [
    { value: "GENERAL", label: "자유게시판" },
    { value: "DIABETES", label: "당뇨" },
    { value: "OBESITY", label: "비만" },
    { value: "OSTEOPOROSIS", label: "골다공증" },
    { value: "HYPERLIPIDEMIA", label: "고지혈증" },
    { value: "HYPERTENSION", label: "고혈압" },
    { value: "GOUT", label: "통풍" },
    { value: "QNA", label: "질문" },
  ];

  useEffect(() => {
    if (authLoading) return;
    if (!isAuthenticated || !user?.userId) {
      toast.error("로그인이 필요합니다.");
      //navigate('/login', { replace: true, state: { from: `/posts/${id}/edit` } });
      return;
    }

    (async () => {
      try {
        setBootLoading(true);
        const res = await postApi.getPost(id);
        const p = res.data;
        if (user.userId !== p.userId) {
          toast.error("본인 글만 수정할 수 있습니다.");
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
      toast.error("제목과 내용을 입력하세요.");
      return;
    }
    if (!user?.userId) {
      toast.error(
        "로그인 정보에 id가 없습니다. 로그아웃 후 다시 로그인하세요.",
      );
      return;
    }
    try {
      setSaving(true);
      await postApi.updatePost(user.userId, id, formData);
      toast.success("수정되었습니다.");
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
        <p className="text-gray-500">확인 중...</p>
      </div>
    );
  }

  if (!isAuthenticated) {
    return null;
  }

  return (
    <section className="px-4 py-8 sm:px-6 lg:px-8">
      <div className="mx-auto w-full max-w-5xl rounded-[28px] border border-[#d8dee8] bg-[#fcfdff] px-5 py-6 shadow-[0_18px_50px_rgba(15,23,42,0.08)] sm:px-8 sm:py-8 lg:px-10">
        <div className="mb-8 border-b border-[#eef2f7] pb-5">
          <h1 className="text-[28px] font-bold tracking-[-0.03em] text-gray-900">
            글 수정
          </h1>
          <p className="mt-2 text-[15px] leading-7 text-gray-500">
            건강한 삶을 위한 커뮤니티에 여러분의 이야기를 들려주세요.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-7">
          <div className="space-y-6">
            <div>
              <label
                htmlFor="category"
                className="mb-2 block text-sm font-semibold text-gray-700"
              >
                카테고리
              </label>
              <select
                id="category"
                name="category"
                value={formData.category}
                onChange={handleChange}
                className="h-12 w-full rounded-xl border border-[#d8dee8] bg-white px-4 text-[15px] text-gray-700 outline-none transition focus:border-[#8fb4ff] focus:ring-4 focus:ring-blue-100"
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
                제목
              </label>
              <input
                id="title"
                name="title"
                type="text"
                value={formData.title}
                onChange={handleChange}
                placeholder="포스트의 제목을 입력하세요"
                maxLength={120}
                className="h-12 w-full rounded-xl border border-[#d8dee8] bg-white px-4 text-[15px] text-gray-700 outline-none transition placeholder:text-gray-300 focus:border-[#8fb4ff] focus:ring-4 focus:ring-blue-100"
              />
            </div>

            <div>
              <label
                htmlFor="content"
                className="mb-2 block text-sm font-semibold text-gray-700"
              >
                내용
              </label>
              <RichTextEditor
                value={formData.content}
                onChange={handleContentChange}
                placeholder="내용을 입력하세요..."
              />
              <p className="mt-3 text-sm text-gray-400">
                툴바의 이미지 버튼으로 본문 안에 사진을 넣을 수 있습니다.
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center justify-end gap-3 border-t border-[#eef2f7] pt-6">
            <Button
              type="button"
              variant="secondary"
              onClick={() => navigate(-1)}
              className="min-w-[112px] rounded-xl border border-[#d8dee8] bg-white px-4 py-2.5 text-sm font-semibold text-gray-700 hover:bg-gray-50"
            >
              나가기
            </Button>
            <Button
              type="submit"
              disabled={saving}
              className="min-w-[112px] rounded-xl bg-[#4f7cff] px-4 py-2.5 text-sm font-semibold text-white hover:bg-[#3d68e8]"
            >
              {saving ? "수정 중..." : "수정"}
            </Button>
          </div>
        </form>
      </div>
    </section>
  );
}

export default PostEditPage;
