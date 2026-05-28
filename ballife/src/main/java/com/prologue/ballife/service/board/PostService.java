package com.prologue.ballife.service.board;



import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import com.prologue.ballife.domain.board.Post;
import com.prologue.ballife.domain.board.PostLike;
import com.prologue.ballife.domain.user.User;
import com.prologue.ballife.exception.ResourceNotFoundException;
import com.prologue.ballife.repository.board.PostLikeRepository;
import com.prologue.ballife.repository.board.PostRepository;
import com.prologue.ballife.repository.user.UserRepository;
import com.prologue.ballife.web.dto.board.PostDto;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor // 의존성 주입 DI ->멤버변수를 생성자 자동 주입
@Transactional(readOnly = true)
@SuppressWarnings("null")
public class PostService {
    
    private final PostRepository postRepository;
    private final UserRepository userRepository;
    private final PostLikeRepository postLikeRepository;
    // 게시글작성,수정,삭제 | 전체게시글조회,카테고리별조회

    // 게시글 작성
    @Transactional
    public PostDto.PostResponse createPost(Long USER_ID, PostDto.CreateRequest request){
        User user = userRepository.findById(USER_ID)
            .orElseThrow(() -> new ResourceNotFoundException("회원", USER_ID));

        Post post = Post.builder()
            .userId(user)
            .title(request.getTitle())
            .content(request.getContent())
            .category(request.getCategory())
            .imageUrl(request.getImageUrl())
            .build();

            return PostDto.PostResponse.from(postRepository.save(post));
    }

    // 정렬 조건 빌더 — 1차 기준 + postId DESC tie-break
    private Sort buildSort(String sort) {
        Sort tieBreak = Sort.by(Sort.Direction.DESC, "postId");
        return switch (sort) {
            case "views" -> Sort.by(Sort.Direction.DESC, "viewCount").and(tieBreak);
            case "recommend" -> Sort.by(Sort.Direction.DESC, "upVote").and(tieBreak);
            default -> Sort.by(Sort.Direction.DESC, "createdAt").and(tieBreak);
        };
    }

    // 전체 게시글 목록 조회
    public Page<PostDto.PostListResponse> getPosts(int page, int size, String sort) {
        Pageable pageable = PageRequest.of(page, size, buildSort(sort));
        return postRepository.findByIsDeletedFalse(pageable).map(PostDto.PostListResponse::from);
    }

    // 카테고리별 게시글 목록 조회
    public Page<PostDto.PostListResponse> getPostsByCategory(int page, int size, Post.CATEGORY category, String sort) {
        Pageable pageable = PageRequest.of(page, size, buildSort(sort));
        return postRepository.findByCategoryAndIsDeletedFalse(category, pageable).map(PostDto.PostListResponse::from);
    }

    // 검색으로 게시글 목록 조회
    public Page<PostDto.PostListResponse> getPostsBySearch(int page, int size, String sort, String keyword) {
        Pageable pageable = PageRequest.of(page, size, buildSort(sort));
        return postRepository.findByTitleContainingIgnoreCaseAndIsDeletedFalse(keyword, pageable).map(PostDto.PostListResponse::from);
    }

    // 카테고리 내에서 검색으로 게시글 목록 조회
    public Page<PostDto.PostListResponse> getPostsByCategoryWithKeyword(int page, int size, Post.CATEGORY category, String sort, String keyword) {
        Pageable pageable = PageRequest.of(page, size, buildSort(sort));
        return postRepository.findByCategoryAndTitleContainingAndIsDeletedFalse(category, keyword, pageable).map(PostDto.PostListResponse::from);
    }

    // 게시글 상세 조회 (조회수는 올리지 않음 — 수정 화면·React StrictMode 이중 호출과 분리)
    // currentUserId 가 있으면 해당 사용자의 추천 여부(liked)를 함께 내려준다.
    public PostDto.PostResponse getPost(Long id, Long currentUserId) {
    Post post = postRepository.findById(id)
            .orElseThrow(() -> new ResourceNotFoundException("게시글", id));
    boolean liked = currentUserId != null
            && postLikeRepository.existsByPost_PostIdAndUser_UserId(id, currentUserId);
    return PostDto.PostResponse.from(post, liked);
}

    /** 상세 페이지 진입 시에만 호출해 조회수 +1 */
    @Transactional
    public void recordView(Long id) {
    Post post = postRepository.findById(id)
            .orElseThrow(() -> new ResourceNotFoundException("게시글", id));
    post.increaseViewCount();
}

    // 게시글 수정
    @Transactional
    public PostDto.PostResponse updatePost(Long postId, Long userId, PostDto.UpdateRequest request) {
        Post post = postRepository.findById(postId)
                .orElseThrow(() -> new ResourceNotFoundException("게시글", postId));

        if (!post.getUserId().getUserId().equals(userId)) {
            throw new ResponseStatusException(
            HttpStatus.FORBIDDEN, "본인 글만 수정할 수 있습니다.");
        }

        post.setTitle(request.getTitle());
        post.setContent(request.getContent());
        post.setCategory(request.getCategory());
        post.setImageUrl(request.getImageUrl());
        return PostDto.PostResponse.from(postRepository.save(post));
    }


    // 게시글 삭제
    @Transactional
    public void deletePost(Long postId, Long userId) {
    Post post = postRepository.findById(postId)
            .orElseThrow(() -> new ResourceNotFoundException("게시글", postId));
    if (!post.getUserId().getUserId().equals(userId)) {
        throw new org.springframework.web.server.ResponseStatusException(
                org.springframework.http.HttpStatus.FORBIDDEN, "본인 글만 삭제할 수 있습니다.");
    }
    post.softDelete();
    }

    // ═══════════════════════════════════════════════════════════
    // 게시글 추천 토글 (계정당 1개)
    //  - 아직 추천하지 않았으면: 추천 기록 추가 + upVote +1
    //  - 이미 추천했으면(같은 계정 재클릭): 추천 기록 삭제 + upVote -1
    // ═══════════════════════════════════════════════════════════
    @Transactional
    public PostDto.UpVoteResponse toggleUpvote(Long postId, Long userId) {
        Post post = postRepository.findById(postId)
                .orElseThrow(() -> new ResourceNotFoundException("게시글", postId));
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("회원", userId));

        boolean alreadyLiked = postLikeRepository.existsByPost_PostIdAndUser_UserId(postId, userId);
        boolean liked;
        if (alreadyLiked) {
            // 같은 계정이 다시 누르면 추천 취소
            postLikeRepository.deleteByPost_PostIdAndUser_UserId(postId, userId);
            post.decreaseUpVote();
            liked = false;
        } else {
            // 처음 누르면 추천 추가
            postLikeRepository.save(PostLike.builder().post(post).user(user).build());
            post.increaseUpVote();
            liked = true;
        }

        return PostDto.UpVoteResponse.builder()
                .liked(liked)
                .upVote(post.getUpVote())
                .build();
    }
}
