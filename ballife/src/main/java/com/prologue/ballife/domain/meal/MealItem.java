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

    @Column(name = "Calorie")
    private Integer calorie;

    @Column(name = "Carbohydrate", precision = 10, scale = 2)
    private Double carbohydrate;

    @Column(name = "Sugar", precision = 10, scale = 2)
    private Double sugar;
    
    @Column(name = "Sodium", precision = 10, scale = 2)
    private Double sodium;
    
    @Column(name = "Cholesterol", precision = 10, scale = 2)
    private Double cholesterol;
    
    @Column(name = "Saturated_Fat", precision = 10, scale = 2)
    private Double saturatedFat;
    
    @Column(name = "Protein", precision = 10, scale = 2)
    private Double protein;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "MEAL_ID", nullable = false)
    private Meal meal;
    
}
