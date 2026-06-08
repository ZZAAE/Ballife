package com.prologue.ballife.service.pet;

import java.util.List;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.prologue.ballife.domain.pet.Pet;
import com.prologue.ballife.domain.pet.PetAsset;
import com.prologue.ballife.domain.user.User;
import com.prologue.ballife.exception.ResourceNotFoundException;
import com.prologue.ballife.repository.pet.PetAssetRepository;
import com.prologue.ballife.repository.pet.PetRepository;
import com.prologue.ballife.repository.user.UserRepository;
import com.prologue.ballife.web.dto.pet.PetAssetDto;
import com.prologue.ballife.web.dto.pet.PetDto;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class PetService {
    private final PetRepository petRepository;
    private final PetAssetRepository petAssetRepository;
    private final UserRepository userRepository;

    @Transactional
    public void createPet(Long userId){
        User user = userRepository.findById(userId)
            .orElseThrow(() -> new ResourceNotFoundException("회원", userId));

        Pet pet = Pet.builder()
                     .user(user)
                     .build();

        petRepository.save(pet);
    }

    @Transactional
    public void updatePet(Long userId, PetDto.UpdateRequest request){
        User user = userRepository.findById(userId)
            .orElseThrow(() -> new ResourceNotFoundException("회원", userId));

        Pet pet = petRepository.findByUser(user)
                            .orElseThrow(() -> new ResourceNotFoundException("펫", userId));
        
        if (request.getHat() != null) 
            pet.setHat(request.getHat());
        if (request.getHouse() != null) 
            pet.setHouse(request.getHouse());
        if (request.getBackGround() != null) 
            pet.setBackground(request.getBackGround());
    }

    @Transactional
    public PetDto.PetResponse getPetData(Long userId){
        User user = userRepository.findById(userId)
            .orElseThrow(() -> new ResourceNotFoundException("회원", userId));

        Pet pet = petRepository.findByUser(user)
                            .orElseThrow(() -> new ResourceNotFoundException("펫", userId));

        return PetDto.PetResponse.from(pet);
    }

    @Transactional
    public void createPetAsset(Long userId, PetAssetDto.CreateRequest request){
        User user = userRepository.findById(userId)
            .orElseThrow(() -> new ResourceNotFoundException("회원", userId));

        PetAsset petAsset = PetAsset.builder()
                     .user(user)
                     .itemId(request.getItemId())
                     .build();

        petAssetRepository.save(petAsset);
    }

    @Transactional
    public List<PetAssetDto.PetAssetResponse> getPetAssetIds(Long userId){
        User user = userRepository.findById(userId)
            .orElseThrow(() -> new ResourceNotFoundException("회원", userId));

        List<PetAsset> assetList = petAssetRepository.findByUser(user);

        List<PetAssetDto.PetAssetResponse> idList = assetList.stream()
                                    .map(PetAssetDto.PetAssetResponse::from)
                                    .toList();

        return idList;
    }
}
