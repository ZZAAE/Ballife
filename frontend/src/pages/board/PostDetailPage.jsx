import { useCallback, useEffect, useState } from "react";
import DOMPurify from "dompurify";
import toast from "react-hot-toast";
import { Link, useNavigate, useParams } from "react-router-dom";
import postApi from "../../api/boardApi";
import commentApi from "../../api/commentApi";
import { useAuth } from "../../contexts/AuthContext";

function CommentBlock({
  comment,
  user,
  formatDate,
  onUpVote,
  onDelete,
  onReplyStart,
  showReplyButton = false,
  isReply = false,
}) {
  return (
    <div
      className={`rounded-md border border-[#eceff3] px-4 py-4 ${
        isReply ? "bg-white" : "bg-[#f9fafb]"
      }`}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-start gap-3">
          <div
            className={`flex h-7 w-7 items-center justify-center rounded-full text-[11px] font-semibold ${
              isReply
                ? "bg-[#dde7f5] text-[#3b5b8e]"
                : "bg-[#ffe2d7] text-[#9b5b43]"
            }`}
          >
            {comment.author?.[0] || (isReply ? "답" : "댓")}
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
                onClick={() => onUpVote(comment.id)}
                className={`rounded-md border px-3 py-1 text-[11px] font-semibold transition ${
                  comment.liked
                    ? "border-blue-500 bg-blue-500 text-white hover:bg-blue-600"
                    : "border-[#d9dde3] bg-white text-gray-600 hover:bg-gray-50"
                }`}
              >
                {comment.liked ? "♥" : "♡"} 추천 {comment.upVote ?? 0}
              </button>
              {showReplyButton && (
                <button
                  type="button"
                  onClick={onReplyStart}
                  className="rounded-md border border-[#d9dde3] bg-white px-3 py-1 text-[11px] font-semibold text-gray-600 hover:bg-gray-50"
                >
                  답글
                </button>
              )}
            </div>
          </div>
        </div>

        <div className="flex shrink-0 flex-col items-end gap-2">
          <span className="text-[11px] text-gray-400">
            {formatDate(comment.createdAt)}
          </span>
          {user?.userId === comment.userId && (
            <button
              type="button"
              onClick={() => onDelete(comment.id)}
              className="rounded-md border border-[#efc7c7] bg-[#fff6f6] px-3 py-1 text-[11px] font-semibold text-[#c24141] hover:bg-[#feecec]"
            >
              삭제
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

function normalizeContentHtml(content) {
  if (!content) {
    return "";
  }

  const hasHtmlTag = /<\/?[a-z][\s\S]*>/i.test(content);
  const normalized = hasHtmlTag ? content : content.replace(/\n/g, "<br />");

  return DOMPurify.sanitize(normalized);
}

export default function PostDetailPage() {
  const { postId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [post, setPost] = useState(null);
  const [commentDraft, setCommentDraft] = useState("");
  const [commentState, setCommentState] = useState([]);
  const [upVote, setUpVote] = useState(null);
  const [liked, setLiked] = useState(false);
  const [loading, setLoading] = useState(true);
  const [replyTo, setReplyTo] = useState(null); // 답글을 다는 부모 댓글 id
  const [replyDraft, setReplyDraft] = useState("");

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

  const normalizeComment = (raw) => ({
    id: raw.id,
    author: raw.userNickname ?? "익명",
    userId: raw.userId,
    content: raw.content,
    createdAt: raw.createdAt,
    upVote: raw.upVote ?? 0,
    liked: raw.liked ?? false,
    parentComment: raw.parentComment ?? null,
    level: raw.level ?? 1,
  });

  const fetchComments = useCallback(async () => {
    try {
      const res = await commentApi.getCommentsByPost(postId);
      setCommentState((res.data || []).map(normalizeComment));
    } catch (error) {
      console.warn("[PostDetailPage] getCommentsByPost failed:", error);
      setCommentState([]);
    }
  }, [postId]);

  useEffect(() => {
    let isMounted = true;

    (async () => {
      try {
        setLoading(true);
        const response = await postApi.getPost(postId);
        if (!isMounted) return;
        setPost(response.data);
        setUpVote(response.data.upVote ?? 0);
        setLiked(!!response.data.liked);
        // 상세 페이지 진입 시 조회수 +1 (실패해도 화면은 그대로)
        postApi.upViewCount(postId).catch((err) =>
          console.warn("[PostDetailPage] upViewCount failed:", err),
        );
        // 댓글 목록 별도 호출
        await fetchComments();
      } catch (error) {
        if (!isMounted) return;
        console.error("[PostDetailPage] getPost failed:", error);
        navigate("/boards");
      } finally {
        if (isMounted) setLoading(false);
      }
    })();

    return () => {
      isMounted = false;
    };
  }, [navigate, postId, fetchComments]);

  // 로그인 상태 변경 시 데이터 초기화/다시 로드
  useEffect(() => {
    if (!user) {
      setPost(null);
      setCommentState([]);
      setUpVote(null);
      setLiked(false);
      setReplyTo(null);
      setReplyDraft("");
      setLoading(true);
    }
  }, [user?.userId]);

  if (loading) return <div className="p-8 text-center">로딩 중...</div>;
  if (!post) return null;

  const comments = commentState;
  const displayedUpVote = upVote ?? post.upVote ?? 0;
  const contentHtml = normalizeContentHtml(post.content);
  const hasInlineImage = /<img[\s\S]*?>/i.test(post.content ?? "");

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

  const handleCommentSubmit = async () => {
    if (!commentDraft.trim()) {
      toast.error("댓글 내용을 입력해주세요.");
      return;
    }
    if (!user?.userId) {
      toast.error("로그인이 필요합니다.");
      return;
    }
    try {
      await commentApi.createComment(user.userId, postId, {
        content: commentDraft.trim(),
        level: 1,
      });
      setCommentDraft("");
      await fetchComments();
      toast.success("댓글이 등록되었습니다.");
    } catch (error) {
      toast.error(
        error.response?.data?.message ||
          error.response?.data?.errors?.[0]?.defaultMessage ||
          "댓글 등록에 실패했습니다.",
      );
    }
  };

  const handleCommentUpVote = async (commentId) => {
    if (!user?.userId) {
      toast.error("로그인이 필요합니다.");
      return;
    }
    try {
      const { data } = await commentApi.upVote(commentId);
      setCommentState((currentComments) =>
        currentComments.map((comment) =>
          comment.id === commentId
            ? { ...comment, upVote: data.upVote, liked: data.liked }
            : comment,
        ),
      );
      toast.success(
        data.liked ? "댓글을 추천했습니다." : "추천을 취소했습니다.",
      );
    } catch (error) {
      toast.error(
        error.response?.data?.message || "댓글 추천에 실패했습니다.",
      );
    }
  };

  const handleReplyStart = (parentCommentId) => {
    setReplyTo(parentCommentId);
    setReplyDraft("");
  };

  const handleReplyCancel = () => {
    setReplyTo(null);
    setReplyDraft("");
  };

  const handleReplySubmit = async (parentCommentId) => {
    if (!replyDraft.trim()) {
      toast.error("답글 내용을 입력해주세요.");
      return;
    }
    if (!user?.userId) {
      toast.error("로그인이 필요합니다.");
      return;
    }
    try {
      await commentApi.createComment(user.userId, postId, {
        content: replyDraft.trim(),
        parentComment: parentCommentId,
        level: 2,
      });
      setReplyTo(null);
      setReplyDraft("");
      await fetchComments();
      toast.success("답글이 등록되었습니다.");
    } catch (error) {
      toast.error(
        error.response?.data?.message ||
          error.response?.data?.errors?.[0]?.defaultMessage ||
          "답글 등록에 실패했습니다.",
      );
    }
  };

  // 평평한 댓글 배열 → 부모/자식 트리로 정리
  const rootComments = comments.filter((c) => !c.parentComment);
  const repliesByParent = comments.reduce((acc, c) => {
    if (c.parentComment) {
      if (!acc[c.parentComment]) acc[c.parentComment] = [];
      acc[c.parentComment].push(c);
    }
    return acc;
  }, {});

  const handleCommentDelete = async (commentId) => {
    if (!user?.userId) {
      toast.error("로그인이 필요합니다.");
      return;
    }
    if (!window.confirm("이 댓글을 삭제할까요?")) return;
    try {
      await commentApi.deleteComment(user.userId, commentId);
      await fetchComments();
      toast.success("댓글이 삭제되었습니다.");
    } catch (error) {
      toast.error(
        error.response?.data?.message || "댓글 삭제에 실패했습니다.",
      );
    }
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

            <div
              className="mt-6 break-words text-[15px] leading-8 text-gray-800 [&_img]:my-4 [&_img]:max-h-[360px] [&_img]:max-w-full [&_img]:rounded-xl [&_img]:object-contain [&_p]:mb-4 [&_p:last-child]:mb-0"
              dangerouslySetInnerHTML={{ __html: contentHtml }}
            />

            {post.imageUrl && !hasInlineImage && (
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
                onClick={async () => {
                  if (!user?.userId) {
                    toast.error("로그인이 필요합니다.");
                    return;
                  }
                  try {
                    const { data } = await postApi.upVote(postId);
                    setUpVote(data.upVote);
                    setLiked(data.liked);
                    toast.success(
                      data.liked ? "추천되었습니다." : "추천을 취소했습니다.",
                    );
                  } catch (error) {
                    toast.error(
                      error.response?.data?.message ||
                        "추천에 실패했습니다.",
                    );
                  }
                }}
                className={`rounded-md border px-5 py-2 text-sm font-semibold transition ${
                  liked
                    ? "border-blue-500 bg-blue-500 text-white hover:bg-blue-600"
                    : "border-[#d9dde3] bg-[#f8fafc] text-gray-600 hover:bg-[#f1f5f9]"
                }`}
              >
                {liked ? "♥" : "♡"} 추천 {displayedUpVote}
              </button>

              {user?.userId === post.userId && (
                <button
                  type="button"
                  onClick={async () => {
                    if (!window.confirm("이 글을 삭제할까요?")) return;
                    try {
                      await postApi.deletePost(user.userId, post.postId ?? post.id);
                      toast.success("게시글이 삭제되었습니다.");
                      navigate("/boards");
                    } catch (error) {
                      toast.error(
                        error.response?.data?.message ||
                          "게시글 삭제에 실패했습니다.",
                      );
                    }
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
              {rootComments.map((comment) => {
                const replies = repliesByParent[comment.id] || [];
                return (
                  <div key={comment.id}>
                    <CommentBlock
                      comment={comment}
                      user={user}
                      formatDate={formatDate}
                      onUpVote={handleCommentUpVote}
                      onDelete={handleCommentDelete}
                      onReplyStart={() => handleReplyStart(comment.id)}
                      showReplyButton
                    />

                    {/* 답글 입력 폼 */}
                    {replyTo === comment.id && (
                      <div className="ml-8 mt-2 rounded-md border border-[#d9dde3] bg-white">
                        <div className="px-4 py-3">
                          <textarea
                            value={replyDraft}
                            onChange={(e) => setReplyDraft(e.target.value)}
                            placeholder="답글을 입력해 주세요."
                            className="h-[64px] w-full resize-none border-0 p-0 text-[13px] leading-6 text-gray-700 outline-none placeholder:text-gray-300"
                            maxLength={200}
                          />
                        </div>
                        <div className="flex items-center justify-between border-t border-[#eceff3] px-4 py-2">
                          <span className="text-[11px] text-gray-300">
                            {replyDraft.length} / 200
                          </span>
                          <div className="flex items-center gap-2">
                            <button
                              type="button"
                              onClick={handleReplyCancel}
                              className="rounded border border-[#d9dde3] bg-white px-3 py-1 text-[11px] font-semibold text-gray-600 hover:bg-gray-50"
                            >
                              취소
                            </button>
                            <button
                              type="button"
                              onClick={() => handleReplySubmit(comment.id)}
                              className="rounded bg-gray-500 px-3 py-1 text-[11px] font-semibold text-white hover:bg-gray-600"
                            >
                              등록
                            </button>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* 자식 답글 목록 */}
                    {replies.length > 0 && (
                      <div className="ml-8 mt-2 space-y-2">
                        {replies.map((reply) => (
                          <CommentBlock
                            key={reply.id}
                            comment={reply}
                            user={user}
                            formatDate={formatDate}
                            onUpVote={handleCommentUpVote}
                            onDelete={handleCommentDelete}
                            isReply
                          />
                        ))}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
