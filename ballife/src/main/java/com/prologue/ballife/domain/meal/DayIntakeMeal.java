package com.prologue.ballife.domain.meal;


import com.prologue.ballife.domain.user.User;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name= "DAY_INTAKE_MEAL")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class DayIntakeMeal {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "Daily_Meal_id")
    private Long dailyMealId;

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
    @JoinColumn(name = "USER_ID", nullable = false)
    private User user;
}
