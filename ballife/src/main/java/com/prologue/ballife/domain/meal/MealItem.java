package com.prologue.ballife.domain.meal;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name= "MEAL_ITEM")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class MealItem {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "Meal_Item_Id")
    private Long mealItemId;

    @Column(name = "Food_Name", nullable = false, length = 20)
    private String foodName;

    @Column(name = "Meal_Photo", length = 500)
    private String mealPhoto; // 음식 사진 URL (예: /uploads/meal/2026/05/29/uuid.jpg)

    @Column(name = "Grams")
    private Integer grams; // 실제 섭취량 (g) — 기준 100g 대비 사용자가 조정

    @Column(name = "Calorie")
    private Integer calorie;

    @Column(name = "Carbohydrate")
    private Double carbohydrate;

    @Column(name = "Sugar")
    private Double sugar;

    @Column(name = "Sodium")
    private Double sodium;

    @Column(name = "Cholesterol")
    private Double cholesterol;

    @Column(name = "Saturated_Fat")
    private Double saturatedFat;

    @Column(name = "Protein")
    private Double protein;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "MEAL_ID", nullable = false)
    private Meal meal;
    
}
