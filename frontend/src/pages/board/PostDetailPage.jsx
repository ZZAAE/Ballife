import { useCallback, useEffect, useState } from "react";
import DOMPurify from "dompurify";
import toast from "react-hot-toast";
import { useTranslation } from "react-i18next";
import { Link, useNavigate, useParams } from "react-router-dom";
import postApi from "../../api/boardApi";
import commentApi from "../../api/commentApi";
import { useAuth } from "../../contexts/AuthContext";

/** 페이지 내 모든 버튼 공통 크기/모양 — 색상만 버튼별로 덧붙인다. */
const BTN_BASE = "rounded-lg px-4 py-2 text-sm font-semibold transition";

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
  const { t } = useTranslation();
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
            {comment.author?.[0] ||
              (isReply ? t("postDetailPage.replyInitial") : t("postDetailPage.commentInitial"))}
          </div>
          <div>
            <p className="text-[13px] font-semibold text-gray-800">
              <span className="inline-flex items-center gap-1">
                {comment.medalIcon && (
                  <img
                    src={comment.medalIcon}
                    alt=""
                    className="inline-block h-[1em] w-[1em] object-contain"
                  />
                )}
                {comment.author}
              </span>
            </p>
            <p className="mt-2 whitespace-pre-wrap text-[13px] leading-6 text-gray-600">
              {comment.content}
            </p>
            <div className="mt-3 flex items-center gap-2">
              <button
                type="button"
                onClick={() => onUpVote(comment.id)}
                className={`${BTN_BASE} border ${
                  comment.liked
                    ? "border-blue-500 bg-blue-500 text-white hover:bg-blue-600"
                    : "border-[#d9dde3] bg-white text-gray-600 hover:bg-gray-50"
                }`}
              >
                {comment.liked ? "♥" : "♡"} {t("postDetailPage.upVote")} {comment.upVote ?? 0}
              </button>
              {showReplyButton && (
                <button
                  type="button"
                  onClick={onReplyStart}
                  className={`${BTN_BASE} border border-[#d9dde3] bg-white text-gray-600 hover:bg-gray-50`}
                >
                  {t("postDetailPage.reply")}
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
              className={`${BTN_BASE} border border-[#efc7c7] bg-[#fff6f6] text-[#c24141] hover:bg-[#feecec]`}
            >
              {t("postDetailPage.delete")}
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
  const { t } = useTranslation();
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
    { value: "", label: t("postDetailPage.category.select") },
    { value: "GENERAL", label: t("postDetailPage.category.general") },
    { value: "HYPERLIPIDEMIA", label: t("postDetailPage.category.hyperlipidemia") },
    { value: "HYPERTENSION", label: t("postDetailPage.category.hypertension") },
    { value: "OSTEOPOROSIS", label: t("postDetailPage.category.osteoporosis") },
    { value: "DIABETES", label: t("postDetailPage.category.diabetes") },
    { value: "OBESITY", label: t("postDetailPage.category.obesity") },
    { value: "GOUT", label: t("postDetailPage.category.gout") },
    { value: "QNA", label: t("postDetailPage.category.qna") },
  ];

  const normalizeComment = (raw) => ({
    id: raw.id,
    author: raw.userNickname ?? t("postDetailPage.anonymous"),
    userId: raw.userId,
    medalIcon: raw.userMedalIcon ?? null,
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

  if (loading) return <div className="p-8 text-center">{t("postDetailPage.loading")}</div>;
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
      toast.error(t("postDetailPage.toast.commentRequired"));
      return;
    }
    if (!user?.userId) {
      toast.error(t("postDetailPage.toast.loginRequired"));
      return;
    }
    try {
      await commentApi.createComment(user.userId, postId, {
        content: commentDraft.trim(),
        level: 1,
      });
      setCommentDraft("");
      await fetchComments();
      toast.success(t("postDetailPage.toast.commentCreated"));
    } catch (error) {
      toast.error(
        error.response?.data?.message ||
          error.response?.data?.errors?.[0]?.defaultMessage ||
          t("postDetailPage.toast.commentCreateFailed"),
      );
    }
  };

  const handleCommentUpVote = async (commentId) => {
    if (!user?.userId) {
      toast.error(t("postDetailPage.toast.loginRequired"));
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
        data.liked
          ? t("postDetailPage.toast.commentUpVoted")
          : t("postDetailPage.toast.upVoteCanceled"),
      );
    } catch (error) {
      toast.error(
        error.response?.data?.message || t("postDetailPage.toast.commentUpVoteFailed"),
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
      toast.error(t("postDetailPage.toast.replyRequired"));
      return;
    }
    if (!user?.userId) {
      toast.error(t("postDetailPage.toast.loginRequired"));
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
      toast.success(t("postDetailPage.toast.replyCreated"));
    } catch (error) {
      toast.error(
        error.response?.data?.message ||
          error.response?.data?.errors?.[0]?.defaultMessage ||
          t("postDetailPage.toast.replyCreateFailed"),
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
      toast.error(t("postDetailPage.toast.loginRequired"));
      return;
    }
    if (!window.confirm(t("postDetailPage.confirm.deleteComment"))) return;
    try {
      await commentApi.deleteComment(user.userId, commentId);
      await fetchComments();
      toast.success(t("postDetailPage.toast.commentDeleted"));
    } catch (error) {
      toast.error(
        error.response?.data?.message || t("postDetailPage.toast.commentDeleteFailed"),
      );
    }
  };

  return (
    <div className="min-h-screen bg-[#F9FAFB] font-['Noto_Sans_KR'] text-[#0F172A]">
      <div className="flex pt-[55px]">
        <main className="flex-1">
          <div className="max-w-[1280px] mx-auto px-4 sm:px-6 py-8">
        <div className="mb-5 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-[28px] font-semibold text-gray-700">
              <Link to="/boards" className="hover:text-blue-600">
                {t("postDetailPage.community")}
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
            <p className="mt-1 text-[15px] text-gray-500">
              {t("postDetailPage.subtitle")}
            </p>
          </div>

          <div className="flex items-center gap-3">
            {user?.userId === post.userId && (
              <button
                type="button"
                onClick={() => navigate(`/posts/${post.postId ?? post.id}/edit`)}
                className={`${BTN_BASE} border border-gray-200 bg-white text-gray-700 shadow-sm hover:bg-gray-50`}
              >
                수정
              </button>
            )}
            {user?.userId === post.userId && (
              <button
                type="button"
                onClick={async () => {
                  if (!window.confirm(t("postDetailPage.confirm.deletePost"))) return;
                  try {
                    await postApi.deletePost(user.userId, post.postId ?? post.id);
                    toast.success(t("postDetailPage.toast.postDeleted"));
                    navigate("/boards");
                  } catch (error) {
                    toast.error(
                      error.response?.data?.message ||
                        t("postDetailPage.toast.postDeleteFailed"),
                    );
                  }
                }}
                className={`${BTN_BASE} border border-[#efc7c7] bg-[#fff6f6] text-[#c24141] shadow-sm hover:bg-[#feecec]`}
              >
                {t("postDetailPage.delete")}
              </button>
            )}
          </div>
        </div>

        <article className="overflow-hidden rounded-md border border-[#d9dde3] bg-white shadow-sm">
          <div className="px-7 py-6 sm:px-8 sm:py-7">
            <h1 className="text-[20px] font-bold tracking-[-0.2px] text-gray-900 sm:text-[22px]">
              {post.title}
            </h1>

            <div className="mt-4 flex items-center gap-3">
              <div className="flex h-7 w-7 items-center justify-center rounded-full bg-[#ece8f7] text-[11px] font-semibold text-gray-600">
                {post.userNickname?.[0] || t("postDetailPage.anonymousInitial")}
              </div>

              <div className="flex flex-wrap items-center gap-2 text-[12px] text-gray-400">
                <span className="inline-flex items-center gap-1 font-medium text-gray-600">
                  {post.userMedalIcon && (
                    <img
                      src={post.userMedalIcon}
                      alt=""
                      className="inline-block h-[1em] w-[1em] object-contain"
                    />
                  )}
                  {post.userNickname}
                </span>
                {post.createdAt && <span>{formatDate(post.createdAt)}</span>}
                <span>{t("postDetailPage.viewCount", { count: post.viewCount ?? 0 })}</span>
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
                  alt={t("postDetailPage.postImageAlt")}
                  className="h-[220px] w-[150px] rounded-sm border border-gray-200 object-cover shadow-sm"
                />
              </div>
            )}

            <div className="mt-8 flex items-center gap-3">
              <button
                type="button"
                onClick={async () => {
                  if (!user?.userId) {
                    toast.error(t("postDetailPage.toast.loginRequired"));
                    return;
                  }
                  try {
                    const { data } = await postApi.upVote(postId);
                    setUpVote(data.upVote);
                    setLiked(data.liked);
                    toast.success(
                      data.liked
                        ? t("postDetailPage.toast.postUpVoted")
                        : t("postDetailPage.toast.upVoteCanceled"),
                    );
                  } catch (error) {
                    toast.error(
                      error.response?.data?.message ||
                        t("postDetailPage.toast.postUpVoteFailed"),
                    );
                  }
                }}
                className={`${BTN_BASE} border ${
                  liked
                    ? "border-[#e05252] bg-[#e05252] text-white hover:bg-[#c93f3f]"
                    : "border-[#d9dde3] bg-[#f8fafc] text-gray-600 hover:bg-[#f1f5f9]"
                }`}
              >
                {liked ? "♥" : "♡"} {t("postDetailPage.upVote")} {displayedUpVote}
              </button>
            </div>
          </div>
        </article>

        <section className="mt-4 overflow-hidden rounded-md border border-[#d9dde3] bg-white shadow-sm">
          <div className="border-b border-[#eceff3] px-7 py-4 text-[15px] font-semibold text-gray-800 sm:px-8">
            {t("postDetailPage.commentCount", { count: comments.length })}
          </div>

          <div className="px-7 py-5 sm:px-8">
            <div className="rounded-md border border-[#d9dde3] bg-white">
              <div className="px-4 py-4">
                <div className="mb-3 flex items-center gap-2">
                  <div className="flex h-7 w-7 items-center justify-center rounded-full bg-[#ffe2d7] text-[11px] font-semibold text-[#9b5b43]">
                    {t("postDetailPage.writerInitial")}
                  </div>
                  <span className="text-[13px] font-semibold text-gray-700">
                    {user?.nickname || user?.username || t("postDetailPage.defaultNickname")}
                  </span>
                </div>

                <textarea
                  value={commentDraft}
                  onChange={(event) => setCommentDraft(event.target.value)}
                  placeholder={t("postDetailPage.commentPlaceholder")}
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
                  className={`${BTN_BASE} bg-gray-500 text-white hover:bg-gray-600`}
                >
                  {t("postDetailPage.submit")}
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
                            placeholder={t("postDetailPage.replyPlaceholder")}
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
                              className={`${BTN_BASE} border border-[#d9dde3] bg-white text-gray-600 hover:bg-gray-50`}
                            >
                              {t("postDetailPage.cancel")}
                            </button>
                            <button
                              type="button"
                              onClick={() => handleReplySubmit(comment.id)}
                              className={`${BTN_BASE} bg-[#0F172A] text-white hover:bg-[#1E293B]`}
                            >
                              {t("postDetailPage.submit")}
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

        <div className="mt-3 flex justify-end">
          <Link to="/boards">
            <button
              type="button"
              className={`${BTN_BASE} border border-gray-200 bg-white text-gray-700 shadow-sm hover:bg-gray-50`}
            >
              {t("postDetailPage.exit")}
            </button>
          </Link>
        </div>
          </div>
        </main>
      </div>
    </div>
  );
}
