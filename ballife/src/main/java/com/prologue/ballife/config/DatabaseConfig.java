package com.prologue.ballife.config;

import org.springframework.context.annotation.Configuration;
import org.springframework.data.jpa.repository.config.EnableJpaRepositories;
import org.springframework.data.mongodb.repository.config.EnableMongoRepositories;

// JPA 와 MongoDB 리포지토리가 같은 프로젝트에 공존할 때
// 각각 스캔할 패키지를 명시적으로 분리해야 충돌이 발생하지 않음
@Configuration
@EnableJpaRepositories(basePackages = {
        "com.prologue.ballife.repository.board",
        "com.prologue.ballife.repository.daily",
        "com.prologue.ballife.repository.user",
        "com.prologue.ballife.repository.userexercise" // UserExercise = MySQL(JPA)
})
@EnableMongoRepositories(basePackages = {
        "com.prologue.ballife.repository.exercise" // ExerciseType, UserExerciseDetail = MongoDB
})
public class DatabaseConfig {
}
