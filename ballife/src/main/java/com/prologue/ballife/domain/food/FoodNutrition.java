package com.prologue.ballife.domain.food;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.index.Indexed;
import org.springframework.data.mongodb.core.mapping.Document;

import lombok.*;

/**
 * MongoDB 컬렉션 food_nutrition 와 매핑되는 영양성분 캐시 도큐먼트.
 *  - 식약처 OpenAPI 응답을 정규화해 저장 (servingSize g 기준)
 *  - Vision LLM이 반환한 음식명으로 조회 → 히트하면 외부 API 호출 생략
 */
@Document(collection = "food_nutrition")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class FoodNutrition {

    @Id
    private String id;

    @Indexed(unique = true)
    private String name;            // 정규화된 음식명 (예: "비빔밥")

    @Builder.Default
    private List<String> aliases = new ArrayList<>(); // 동의어/영문명 ("bibimbap")

    private Double servingSize;     // 1회 제공량 (g)
    private Double calories;        // kcal
    private Double carbs;           // 탄수화물 (g)
    private Double protein;         // 단백질 (g)
    private Double fat;             // 지방 (g)
    private Double fiber;           // 식이섬유 (g)
    private Double sodium;          // 나트륨 (mg)
    private Double cholesterol;     // 콜레스테롤 (mg)
    private Double saturatedFat;    // 포화지방 (g)
    private Double sugar;           // 당류 (g)

    private String source;          // "식약처"
    private String sourceId;        // 식약처 식품코드(있을 시)
    private LocalDateTime updatedAt;
}
