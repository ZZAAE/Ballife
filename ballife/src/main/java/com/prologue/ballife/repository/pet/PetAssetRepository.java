package com.prologue.ballife.repository.pet;

import org.springframework.data.jpa.repository.JpaRepository;

import com.prologue.ballife.domain.pet.PetAsset;
import java.util.List;
import com.prologue.ballife.domain.user.User;


public interface PetAssetRepository extends JpaRepository<PetAsset, Long> {

    List<PetAsset> findByUser(User user);
}
