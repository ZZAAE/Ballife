package com.prologue.ballife.repository.board;

import java.util.Optional;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import com.prologue.ballife.domain.board.Post;


@Repository
public interface PostRepository extends JpaRepository<Post, Long>{

    Optional<Post> findById(Long postId);
    Page<Post> findByContent(Long content, Pageable pageable);

    Page<Post>  findAll(Pageable pageable);
    Page<Post> findByCategory(Post.CATEGORY Category, Pageable pageable);
    Page<Post> findByTitleContainingIgnoreCase(String keyword, Pageable pageable);
    Page<Post>  findByCategoryAndTitleContaining(Post.CATEGORY Category, String keyword, Pageable pageable);
    
}
