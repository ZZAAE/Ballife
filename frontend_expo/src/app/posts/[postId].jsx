import { useCallback, useEffect, useState } from "react";
import {
  View,
  Text,
  Pressable,
  TextInput,
  Image,
  ScrollView,
  Alert,
  useWindowDimensions,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import RenderHtml from "react-native-render-html";
import { useRouter, useLocalSearchParams } from "expo-router";
import postApi from "../../api/boardApi";
import commentApi from "../../api/commentApi";
import { useAuth } from "../../context/AuthContext";
import toast from "../../lib/toast";

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
    <View
      className={`rounded-md border border-[#eceff3] px-4 py-4 ${
        isReply ? "bg-white" : "bg-[#f9fafb]"
      }`}
    >
      <View className="flex-row items-start justify-between gap-3">
        <View className="flex-1 flex-row items-start gap-3">
          <View
            className={`h-7 w-7 items-center justify-center rounded-full ${
              isReply ? "bg-[#dde7f5]" : "bg-[#ffe2d7]"
            }`}
          >
            <Text
              className={`text-[11px] font-semibold ${
                isReply ? "text-[#3b5b8e]" : "text-[#9b5b43]"
              }`}
            >
              {comment.author?.[0] || (isReply ? "답" : "댓")}
            </Text>
          </View>
          <View className="flex-1">
            <View className="flex-row items-center gap-1">
              {comment.medalIcon && (
                <Image
                  source={{ uri: comment.medalIcon }}
                  className="h-3 w-3"
                  resizeMode="contain"
                />
              )}
              <Text className="text-[13px] font-semibold text-gray-800">
                {comment.author}
              </Text>
            </View>
            <Text className="mt-2 text-[13px] leading-6 text-gray-600">
              {comment.content}
            </Text>
            <View className="mt-3 flex-row items-center gap-2">
              <Pressable
                onPress={() => onUpVote(comment.id)}
                className={`rounded-md border px-3 py-1 ${
                  comment.liked
                    ? "border-blue-500 bg-blue-500"
                    : "border-[#d9dde3] bg-white"
                }`}
              >
                <Text
                  className={`text-[11px] font-semibold ${
                    comment.liked ? "text-white" : "text-gray-600"
                  }`}
                >
                  {comment.liked ? "♥" : "♡"} 추천 {comment.upVote ?? 0}
                </Text>
              </Pressable>
              {showReplyButton && (
                <Pressable
                  onPress={onReplyStart}
                  className="rounded-md border border-[#d9dde3] bg-white px-3 py-1"
                >
                  <Text className="text-[11px] font-semibold text-gray-600">
                    답글
                  </Text>
                </Pressable>
              )}
            </View>
          </View>
        </View>

        <View className="shrink-0 items-end gap-2">
          <Text className="text-[11px] text-gray-400">
            {formatDate(comment.createdAt)}
          </Text>
          {user?.userId === comment.userId && (
            <Pressable
              onPress={() => onDelete(comment.id)}
              className="rounded-md border border-[#efc7c7] bg-[#fff6f6] px-3 py-1"
            >
              <Text className="text-[11px] font-semibold text-[#c24141]">
                삭제
              </Text>
            </Pressable>
          )}
        </View>
      </View>
    </View>
  );
}

// 주의: 웹은 DOMPurify로 sanitize 하지만 RN에는 DOM이 없어 사용할 수 없다.
// react-native-render-html 이 자체적으로 안전하게 렌더하므로 html을 그대로 통과시킨다.
function normalizeContentHtml(content) {
  if (!content) {
    return "";
  }

  const hasHtmlTag = /<\/?[a-z][\s\S]*>/i.test(content);
  const normalized = hasHtmlTag ? content : content.replace(/\n/g, "<br />");

  // DOMPurify.sanitize 제거 — RN에는 DOM 없음. RenderHtml 이 렌더 담당.
  return normalized;
}

