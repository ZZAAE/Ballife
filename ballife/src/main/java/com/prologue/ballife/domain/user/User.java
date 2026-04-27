package com.prologue.ballife.domain.user;

import java.time.LocalDate;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "USER") // 테이블 이름
@Getter // 여기서 부터
@Setter
@NoArgsConstructor
@AllArgsConstructor // 여기까지는 lombok에서 제공하는 기능
@Builder // 빌더 패턴
public class User {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "USER_ID")
    private Long userId;

    @Column(name = "LOGIN_ID", unique = true, nullable = false, length = 50)
    private String loginId;

    @Column(name = "PASSWORD_HASH", unique = true, nullable = false, length = 256)
    private String passwordHash;

    @Column(name = "USER_NAME", unique = true, nullable = false, length = 50)
    private String username;

     @Column(name = "NICKNAME", unique = true, nullable = false, length = 20)
    private String nickname;

    @Column(name = "BIRTH_DATE", nullable = false)
    private LocalDate birthDate;

    @Column(name = "EMAIL", unique = true, nullable = false, length = 30)
    private String email;

    @Column(name = "GENDER", unique = false, nullable = false, length = 10)
    private String gender;

    @Column(name = "WEIGHT")
    private Double weight;

    @Column(name = "HEIGHT")
    private Double height;

    @Column(name = "DISEASE_INDEX", unique = false, nullable = true, length = 300)
    private String diseaseIndex;

    @Column(name = "CREATE_DATE")
    private LocalDate createDate;

    @Enumerated(EnumType.STRING)
    @Column(name = "USER_CATEGORY", nullable = false)
    private UserCategory userCategory;

    @PrePersist
    protected void onCreate() {
        createDate = LocalDate.now();
        if (userCategory == null) userCategory = UserCategory.USER;
    }

    public enum UserCategory{
        USER,
        ADMIN
    }
}
