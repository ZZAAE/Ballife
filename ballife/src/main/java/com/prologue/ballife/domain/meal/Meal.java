package com.prologue.ballife.domain.meal;

import java.time.LocalDate;

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
    private LocalDate mealDate;

    @Column(name = "MEAL_PHOTO", length = 300)
    private String mealPhoto;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "USER_ID", nullable = false)
    private User user;
    
}
