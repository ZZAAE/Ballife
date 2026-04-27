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
import com.prologue.ballife.domain.user.User;
import com.prologue.ballife.exception.ResourceNotFoundException;
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

    // 전체 게시글 목록 조회
    public Page<PostDto.PostListResponse> getPosts(int page, int size, String sort) {
        Pageable pageable = switch (sort) {
        case "views" -> PageRequest.of(page, size, Sort.by(Sort.Direction.DESC, "viewCount"));
        case "recommend" -> PageRequest.of(page, size, Sort.by(Sort.Direction.DESC, "upVote"));
        default -> PageRequest.of(page, size, Sort.by(Sort.Direction.DESC, "createdAt"));
    };
        return postRepository.findByIsDeletedFalse(pageable).map(PostDto.PostListResponse::from);
    }

    // 카테고리별 게시글 목록 조회
    public Page<PostDto.PostListResponse> getPostsByCategory(int page, int size, Post.CATEGORY category, String sort) {
        Pageable pageable = switch (sort) {
        case "views" -> PageRequest.of(page, size, Sort.by(Sort.Direction.DESC, "viewCount"));
        case "recommend" -> PageRequest.of(page, size, Sort.by(Sort.Direction.DESC, "upVote"));
        default -> PageRequest.of(page, size, Sort.by(Sort.Direction.DESC, "createdAt"));
    };
        return postRepository.findByCategoryAndIsDeletedFalse(category, pageable).map(PostDto.PostListResponse::from);
    }

    // 검색으로 게시글 목록 조회
    public Page<PostDto.PostListResponse> getPostsBySearch(int page, int size, String sort, String keyword) {
        Pageable pageable = switch (sort) {
        case "views" -> PageRequest.of(page, size, Sort.by(Sort.Direction.DESC, "viewCount"));
        case "recommend" -> PageRequest.of(page, size, Sort.by(Sort.Direction.DESC, "upVote"));
        default -> PageRequest.of(page, size, Sort.by(Sort.Direction.DESC, "createdAt"));
    };
        return postRepository.findByTitleContainingIgnoreCaseAndIsDeletedFalse(keyword, pageable).map(PostDto.PostListResponse::from);
    }

    // 카테고리 내에서 검색으로 게시글 목록 조회
    public Page<PostDto.PostListResponse> getPostsByCategoryWithKeyword(int page, int size, Post.CATEGORY category, String sort, String keyword) {
        Pageable pageable = switch (sort) {
        case "views" -> PageRequest.of(page, size, Sort.by(Sort.Direction.DESC, "viewCount"));
        case "recommend" -> PageRequest.of(page, size, Sort.by(Sort.Direction.DESC, "upVote"));
        default -> PageRequest.of(page, size, Sort.by(Sort.Direction.DESC, "createdAt"));
    };
        return postRepository.findByCategoryAndTitleContainingAndIsDeletedFalse(category, keyword, pageable).map(PostDto.PostListResponse::from);
    }

    // 게시글 상세 조회 (조회수는 올리지 않음 — 수정 화면·React StrictMode 이중 호출과 분리)
    public PostDto.PostResponse getPost(Long id) {
    Post post = postRepository.findById(id)
            .orElseThrow(() -> new ResourceNotFoundException("게시글", id));
    return PostDto.PostResponse.from(post);
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
    // 게시글 추천
    // ═══════════════════════════════════════════════════════════
    @Transactional
    public void upvotePost(Long postId) {
        // 게시글 조회
        Post post = postRepository.findById(postId)
                .orElseThrow(() -> new ResourceNotFoundException("게시글", postId));

        // 추천 수 증가
        post.increaseUpVote();
    }
}
