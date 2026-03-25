package com.prologue.ballife.domain.user;

import java.time.LocalDate;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "USER_RDA")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class UserRda {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "RDA_ID")
    private Long rda_id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "USER_ID", nullable = false)
    private User user;

    @Column(name = "DATE")
    private LocalDate date;

    @Column(name = "RECOMMENDED_CALORIE")
    private Integer recommendedCalorie;

    @Column(name = "RECOMMENDED_CARBOHYDRATE")
    private Double recommendedCarbohydrate;

    @Column(name = "RECOMMENDED_PROTEIN")
    private Double recommendedProtein;

    @Column(name = "RECOMMENDED_FAT")
    private Double recommendedFat;

    @Column(name = "RECOMMENDED_SUGAR")
    private Double recommendedSugar;

    @Column(name = "RECOMMENDED_SODIUM")
    private Double recommendedSodium;

}