export default function PostDetailPage() {
  const { postId } = useLocalSearchParams();
  const router = useRouter();
  const { width } = useWindowDimensions();
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
        router.replace("/boards");
      } finally {
        if (isMounted) setLoading(false);
      }
    })();

    return () => {
      isMounted = false;
    };
  }, [router, postId, fetchComments]);

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

  if (loading) {
    return (
      <SafeAreaView className="flex-1 bg-[#F9FAFB]">
        <Text className="p-8 text-center text-[#0F172A]">로딩 중...</Text>
      </SafeAreaView>
    );
  }
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
    // window.confirm 대체: RN Alert
    Alert.alert("댓글 삭제", "이 댓글을 삭제할까요?", [
      { text: "취소", style: "cancel" },
      {
        text: "삭제",
        style: "destructive",
        onPress: async () => {
          try {
            await commentApi.deleteComment(user.userId, commentId);
            await fetchComments();
            toast.success("댓글이 삭제되었습니다.");
          } catch (error) {
            toast.error(
              error.response?.data?.message || "댓글 삭제에 실패했습니다.",
            );
          }
        },
      },
    ]);
  };

  const handlePostDelete = () => {
    Alert.alert("게시글 삭제", "이 글을 삭제할까요?", [
      { text: "취소", style: "cancel" },
      {
        text: "삭제",
        style: "destructive",
        onPress: async () => {
          try {
            await postApi.deletePost(user.userId, post.postId ?? post.id);
            toast.success("게시글이 삭제되었습니다.");
            router.replace("/boards");
          } catch (error) {
            toast.error(
              error.response?.data?.message || "게시글 삭제에 실패했습니다.",
            );
          }
        },
      },
    ]);
  };

  const handlePostUpVote = async () => {
    if (!user?.userId) {
      toast.error("로그인이 필요합니다.");
      return;
    }
    try {
      const { data } = await postApi.upVote(postId);
      setUpVote(data.upVote);
      setLiked(data.liked);
      toast.success(data.liked ? "추천되었습니다." : "추천을 취소했습니다.");
    } catch (error) {
      toast.error(error.response?.data?.message || "추천에 실패했습니다.");
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-[#F9FAFB]">
      <ScrollView contentContainerClassName="px-4 py-6">
        {/* 브레드크럼 / 액션 */}
        <View className="mb-5 gap-4">
          <View>
            <View className="flex-row items-center">
              <Pressable onPress={() => router.push("/boards")}>
                <Text className="text-[20px] font-semibold text-gray-700">
                  커뮤니티
                </Text>
              </Pressable>
              <Text className="px-1 text-[20px] text-gray-400">{">"}</Text>
              <Pressable
                onPress={() =>
                  router.push({
                    pathname: "/boards",
                    params: { category: post.category },
                  })
                }
              >
                <Text className="text-[20px] font-bold text-blue-500">
                  {categories
                    .find((c) => c.value === post.category)
                    ?.label?.replace("게시판", "")}
                </Text>
              </Pressable>
            </View>
            <Text className="mt-1 text-[15px] text-gray-500">
              건강한 삶을 위한 커뮤니티 공간에 당신의 이야기를 들려주세요.
            </Text>
          </View>

          <View className="flex-row items-center gap-3">
            <Pressable
              onPress={() =>
                router.push(`/posts/${post.postId ?? post.id}/edit`)
              }
              className="rounded-[10px] border border-gray-200 bg-white px-5 py-2.5"
            >
              <Text className="text-[14px] font-semibold text-gray-700">
                수정
              </Text>
            </Pressable>
            {user?.userId === post.userId && (
              <Pressable
                onPress={handlePostDelete}
                className="rounded-[10px] border border-[#efc7c7] bg-[#fff6f6] px-5 py-2.5"
              >
                <Text className="text-[14px] font-semibold text-[#c24141]">
                  삭제
                </Text>
              </Pressable>
            )}
          </View>
        </View>

        {/* 게시글 본문 */}
        <View className="overflow-hidden rounded-md border border-[#d9dde3] bg-white">
          <View className="px-6 py-6">
            <Text className="text-[20px] font-bold text-gray-900">
              {post.title}
            </Text>

            <View className="mt-4 flex-row items-center gap-3">
              <View className="h-7 w-7 items-center justify-center rounded-full bg-[#ece8f7]">
                <Text className="text-[11px] font-semibold text-gray-600">
                  {post.userNickname?.[0] || "익"}
                </Text>
              </View>

              <View className="flex-1 flex-row flex-wrap items-center gap-2">
                <View className="flex-row items-center gap-1">
                  {post.userMedalIcon && (
                    <Image
                      source={{ uri: post.userMedalIcon }}
                      className="h-3 w-3"
                      resizeMode="contain"
                    />
                  )}
                  <Text className="text-[12px] font-medium text-gray-600">
                    {post.userNickname}
                  </Text>
                </View>
                {post.createdAt && (
                  <Text className="text-[12px] text-gray-400">
                    {formatDate(post.createdAt)}
                  </Text>
                )}
                <Text className="text-[12px] text-gray-400">
                  조회 {post.viewCount ?? 0}
                </Text>
              </View>
            </View>

            {/* Quill sanitize된 HTML 본문 렌더 (DOMPurify 미사용, RenderHtml 사용) */}
            <View className="mt-6">
              <RenderHtml
                contentWidth={width}
                source={{ html: contentHtml }}
              />
            </View>

            {post.imageUrl && !hasInlineImage && (
              <View className="mt-7">
                <Image
                  source={{ uri: post.imageUrl }}
                  className="h-[220px] w-[150px] rounded-sm border border-gray-200"
                  resizeMode="cover"
                />
              </View>
            )}

            <View className="mt-8 flex-row items-center gap-3">
              <Pressable
                onPress={handlePostUpVote}
                className={`rounded-[10px] border px-4 py-2 ${
                  liked
                    ? "border-[#e05252] bg-[#e05252]"
                    : "border-[#d9dde3] bg-[#f8fafc]"
                }`}
              >
                <Text
                  className={`text-[14px] font-semibold ${
                    liked ? "text-white" : "text-gray-600"
                  }`}
                >
                  {liked ? "♥" : "♡"} 추천 {displayedUpVote}
                </Text>
              </Pressable>
            </View>
          </View>
        </View>

        {/* 댓글 섹션 */}
        <View className="mt-4 overflow-hidden rounded-md border border-[#d9dde3] bg-white">
          <View className="border-b border-[#eceff3] px-6 py-4">
            <Text className="text-[15px] font-semibold text-gray-800">
              {comments.length}개의 댓글
            </Text>
          </View>

          <View className="px-6 py-5">
            {/* 댓글 입력 */}
            <View className="rounded-md border border-[#d9dde3] bg-white">
              <View className="px-4 py-4">
                <View className="mb-3 flex-row items-center gap-2">
                  <View className="h-7 w-7 items-center justify-center rounded-full bg-[#ffe2d7]">
                    <Text className="text-[11px] font-semibold text-[#9b5b43]">
                      글
                    </Text>
                  </View>
                  <Text className="text-[13px] font-semibold text-gray-700">
                    {user?.nickname || user?.username || "콩콩이식사"}
                  </Text>
                </View>

                <TextInput
                  value={commentDraft}
                  onChangeText={setCommentDraft}
                  placeholder="댓글을 입력해 주세요. 서로 존중하는 표현을 사용해 주세요."
                  placeholderTextColor="#d1d5db"
                  multiline
                  maxLength={200}
                  className="h-[88px] text-[13px] leading-6 text-gray-700"
                  textAlignVertical="top"
                />
              </View>

              <View className="flex-row items-center justify-between border-t border-[#eceff3] px-4 py-3">
                <Text className="text-[11px] text-gray-300">
                  {commentDraft.length} / 200
                </Text>
                <Pressable
                  onPress={handleCommentSubmit}
                  className="rounded bg-gray-500 px-3 py-1"
                >
                  <Text className="text-[11px] font-semibold text-white">
                    등록
                  </Text>
                </Pressable>
              </View>
            </View>

            {/* 댓글 목록 */}
            <View className="mt-4 gap-3">
              {rootComments.map((comment) => {
                const replies = repliesByParent[comment.id] || [];
                return (
                  <View key={comment.id}>
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
                      <View className="ml-8 mt-2 rounded-md border border-[#d9dde3] bg-white">
                        <View className="px-4 py-3">
                          <TextInput
                            value={replyDraft}
                            onChangeText={setReplyDraft}
                            placeholder="답글을 입력해 주세요."
                            placeholderTextColor="#d1d5db"
                            multiline
                            maxLength={200}
                            className="h-[64px] text-[13px] leading-6 text-gray-700"
                            textAlignVertical="top"
                          />
                        </View>
                        <View className="flex-row items-center justify-between border-t border-[#eceff3] px-4 py-2">
                          <Text className="text-[11px] text-gray-300">
                            {replyDraft.length} / 200
                          </Text>
                          <View className="flex-row items-center gap-2">
                            <Pressable
                              onPress={handleReplyCancel}
                              className="rounded border border-[#d9dde3] bg-white px-3 py-1"
                            >
                              <Text className="text-[11px] font-semibold text-gray-600">
                                취소
                              </Text>
                            </Pressable>
                            <Pressable
                              onPress={() => handleReplySubmit(comment.id)}
                              className="rounded-[10px] bg-[#0F172A] px-5 py-2.5"
                            >
                              <Text className="text-[14px] font-semibold text-white">
                                등록
                              </Text>
                            </Pressable>
                          </View>
                        </View>
                      </View>
                    )}

                    {/* 자식 답글 목록 */}
                    {replies.length > 0 && (
                      <View className="ml-8 mt-2 gap-2">
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
                      </View>
                    )}
                  </View>
                );
              })}
            </View>
          </View>
        </View>

        <View className="mt-3 flex-row justify-end">
          <Pressable
            onPress={() => router.push("/boards")}
            className="rounded-[10px] border border-gray-200 bg-white px-5 py-2.5"
          >
            <Text className="text-[14px] font-semibold text-gray-700">
              나가기
            </Text>
          </Pressable>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
