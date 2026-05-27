package com.prologue.ballife.repository.newsMongo;

import java.util.List;

import org.springframework.data.domain.Pageable;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import com.prologue.ballife.domain.news.NewsCard;

@Repository
public interface NewsCardRepository extends MongoRepository<NewsCard, String> {

    // 발행일시 내림차순으로 상위 N건 (메인 카드뉴스용)
    List<NewsCard> findAllByOrderByPubDateDesc(Pageable pageable);
}
