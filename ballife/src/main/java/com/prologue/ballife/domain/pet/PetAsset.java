package com.prologue.ballife.domain.pet;

import com.prologue.ballife.domain.user.User;

import jakarta.persistence.*;
import lombok.*;


@Entity
@Table(name= "PET_ASSET")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class PetAsset {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "ASSET_ID")
    private Long assetId;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "USER_ID", nullable = false)
    private User user;

    @Column(name = "ITEM_ID")
    private Long itemId;

}
