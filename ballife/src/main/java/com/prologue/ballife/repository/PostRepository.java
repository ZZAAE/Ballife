package com.prologue.ballife.repository;

import java.util.Optional;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import com.prologue.ballife.domain.board.Post;


@Repository
public interface PostRepository extends JpaRepository<Post, Long>{

    Optional<Post> findByUserId(Long userId);
    Page<Post> findByCategory(Post.CATEGORY Category, Pageable pageable);
    Page<Post> findByTitle(Long title, Pageable pageable);
    Page<Post> findByContent(Long content, Pageable pageable);
    
}
