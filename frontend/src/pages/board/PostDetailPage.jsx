import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { Link, useNavigate, useParams } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";
import postApi from "../../api/boardApi";
import Button from "../../components/Button";

export default function PostDetailPage() {
  const { postId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [post, setPost] = useState(null);
  const [loading, setLoading] = useState(true);

  const categories  = [
        { value: '', label: '게시판을 선택' },
        { value: 'GENERAL', label: '자유게시판' },
        { value: 'HYPERLIPIDEMIA', label: '고지혈증' },
        { value: 'HYPERTENSION', label: '고혈압' },
        { value: 'OSTEOPOROSIS', label: '골다공증' },
        { value: 'DIABETES', label: '당뇨' },
        { value: 'OBESITY', label: '비만' },
        { value: 'GOUT', label: '통풍' },
        { value: 'QNA', label: '질문' },
    ];

  //게시글 불러오기
  useEffect(() => {
    (async () => {
      try {
        setLoading(true);
        await postApi.upViewCount(postId);
        const res = await postApi.getPost(postId);
        setPost(res.data);
      } catch (e) {
        console.error("게시글 요청 실패:", e);
        navigate("/boards"); //실패하면 목록으로 이동
      } finally {
        setLoading(false);
      }
    })();
  }, [postId, navigate]);

  if (loading) return <div className="p-8 text-center">로딩 중...</div>;
  if (!post) return null;

  // 작성일 포맷팅
    const formatDate = (dateString) => {
        const options = { year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit' };
        return new Date(dateString).toLocaleDateString(undefined, options);
    }

  return (
    <div className="min-h-screen bg-[#ececec] px-6 py-10">
      <main className="mx-auto max-w-6xl">
        {/* 상단 안내 */}
        <div className="mb-6 flex items-start justify-between">
          <div>
            <p className="text-[15px] font-semibold text-gray-700">
              <Link to="/boards" className="hover:text-blue-600">
                커뮤니티
              </Link>
              <span> &gt; </span>
              <Link to="/boards" state={{ category: post.category }} className="font-bold text-blue-500">
              {categories.find(c => c.value === post.category)?.label}
              </Link>
            </p>
            <p className="mt-1 text-[11px] text-gray-500">
              건강한 삶을 위한 커뮤니티 공간에 당신의 이야기를 들려주세요.
            </p>
          </div>

          <Link to="/boards">
            <button
              type="button"
              className="rounded-md border border-gray-300 bg-white px-6 py-2 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50"
            >
              나가기
            </button>
          </Link>
        </div>

        {/* 게시글 카드 */}
        <article className="rounded-md border border-gray-200 bg-white px-10 py-8 shadow-sm">
          <h1 className="text-[38px] font-bold tracking-tight text-gray-900">
            {post.title}
          </h1>

          <div className="mt-4 flex items-center gap-3">
            <div className="flex h-7 w-7 items-center justify-center rounded-full bg-[#e8ebf5] text-[11px] font-semibold text-gray-600">
              {post.userNickname?.[0] || "익"}
            </div>

            <div className="flex flex-wrap items-center gap-2 text-[12px] text-gray-500">
              <span className="font-medium text-gray-700">
                {post.userNickname}
              </span>
              {post.createdAt && <span>{formatDate(post.createdAt)}</span>}
              <span>조회 {post.viewCount ?? 0}</span>
              <span>추천 {post.upVote ?? 0}</span>
            </div>
          </div>

          <div className="mt-5 whitespace-pre-wrap text-[16px] leading-8 text-gray-800">
            {post.content}
          </div>

          {post.imageUrl && (
            <div className="mt-6">
              <img
                src={post.imageUrl}
                alt="게시글 이미지"
                className="w-[230px] rounded-md border border-gray-200 object-cover"
              />
            </div>
          )}

          <Button className="flex h-20 w-20 items-center justify-center rounded-full bg-[#e8ebf5] text-[11px] font-semibold text-gray-600"
            onClick={async () => {
                try {
                await postApi.upVote(post.id);
                const res = await postApi.getPost(post.id);
                setPost(res.data);
                toast.success("추천되었습니다.");
                } catch (e) {
                console.error(e);
                }
            }}>
              추천
        </Button>

          {user?.userId === post.userId && (
            <>
              <Link to={`/posts/${post.id}/edit`}>
                <Button>수정</Button>
              </Link>
              <div className="mt-4"></div>

              <Button
                variant="danger"
                onClick={async () => {
                  if (!window.confirm("이 글을 삭제할까요?")) return;
                  if (!user?.userId) return;
                  try {
                    await postApi.deletePost(user.userId, post.id);
                    toast.success("삭제되었습니다.");
                    navigate("/boards");
                  } catch (e) {
                    console.error(e);
                  }
                }}
              >
                삭제
              </Button>
            </>
          )}
        </article>
      </main>
    </div>
  );
}
