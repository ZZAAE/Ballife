package com.prologue.ballife.domain.meal;

import com.prologue.ballife.domain.User;

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
    @JoinColumn(name = "USER_ID", nullable = false)
    private User user;
}
