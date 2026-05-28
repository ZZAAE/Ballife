package com.prologue.ballife.domain.user;

import java.io.Serializable;
import java.time.LocalDateTime;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "USER_MEDAL")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class UserMedal {

    @EmbeddedId
    private UserMedalId id;

    @MapsId("userId")
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "USER_ID", nullable = false)
    private User user;

    @MapsId("medalId")
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "MEDAL_ID", nullable = false)
    private Medal medal;

    @Column(name = "MEDAL_AT", nullable = false)
    private LocalDateTime medalAt;

    @Embeddable
    @Getter
    @Setter
    @NoArgsConstructor
    @AllArgsConstructor
    @EqualsAndHashCode
    public static class UserMedalId implements Serializable {
        @Column(name = "USER_ID")
        private Long userId;

        @Column(name = "MEDAL_ID")
        private Long medalId;
    }
}
