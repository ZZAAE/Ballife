package com.prologue.ballife.domain.user;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "MEDAL") // 테이블 이름
@Getter // 여기서 부터
@Setter
@NoArgsConstructor
@AllArgsConstructor // 여기까지는 lombok에서 제공하는 기능
@Builder // 빌더 패턴
public class Medal {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "MEDAL_ID")
    private Long medalId;

    @Column(name = "MEDAL_NAME", unique = true, nullable = false, length = 50)
    private String medalName;

    @Column(name = "MEDAL_ICON", unique = true, nullable = false, length = 256)
    private String medalIcon;

    @Column(name = "MEDAL_PRICE", nullable = false)
    private Long medalPrice;

}
