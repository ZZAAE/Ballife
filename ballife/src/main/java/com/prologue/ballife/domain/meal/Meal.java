package com.prologue.ballife.domain.meal;

import java.time.LocalDate;
import java.time.LocalTime;

import com.prologue.ballife.domain.user.User;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name= "MEAL")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Meal {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "Meal_Id")
    private Long mealId;

    @Column(name = "MEAL_DATE", nullable = false)
    private  mealDate;

    @Column(name = "MEAL_TIME", nullable = false)
    private  mealTime;

    @Enumerated(EnumType.STRING)
    @Column(name = "MEAL_CATEGORY", nullable = false)
    private MealCategory mealCategory;

    @Column(name = "MEAL_PHOTO", length = 300)
    private String mealPhoto;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "USER_ID", nullable = false)
    private User user;

    public enum MealCategory{
        BREAKFAST("아침식사"),
        LUNCH("점심식사"),
        DINNER("저녁식사"),
        SNACK("간식");

        private final String displayName;

        MealCategory(String displayName){
            this.displayName = displayName;
        }

        public String getDisplayName(){
            return displayName;
        }


    }
    
}
