import { useState, useEffect } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { useAuth } from "../contexts/AuthContext";
import postApi from "../api/postApi";
import Button from "../components/Button";

export default function PostDetailPage() {
  const { postid } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [post, setPost] = useState(null);
  const [loading, setLoading] = useState(true);

  //게시글 불러오기
  useEffect(() => {
    (async () => {
      try {
        setLoading(true);
        const res = await postApi.getPost(postid);
        setPost(res.data);
        try {
          await postApi.recordView(postid); // 조회수를 DB에 1을 증가 시키는 API 요청을 보내고 완료 돨때 까지 기다림
          setPost((p) => (p ? { ...p, viewCount: (p.viewCount ?? 0) + 1 } : p)); //조회수 증가
        } catch {
          /* 조회수 API 실패 시 글은 그대로 표시 */
        }
      } catch (e) {
        console.error("게시글 요청 실패:", e);
       // navigate("post(미정)"); //실패하면 목록으로 이동
      } finally {
        setLoading(false);
      }
    })();
  }, [postid, navigate]);

  if (loading) return <div className="p-8 text-center">로딩 중...</div>;
  if (!post) return null;

  return (
    <div className="min-h-screen bg-[#ececec] px-6 py-10">
      <main className="mx-auto max-w-6xl">
        {/* 상단 안내 */}
        <div className="mb-6 flex items-start justify-between">
          <div>
            <p className="text-[15px] font-semibold text-gray-700">
              <Link to="/community" className="hover:text-blue-950">
                커뮤니티
              </Link>
              <span> &gt; </span>
              <span className="font-bold text-blue-950">{post.category}</span>
            </p>
            <p className="mt-1 text-[11px] text-gray-500">
              건강한 삶을 위한 커뮤니티 공간에 당신의 이야기를 들려주세요.
            </p>
          </div>

          <Link to={`/board/${post.boardId}/posts`}>
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
              {post.authorName?.[0] || "익"}
            </div>

            <div className="flex flex-wrap items-center gap-2 text-[12px] text-gray-500">
              <span className="font-medium text-gray-700">
                {post.authorName}
              </span>
              {post.createdAt && <span>{post.createdAt}</span>}
              <span>조회 {post.viewCount ?? 0}</span>
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

            {user?.id === post.authorId && (
              <>
                <Link to={`/posts/${post.id}/edit`}>
                  <Button>수정</Button>
                </Link>

                <Button
                  variant="danger"
                  onClick={async () => {
                    if (!window.confirm("이 글을 삭제할까요?")) return;
                    if (!user?.id) return;
                    try {
                      await postApi.deletePost(post.id, user.id);
                      toast.success("삭제되었습니다.");
                      navigate(`/boards/${post.boardId}/posts`);
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
