package com.prologue.ballife.domain.pet;

import com.prologue.ballife.domain.user.User;

import jakarta.persistence.*;
import lombok.*;


@Entity
@Table(name = "PET_ASSET",
       uniqueConstraints = @UniqueConstraint(
           name = "uk_pet_asset_user_item",
           columnNames = {"USER_ID", "ITEM_ID"}))   // 한 유저가 같은 아이템 중복 보유 불가
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
