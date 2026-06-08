package com.prologue.ballife.web;

import java.util.List;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.prologue.ballife.service.pet.PetService;
import com.prologue.ballife.web.dto.pet.PetAssetDto;
import com.prologue.ballife.web.dto.pet.PetDto;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;



@Tag(name = "PetRecord", description = "펫 정보 관리 API")
@RestController
@RequestMapping("/api/pet")
@RequiredArgsConstructor
public class PetController {
    private final PetService petService;

    @Operation(summary = "펫 등록", description = "유저 마다 하나씩 펫 생성")
    @PostMapping("/{userId}") 
    public ResponseEntity<Void> createPet(
        @Parameter(description = "유저 UUID") @PathVariable Long userId){
            petService.createPet(userId);
            return ResponseEntity.status(HttpStatus.CREATED).build();
    }

    @Operation(summary = "펫 조회", description = "펫 장착 액세서리등의 정보 조회")
    @GetMapping("/{userId}")
    public ResponseEntity<PetDto.PetResponse> getPetInfo(
        @Parameter(description = "유저 UUID") @PathVariable Long userId){
            return ResponseEntity.ok(petService.getPetData(userId));
    } 
    
    @Operation(summary = "펫 정보 수정", description = "펫 장착 액세서리 정보 수정")
    @PutMapping("/{userId}")
    public ResponseEntity<Void> updatePetInfo(
        @Parameter(description = "유저 UUID") @PathVariable Long userId,
        @RequestBody PetDto.UpdateRequest body) {
        petService.updatePet(userId, body);

        return ResponseEntity.noContent().build();
    }

    @Operation(summary = "펫 에셋 생성", description = "펫 에셋 구매시 정보 생성")
    @PostMapping("/asset/{userId}")
    public ResponseEntity<Void> createPetAsset(
        @Parameter(description = "유저 UUID") @PathVariable Long userId,
        @RequestBody PetAssetDto.CreateRequest body){
            petService.createPetAsset(userId, body);
            return ResponseEntity.status(HttpStatus.OK).build();
    }

    @Operation(summary = "펫 에셋 조회", description = "유저 보유 펫 에셋 조회")
    @GetMapping("/asset/{userId}")
    public ResponseEntity<List<PetAssetDto.PetAssetResponse>> getPetAssetIdList(
        @Parameter(description = "유저 UUID") @PathVariable Long userId) {
        return ResponseEntity.ok(petService.getPetAssetIds(userId));
    }
    
    
}
