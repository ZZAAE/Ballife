import api from "./api";

const commentApi = {
  // 게시글의 댓글 목록 조회
  getCommentsByPost: (postId) => {
    return api.get(`/comments/post/${postId}`);
  },

  // 댓글 작성 (대댓글은 parentComment 에 부모 commentId 전달)
  createComment: (userId, postId, payload) => {
    // payload: { content, parentComment?, level?, imageUrl? }
    const body = {
      content: payload.content,
      parentComment: payload.parentComment ?? null,
      level: payload.level ?? 1,
      imageUrl: payload.imageUrl ?? null,
    };
    return api.post(`/comments`, body, { params: { userId, postId } });
  },

  // 댓글 수정 (본인 글만)
  updateComment: (userId, commentId, payload) => {
    return api.put(`/comments/${commentId}`, payload, { params: { userId } });
  },

  // 댓글 삭제 (본인 글만, soft delete)
  deleteComment: (userId, commentId) => {
    return api.delete(`/comments/${commentId}`, { params: { userId } });
  },

  // 댓글 추천
  upVote: (commentId) => {
    return api.post(`/comments/${commentId}/upvote`);
  },
};

export default commentApi;
