package com.prologue.ballife.repository.pet;

import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;

import com.prologue.ballife.domain.pet.Pet;
import com.prologue.ballife.domain.user.User;

public interface PetRepository extends JpaRepository<Pet, Long> {
    
    Optional<Pet> findByUser(User user);
}
