package com.prologue.ballife.service.exercise;

import org.springframework.data.mongodb.repository.MongoRepository;

public interface ExerciseTypeService extends MongoRepository {

/*
운동종류 식별자
운동명
운동 카테고리(유산소, 무산소)
칼로리 계산
단위당 소모칼로리
*/
    
// 운동종류 식별자 -> MongoDB ObjectId (String)
// 운동명 -> String
// 운동 카테고리 -> String (예: 유산소, 무산소)
// 칼로리 계산 단위 -> String (예: 세트,횟수,강도)




}
