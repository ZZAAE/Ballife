import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { useAuth } from "../../contexts/AuthContext";
import postApi from "../../api/boardApi";
import Button from "../../components/Button";
import RichTextEditor from "../../components/board/RichTextEditor";
import { isRichTextEmpty } from "../../components/board/richTextEditorUtils";

const DRAFT_STORAGE_KEY = "board-post-create-draft";

function createEmptyFormData() {
  return {
    category: "",
    title: "",
    content: "",
  };
}

function readDraft() {
  try {
    const rawDraft = localStorage.getItem(DRAFT_STORAGE_KEY);

    if (!rawDraft) {
      return createEmptyFormData();
    }

    const parsedDraft = JSON.parse(rawDraft);

    return {
      category: parsedDraft.category ?? "",
      title: parsedDraft.title ?? "",
      content: parsedDraft.content ?? "",
    };
  } catch {
    return createEmptyFormData();
  }
}

function hasDraftContent(formData) {
  return Boolean(
    formData.category ||
    formData.title.trim() ||
    !isRichTextEmpty(formData.content),
  );
}

function PostCreatePage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState(() => readDraft());
  const hasSavedDraft = hasDraftContent(formData);

  const categories = [
    { value: "", label: "게시판 선택" },
    { value: "GENERAL", label: "자유게시판" },
    { value: "HYPERLIPIDEMIA", label: "고지혈증" },
    { value: "HYPERTENSION", label: "고혈압" },
    { value: "OSTEOPOROSIS", label: "골다공증" },
    { value: "DIABETES", label: "당뇨" },
    { value: "OBESITY", label: "비만" },
    { value: "GOUT", label: "통풍" },
    { value: "QNA", label: "질문" },
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

  const clearDraft = () => {
    localStorage.removeItem(DRAFT_STORAGE_KEY);
  };

  const handleDraftSave = () => {
    localStorage.setItem(DRAFT_STORAGE_KEY, JSON.stringify(formData));
    toast.success("임시저장되었습니다.");
  };

  useEffect(() => {
    if (!hasDraftContent(formData)) {
      localStorage.removeItem(DRAFT_STORAGE_KEY);
      return;
    }

    localStorage.setItem(DRAFT_STORAGE_KEY, JSON.stringify(formData));
  }, [formData]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.category) {
      toast.error("카테고리를 선택해주세요.");
      return;
    }

    if (!formData.title.trim()) {
      toast.error("제목을 입력해주세요.");
      return;
    }

    if (isRichTextEmpty(formData.content)) {
      toast.error("내용을 입력해주세요.");
      return;
    }

    if (!user?.userId) {
      toast.error(
        "로그인 정보에 id가 없습니다. 로그아웃 후 다시 로그인하세요.",
      );
      return;
    }

    try {
      setLoading(true);
      const res = await postApi.createPost(user.userId, formData);
      clearDraft();
      toast.success("등록되었습니다.");
      navigate(`/posts/${res.data.id}`);
    } catch (error) {
      console.error("게시글 등록 실패:", error);
      toast.error("게시글 등록 중 오류가 발생했습니다.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="px-4 py-8 sm:px-6 lg:px-8">
      <div className="mx-auto w-full max-w-5xl px-1 py-2 sm:px-2 lg:px-4">
        <div className="mb-8 border-b border-[#eef2f7] pb-5">
          <h1 className="text-[28px] font-bold tracking-[-0.03em] text-gray-900">
            자유게시판 글쓰기
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

          <div className="flex flex-col gap-4 border-t border-[#eef2f7] pt-6 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <p className="text-sm text-gray-500 lg:whitespace-nowrap">
                {hasSavedDraft
                  ? "작성 중인 내용이 브라우저에 자동 임시저장됩니다."
                  : "임시저장된 글이 없습니다."}
              </p>
            </div>
            <div className="flex flex-wrap items-center gap-3 lg:mr-6">
              <Button
                type="button"
                variant="secondary"
                onClick={() => navigate(-1)}
                className="min-w-[112px] rounded-xl bg-[#e05252] px-4 py-2.5 text-sm font-semibold text-white hover:bg-[#c93f3f]"
              >
                나가기
              </Button>
              <Button
                type="button"
                variant="secondary"
                onClick={handleDraftSave}
                className="min-w-[112px] rounded-xl border border-[#d8dee8] bg-white px-4 py-2.5 text-sm font-semibold text-gray-700 hover:bg-gray-50"
              >
                임시저장
              </Button>
              <Button
                type="submit"
                disabled={loading}
                className="min-w-[112px] rounded-xl bg-[#4f7cff] px-4 py-2.5 text-sm font-semibold text-white hover:bg-[#3d68e8]"
              >
                {loading ? "등록 중..." : "등록"}
              </Button>
            </div>
          </div>
        </form>
      </div>
    </section>
  );
}

export default PostCreatePage;
