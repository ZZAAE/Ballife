package com.prologue.ballife.domain.pet;

import com.prologue.ballife.domain.user.User;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name= "PET")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Pet {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "PET_ID")
    private Long petId;

    @OneToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "USER_ID", nullable = false, unique = true)
    private User user;

    @Column(name = "HAT")
    private Long hat;

    @Column(name = "HOUSE")
    private Long house;

    @Column(name = "BACKGROUND")
    private Long background;
}
