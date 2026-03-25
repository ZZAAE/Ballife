package com.prologue.ballife.domain.user;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "USER_DISEASE")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class UserDisease {
    @Id
    @Column(name = "DISEASE_ID")
    private Long diseaseId;

    @Column(name = "DISEASE_NAME", unique = true, nullable = false, length = 30)
    private String diseaseName;
}
