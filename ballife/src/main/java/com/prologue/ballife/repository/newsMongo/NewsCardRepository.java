package com.prologue.ballife.repository.newsMongo;

import java.util.List;

import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import com.prologue.ballife.domain.news.NewsCard;

@Repository
public interface NewsCardRepository extends MongoRepository<NewsCard, String> {

    // 카테고리별 카드 (검색결과 순서대로)
    List<NewsCard> findByCategoryOrderBySeqAsc(String category);

    // 카테고리 갱신 시 기존 데이터 제거
    void deleteByCategory(String category);
}
