import { useEffect, useMemo, useState } from "react";
import toast from "react-hot-toast";
import { Link, useNavigate, useParams } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";
import { DUMMY_POSTS } from "./dummyPosts";

export default function PostDetailPage() {
  const { postId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [commentDraft, setCommentDraft] = useState("");
  const [commentState, setCommentState] = useState([]);
  const [upVote, setUpVote] = useState(null);
  const [loading] = useState(false);

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

  // [더미 상세 로직 시작] 백엔드 연결 전 목록과 같은 더미 데이터 사용
  const post = useMemo(
    () =>
      DUMMY_POSTS.find(
        (currentPost) => String(currentPost.id) === String(postId),
      ) ?? null,
    [postId],
  );

  useEffect(() => {
    if (!post) {
      navigate("/boards");
      return;
    }

    setCommentState(
      (post.comments ?? []).map((comment) => ({
        ...comment,
        upVote: comment.upVote ?? 0,
        reportCount: comment.reportCount ?? 0,
      })),
    );
  }, [navigate, post]);
  // [더미 상세 로직 끝]

  if (loading) return <div className="p-8 text-center">로딩 중...</div>;
  if (!post) return null;

  const comments = commentState;
  const displayedUpVote = upVote ?? post.upVote ?? 0;

  // 작성일 포맷팅
  const formatDate = (dateString) => {
    const options = {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
    };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  const handleCommentSubmit = () => {
    if (!commentDraft.trim()) {
      toast.error("댓글 내용을 입력해주세요.");
      return;
    }

    setCommentState((currentComments) => [
      ...currentComments,
      {
        id: Date.now(),
        author: user?.nickname || user?.username || "콩콩이식사",
        content: commentDraft.trim(),
        createdAt: new Date().toISOString(),
        upVote: 0,
        reportCount: 0,
      },
    ]);
    setCommentDraft("");
    toast.success("댓글이 등록되었습니다.");
  };

  const handleCommentReaction = (commentId, type) => {
    setCommentState((currentComments) =>
      currentComments.map((comment) => {
        if (comment.id !== commentId) {
          return comment;
        }

        if (type === "upvote") {
          return { ...comment, upVote: (comment.upVote ?? 0) + 1 };
        }

        return { ...comment, reportCount: (comment.reportCount ?? 0) + 1 };
      }),
    );

    toast.success(
      type === "upvote" ? "댓글을 추천했습니다." : "댓글을 신고했습니다.",
    );
  };

  return (
    <div className="min-h-screen bg-[#f1f2f4] px-4 py-10 sm:px-6 lg:px-8">
      <main className="mx-auto max-w-[1280px]">
        <div className="mb-5 flex items-start justify-between gap-4">
          <div>
            <p className="text-[15px] font-semibold text-gray-700">
              <Link to="/boards" className="hover:text-blue-600">
                커뮤니티
              </Link>
              <span className="px-1 text-gray-400">&gt;</span>
              <Link
                to="/boards"
                state={{ category: post.category }}
                className="font-bold text-blue-500"
              >
                {categories
                  .find((c) => c.value === post.category)
                  ?.label?.replace("게시판", "")}
              </Link>
            </p>
            <p className="mt-1 text-[11px] text-gray-500">
              건강한 삶을 위한 커뮤니티 공간에 당신의 이야기를 들려주세요.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              type="button"
              className="rounded-md border border-gray-200 bg-white px-6 py-2 text-sm font-semibold text-gray-700 shadow-sm hover:bg-gray-50"
            >
              수정
            </button>
            <Link to="/boards">
              <button
                type="button"
                className="rounded-md border border-gray-200 bg-white px-6 py-2 text-sm font-semibold text-gray-700 shadow-sm hover:bg-gray-50"
              >
                나가기
              </button>
            </Link>
          </div>
        </div>

        <article className="overflow-hidden rounded-md border border-[#d9dde3] bg-white shadow-sm">
          <div className="px-7 py-6 sm:px-8 sm:py-7">
            <h1 className="text-[26px] font-bold tracking-[-0.2px] text-gray-900 sm:text-[30px]">
              {post.title}
            </h1>

            <div className="mt-4 flex items-center gap-3">
              <div className="flex h-7 w-7 items-center justify-center rounded-full bg-[#ece8f7] text-[11px] font-semibold text-gray-600">
                {post.userNickname?.[0] || "익"}
              </div>

              <div className="flex flex-wrap items-center gap-2 text-[12px] text-gray-400">
                <span className="font-medium text-gray-600">
                  {post.userNickname}
                </span>
                {post.createdAt && <span>{formatDate(post.createdAt)}</span>}
                <span>조회 {post.viewCount ?? 0}</span>
              </div>
            </div>

            <div className="mt-6 whitespace-pre-wrap text-[15px] leading-8 text-gray-800">
              {post.content}
            </div>

            {post.imageUrl && (
              <div className="mt-7">
                <img
                  src={post.imageUrl}
                  alt="게시글 이미지"
                  className="h-[220px] w-[150px] rounded-sm border border-gray-200 object-cover shadow-sm"
                />
              </div>
            )}

            <div className="mt-8 flex items-center gap-3">
              <button
                type="button"
                onClick={() => {
                  setUpVote(
                    (currentValue) => (currentValue ?? post.upVote ?? 0) + 1,
                  );
                  toast.success("추천되었습니다.");
                }}
                className="rounded-md border border-[#d9dde3] bg-[#f8fafc] px-5 py-2 text-sm font-semibold text-gray-600 hover:bg-[#f1f5f9]"
              >
                추천 {displayedUpVote}
              </button>

              {user?.userId === post.userId && (
                <button
                  type="button"
                  onClick={() => {
                    if (!window.confirm("이 글을 삭제할까요?")) return;
                    toast.success("더미 게시글이므로 목록으로 이동합니다.");
                    navigate("/boards");
                  }}
                  className="rounded-md border border-[#efc7c7] bg-[#fff6f6] px-5 py-2 text-sm font-semibold text-[#c24141] hover:bg-[#feecec]"
                >
                  삭제
                </button>
              )}
            </div>
          </div>
        </article>

        <section className="mt-4 overflow-hidden rounded-md border border-[#d9dde3] bg-white shadow-sm">
          <div className="border-b border-[#eceff3] px-7 py-4 text-[15px] font-semibold text-gray-800 sm:px-8">
            {comments.length}개의 댓글
          </div>

          <div className="px-7 py-5 sm:px-8">
            <div className="rounded-md border border-[#d9dde3] bg-white">
              <div className="px-4 py-4">
                <div className="mb-3 flex items-center gap-2">
                  <div className="flex h-7 w-7 items-center justify-center rounded-full bg-[#ffe2d7] text-[11px] font-semibold text-[#9b5b43]">
                    글
                  </div>
                  <span className="text-[13px] font-semibold text-gray-700">
                    {user?.nickname || user?.username || "콩콩이식사"}
                  </span>
                </div>

                <textarea
                  value={commentDraft}
                  onChange={(event) => setCommentDraft(event.target.value)}
                  placeholder="댓글을 입력해 주세요. 서로 존중하는 표현을 사용해 주세요."
                  className="h-[88px] w-full resize-none border-0 p-0 text-[13px] leading-6 text-gray-700 outline-none placeholder:text-gray-300"
                  maxLength={200}
                />
              </div>

              <div className="flex items-center justify-between border-t border-[#eceff3] px-4 py-3">
                <span className="text-[11px] text-gray-300">
                  {commentDraft.length} / 200
                </span>
                <button
                  type="button"
                  onClick={handleCommentSubmit}
                  className="rounded bg-gray-500 px-3 py-1 text-[11px] font-semibold text-white hover:bg-gray-600"
                >
                  등록
                </button>
              </div>
            </div>

            <div className="mt-4 space-y-3">
              {comments.map((comment) => (
                <div
                  key={comment.id}
                  className="rounded-md border border-[#eceff3] bg-[#f9fafb] px-4 py-4"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-start gap-3">
                      <div className="flex h-7 w-7 items-center justify-center rounded-full bg-[#ffe2d7] text-[11px] font-semibold text-[#9b5b43]">
                        {comment.author?.[0] || "댓"}
                      </div>
                      <div>
                        <p className="text-[13px] font-semibold text-gray-800">
                          {comment.author}
                        </p>
                        <p className="mt-2 whitespace-pre-wrap text-[13px] leading-6 text-gray-600">
                          {comment.content}
                        </p>
                        <div className="mt-3 flex items-center gap-2">
                          <button
                            type="button"
                            onClick={() =>
                              handleCommentReaction(comment.id, "upvote")
                            }
                            className="rounded-md border border-[#d9dde3] bg-white px-3 py-1 text-[11px] font-semibold text-gray-600 hover:bg-gray-50"
                          >
                            추천 {comment.upVote ?? 0}
                          </button>
                        </div>
                      </div>
                    </div>

                    <div className="flex shrink-0 flex-col items-end gap-2">
                      <span className="text-[11px] text-gray-400">
                        {formatDate(comment.createdAt)}
                      </span>
                      <button
                        type="button"
                        onClick={() =>
                          handleCommentReaction(comment.id, "report")
                        }
                        className="rounded-md border border-[#efc7c7] bg-[#fff6f6] px-3 py-1 text-[11px] font-semibold text-[#c24141] hover:bg-[#feecec]"
                      >
                        신고
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
