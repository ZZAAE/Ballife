package com.prologue.ballife.service.meal;

import java.util.List;
import java.util.Optional;
import java.util.concurrent.ExecutorService;
import java.util.concurrent.Executors;
import java.util.concurrent.TimeUnit;
import java.util.concurrent.atomic.AtomicInteger;

import org.springframework.boot.context.event.ApplicationReadyEvent;
import org.springframework.context.event.EventListener;
import org.springframework.stereotype.Service;

import com.prologue.ballife.domain.food.FoodNutrition;
import com.prologue.ballife.repository.foodMongo.FoodNutritionRepository;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

/**
 * 서버 부팅 완료 후 자주 먹는 한국 음식 영양정보를 식약처 API에서 미리 받아 MongoDB에 적재.
 *  - ApplicationReadyEvent: tomcat 기동 + 모든 Bean 초기화 끝난 뒤 실행 (부팅 자체에 영향 0)
 *  - ExecutorService 8병렬: 식약처 호출을 동시 다발로 처리
 *  - 이미 캐시된 음식은 건너뜀 (재시작 시 중복 호출 X)
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class FoodPreloadService {

    private final FoodNutritionService foodNutritionService;
    private final FoodNutritionRepository repository;

    private static final int CONCURRENCY = 8; // 동시 호출 수 (식약처 부담·매너 균형)

    /** 한국인이 자주 먹는 한식·중식·일식·분식·간식·과일 등 ~180종 */
    private static final List<String> POPULAR_FOODS = List.of(
            // 밥/죽
            "흰밥", "잡곡밥", "현미밥", "비빔밥", "김치볶음밥", "새우볶음밥", "오므라이스",
            "카레라이스", "주먹밥", "김밥", "참치김밥", "치즈김밥", "충무김밥",
            "흰죽", "호박죽", "전복죽", "닭죽", "야채죽", "팥죽",

            // 면류
            "라면", "짜장면", "짬뽕", "우동", "비빔국수", "잔치국수", "콩국수",
            "쫄면", "막국수", "칼국수", "쟁반국수", "냉면", "물냉면", "비빔냉면", "스파게티",

            // 국/탕/찌개
            "김치찌개", "된장찌개", "부대찌개", "순두부찌개", "청국장찌개",
            "미역국", "콩나물국", "북엇국", "시금치된장국", "오징어무국", "황태국",
            "갈비탕", "설렁탕", "삼계탕", "육개장", "곰탕", "감자탕", "추어탕",
            "떡국", "만둣국", "어묵탕", "닭곰탕",

            // 구이/볶음
            "삼겹살구이", "돼지갈비구이", "소갈비구이", "닭갈비", "불고기", "제육볶음",
            "오징어볶음", "낙지볶음", "두루치기", "닭볶음탕", "고등어구이", "갈치구이",
            "삼치구이", "조기구이", "장어구이", "곱창구이", "닭다리구이",

            // 분식/튀김
            "떡볶이", "라볶이", "순대", "튀김만두", "야채튀김", "오징어튀김", "고구마튀김",
            "돈가스", "치즈돈가스", "후라이드치킨", "양념치킨", "간장치킨", "핫도그",

            // 반찬
            "김치", "깍두기", "총각김치", "오이소박이", "콩나물무침", "시금치나물",
            "도라지무침", "고사리나물", "잡채", "멸치볶음", "감자조림", "장조림",
            "어묵볶음", "달걀말이", "달걀찜", "두부조림", "두부부침",

            // 해산물
            "광어회", "연어회", "참치회", "초밥", "연어초밥", "장어초밥",
            "새우볶음", "오징어회",

            // 빵/간식
            "식빵", "흰빵", "단팥빵", "크림빵", "도넛", "케이크", "치즈케이크",
            "호떡", "붕어빵", "약과", "인절미", "찹쌀떡", "시루떡", "꿀떡",
            "초콜릿", "과자", "감자칩", "쿠키",

            // 음료
            "우유", "두유", "요거트", "콜라", "사이다", "오렌지주스", "사과주스",
            "포도주스", "아메리카노", "카페라떼", "녹차", "보리차",

            // 과일
            "사과", "배", "바나나", "포도", "거봉", "샤인머스캣", "귤", "오렌지",
            "딸기", "수박", "참외", "복숭아", "자두", "키위", "파인애플", "망고",
            "토마토", "방울토마토", "블루베리",

            // 샐러드
            "샐러드", "야채샐러드", "시저샐러드", "그릭샐러드", "콥샐러드",
            "닭가슴살샐러드", "연어샐러드", "참치샐러드", "새우샐러드",
            "과일샐러드", "감자샐러드", "마카로니샐러드", "코울슬로",

            // 양식·기타
            "햄버거", "치즈버거", "피자", "치즈피자", "페퍼로니피자",
            "스파게티볼로네제", "까르보나라", "토마토파스타",
            "스테이크", "샌드위치", "햄샌드위치", "BLT샌드위치", "에그샌드위치",
            "오믈렛", "프렌치토스트", "팬케이크", "와플", "베이글",
            "타코", "부리또", "퀘사디아",

            // 중식·일식 추가
            "탕수육", "양장피", "마파두부", "깐풍기", "유린기",
            "라멘", "돈코츠라멘", "텐동", "규동", "야키소바"
    );

    /** 부팅 완료 후 1회 실행 — 사용자 요청 처리에 영향 X */
    @EventListener(ApplicationReadyEvent.class)
    public void onAppReady() {
        Thread t = new Thread(this::preload, "food-preload");
        t.setDaemon(true);
        t.start();
    }

    private void preload() {
        long startMs = System.currentTimeMillis();
        log.info("[FoodPreload] 시작 — 후보 {}건, 동시 {}병렬", POPULAR_FOODS.size(), CONCURRENCY);

        AtomicInteger alreadyCached = new AtomicInteger();
        AtomicInteger fetched = new AtomicInteger();
        AtomicInteger missing = new AtomicInteger();

        ExecutorService pool = Executors.newFixedThreadPool(CONCURRENCY, r -> {
            Thread th = new Thread(r);
            th.setDaemon(true);
            th.setName("food-preload-worker");
            return th;
        });

        try {
            for (String name : POPULAR_FOODS) {
                pool.submit(() -> {
                    try {
                        if (repository.findByName(name).isPresent()) {
                            alreadyCached.incrementAndGet();
                            return;
                        }
                        Optional<FoodNutrition> result = foodNutritionService.lookup(name);
                        if (result.isPresent()) fetched.incrementAndGet();
                        else missing.incrementAndGet();
                    } catch (Exception e) {
                        log.debug("[FoodPreload] '{}' 처리 중 오류: {}", name, e.getMessage());
                    }
                });
            }

            pool.shutdown();
            // 충분히 큰 타임아웃 — 가장 느린 음식까지 끝날 시간
            if (!pool.awaitTermination(3, TimeUnit.MINUTES)) {
                pool.shutdownNow();
                log.warn("[FoodPreload] 3분 타임아웃 — 강제 종료");
            }
        } catch (InterruptedException e) {
            Thread.currentThread().interrupt();
            pool.shutdownNow();
            log.warn("[FoodPreload] 중단됨");
            return;
        }

        long elapsed = (System.currentTimeMillis() - startMs) / 1000;
        log.info("[FoodPreload] 완료 — 이미캐시 {}, 신규 적재 {}, 미매칭 {} (총 {}건, {}초 소요)",
                alreadyCached.get(), fetched.get(), missing.get(), POPULAR_FOODS.size(), elapsed);
    }
}
