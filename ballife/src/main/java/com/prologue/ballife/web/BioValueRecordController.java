package com.prologue.ballife.web;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.prologue.ballife.service.daily.BioValueRecordService;
import com.prologue.ballife.web.dto.daily.BioValueRecordDto;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;

@Tag(name = "BioValueRecord", description = "생체 수치 기록 API")
@RestController
@RequestMapping("/api/bioValueRecords")
@RequiredArgsConstructor
public class BioValueRecordController {

    private final BioValueRecordService bioValueRecordService;

    @Operation(summary = "전체 조회(메인페이지용)")
    @GetMapping("/{userId}") 
    public ResponseEntity<BioValueRecordDto.BioResponse> getBioValue(
        @Parameter(description = "유저 ID") @PathVariable Long userId ){
            return ResponseEntity.ok(bioValueRecordService.getBioValue(userId));
        }
    
}
