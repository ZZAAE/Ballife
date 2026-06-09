# ============================================================
# Ballife 백엔드(Spring Boot 3.5 / Java 17) 이미지
#   1) build  : Gradle 래퍼로 bootJar 생성
#   2) runtime: JRE 만 담아 실행
# 빌드 컨텍스트는 ballife/ 디렉터리 기준.
# ============================================================

# ---------- 1) 빌드 스테이지 ----------
FROM eclipse-temurin:17-jdk AS build
WORKDIR /app

# Gradle 래퍼 + 빌드 스크립트 먼저 복사 → 의존성 레이어 캐시
COPY gradlew settings.gradle build.gradle ./
COPY gradle ./gradle
RUN chmod +x gradlew && ./gradlew --no-daemon dependencies > /dev/null 2>&1 || true

# 소스 복사 후 bootJar (테스트는 CI 에서 별도 수행 → 이미지 빌드 시 생략)
COPY src ./src
RUN ./gradlew --no-daemon clean bootJar -x test

# ---------- 2) 런타임 스테이지 ----------
FROM eclipse-temurin:17-jre AS runtime
WORKDIR /app

# 업로드 저장 경로 (compose 에서 볼륨 마운트: STORAGE_BASE_PATH=/app/uploads)
RUN mkdir -p /app/uploads

# bootJar 산출물만 복사 (plain jar 는 -SNAPSHOT.jar 패턴에 안 걸림)
COPY --from=build /app/build/libs/*-SNAPSHOT.jar app.jar

# 운영 프로파일 기본 활성 (compose 에서 env 로 덮어쓸 수 있음)
ENV SPRING_PROFILES_ACTIVE=prod
ENV JAVA_OPTS=""

EXPOSE 8080
ENTRYPOINT ["sh", "-c", "java $JAVA_OPTS -jar /app/app.jar"]
