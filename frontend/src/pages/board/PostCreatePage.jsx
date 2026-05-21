import { useState } from "react";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { useAuth } from "../../contexts/AuthContext";
import postApi from "../../api/boardApi";
import Button from "../../components/Button";
import "./post.css";

const MAX_IMAGE_SIZE = 5 * 1024 * 1024;

function PostCreatePage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    category: "",
    title: "",
    content: "",
    imageUrl: "",
  });

  const categories = [
    { value: "", label: "게시판을 선택" },
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

  const handleImageChange = (event) => {
    const file = event.target.files?.[0];

    if (!file) {
      setFormData((prev) => ({ ...prev, imageUrl: "" }));
      return;
    }

    if (!file.type.startsWith("image/")) {
      toast.error("이미지 파일만 첨부할 수 있습니다.");
      event.target.value = "";
      return;
    }

    if (file.size > MAX_IMAGE_SIZE) {
      toast.error("이미지는 5MB 이하만 첨부할 수 있습니다.");
      event.target.value = "";
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      setFormData((prev) => ({
        ...prev,
        imageUrl: typeof reader.result === "string" ? reader.result : "",
      }));
    };
    reader.readAsDataURL(file);
  };

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

    if (!formData.content.trim()) {
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
    <section className="post-page">
      <div className="post-wrap">
        <div className="post-header">
          <h1 className="post-title">자유게시판 글쓰기</h1>
          <p className="post-subtitle">
            건강한 삶을 위한 커뮤니티에 여러분의 이야기를 들려주세요.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="post-form">
          <div className="post-grid">
            <div>
              <label htmlFor="category" className="post-field-label">
                카테고리
              </label>
              <select
                id="category"
                name="category"
                value={formData.category}
                onChange={handleChange}
                className="post-select"
              >
                {categories.map((category) => (
                  <option key={category.value} value={category.value}>
                    {category.label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label htmlFor="title" className="post-field-label">
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
                className="post-input"
              />
            </div>

            <div>
              <label htmlFor="content" className="post-field-label">
                내용
              </label>
              <textarea
                id="content"
                name="content"
                value={formData.content}
                onChange={handleChange}
                placeholder="내용을 입력하세요..."
                rows={14}
                className="post-textarea"
              />
            </div>

            <div>
              <label htmlFor="image" className="post-field-label">
                사진 첨부
              </label>
              <input
                id="image"
                name="image"
                type="file"
                accept="image/*"
                onChange={handleImageChange}
                className="post-input post-file-input"
              />
              {formData.imageUrl && (
                <div className="post-image-preview-wrap">
                  <img
                    src={formData.imageUrl}
                    alt="첨부 이미지 미리보기"
                    className="post-image-preview"
                  />
                  <button
                    type="button"
                    onClick={() =>
                      setFormData((prev) => ({ ...prev, imageUrl: "" }))
                    }
                    className="post-image-remove"
                  >
                    첨부 제거
                  </button>
                </div>
              )}
            </div>
          </div>

          <div className="post-actions">
            <Button
              type="button"
              variant="secondary"
              onClick={() => navigate(-1)}
              className="post-btn"
            >
              나가기
            </Button>
            <Button
              type="submit"
              disabled={loading}
              className="post-btn post-btn-submit"
            >
              {loading ? "등록 중..." : "등록"}
            </Button>
          </div>
        </form>
      </div>
    </section>
  );
}

export default PostCreatePage;
