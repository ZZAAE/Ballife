package com.prologue.ballife.web;

import java.time.LocalDate;
import java.util.List;

import org.springframework.data.domain.Page;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.prologue.ballife.domain.daily.BioValueRecord;
import com.prologue.ballife.service.daily.BioValueRecordService;
import com.prologue.ballife.web.dto.daily.BioValueRecordDto;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.parameters.RequestBody;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;

@Tag(name = "BioValueRecord", description = "생체 수치 기록 API")
@RestController
@RequestMapping("/api/bioValueRecords")
@RequiredArgsConstructor
public class BioValueRecordController {

    private final BioValueRecordService bioValueRecordService;


    @Operation(summary = "생체 수치 등록", description = "프론트에 보내준 데이터로 생체 수치 기록")
    @PostMapping("/{userId}") 
    public ResponseEntity<BioValueRecordDto.BioResponse> createBioValueRecord(
        @Parameter(description = "유저 UUID") @PathVariable Long userId,
        @Valid @RequestBody BioValueRecordDto.CreateRequest request){
            BioValueRecordDto.BioResponse response = bioValueRecordService.createBioValueRecord(userId, request);
            return ResponseEntity.ok(response);
    }

    @Operation(summary = "생체 수치 수정", description = "프론트에 보내준 데이터로 생체 수치 수정")
    @PutMapping("/{recordId}")
    public ResponseEntity<BioValueRecordDto.BioResponse> updateBioValueRecord(
        @Parameter(description = "RecordID") @PathVariable Long recordId,
        @Valid @RequestBody BioValueRecordDto.UpdateRequest request){
            return ResponseEntity.ok(bioValueRecordService.updateBioValueRecord(recordId, request));
    }

    @Operation(summary = "특정날짜의 특정 카테고리 정보 존재 유무")
    @GetMapping("/existRecordDate/{userId}")
    public ResponseEntity<Boolean> existRecordByCategoryAndDate(
        @Parameter(description = "UserId") @PathVariable Long userId,
        @Parameter(description = "생체 정보 종류") @RequestParam String category,
        @Parameter(description = "조회 할 날짜") @RequestParam @DateTimeFormat(pattern = "yyyy-MM-dd") LocalDate recordDate){
            return ResponseEntity.ok(bioValueRecordService.existsByUserAndCategoryAndRecordDate(userId, category, recordDate));
    }
    
    @Operation(summary = "특정기간의 특정 카테고리 정보 존재 유무")
    @GetMapping("/existRecordDateBetween/{userId}")
    public ResponseEntity<List<Boolean>> existRecordByCategoryAndDateBetween(
        @Parameter(description = "UserId") @PathVariable Long userId,
        @Parameter(description = "생체 정보 종류") @RequestParam String category,
        @Parameter(description = "조회 시작 날짜") @RequestParam @DateTimeFormat(pattern = "yyyy-MM-dd") LocalDate start,
        @Parameter(description = "조회 마지막 날짜") @RequestParam @DateTimeFormat(pattern = "yyyy-MM-dd") LocalDate end){
            return ResponseEntity.ok(bioValueRecordService.existsByUserAndCategoryAndRecordDateBetween(userId, category, start, end));
    }

    @Operation(summary = "특정 유저의 특정 카테고리의 특정 날짜에 존재하는 기록정보를 모두 불러옴")
    @GetMapping("searchRecordDate/{userId}")
    public ResponseEntity<List<BioValueRecordDto.BioResponse>> searchRecordDateAndCategory(
        @Parameter(description = "UserId") @PathVariable Long userId,
        @Parameter(description = "생체 정보 종류") @RequestParam String category,
        @Parameter(description = "조회 할 날짜") @RequestParam @DateTimeFormat(pattern = "yyyy-MM-dd") LocalDate recordDate){
            return ResponseEntity.ok(bioValueRecordService.getBioRecordValueByDate(userId, category, recordDate));
    }

    @Operation(summary = "특정 유저의 특정 카테고리의 특정 기간에 존재하는 기록정보를 모두 불러옴")
    @GetMapping("searchRecordDateBetween/{userId}")
    public ResponseEntity<List<BioValueRecordDto.BioResponse>> searchRecordDateBetweenAndCategory(
        @Parameter(description = "UserId") @PathVariable Long userId,
        @Parameter(description = "생체 정보 종류") @RequestParam String category,
        @Parameter(description = "조회 시작 날짜") @RequestParam @DateTimeFormat(pattern = "yyyy-MM-dd") LocalDate start,
        @Parameter(description = "조회 마지막 날짜") @RequestParam @DateTimeFormat(pattern = "yyyy-MM-dd") LocalDate end){
            return ResponseEntity.ok(bioValueRecordService.getBioRecordValueByDateBetween(userId, category, start, end));
        }

    @Operation(summary = "전체 조회(메인페이지용)")
    @GetMapping("search/{userId}") 
    public ResponseEntity<List<BioValueRecordDto.BioResponse>> getBioValue(
        @Parameter(description = "유저 ID") @PathVariable Long userId ){
            return ResponseEntity.ok(bioValueRecordService.getUserRecordValueAll(userId));
    }

    @Operation(summary = "유저별 최신 생체 정보 수치 단건 조회")
    @GetMapping("searchBioValueTop/{userId}")
    public ResponseEntity<BioValueRecordDto.BioResponse> getBioRecordTop(
        @Parameter(description = "유저 ID") @PathVariable Long userId,
        @Parameter(description = "생체 정보 종류") @RequestParam String category){
            return ResponseEntity.ok(bioValueRecordService.getLastBioValueRecord(userId, category));
        }

    @Operation(summary = "유저별 생체정보 수치 페이지로 조회")
    @GetMapping("searchBioValuePage/{userId")
    public ResponseEntity<Page<BioValueRecordDto.BioResponse>> getBioRecordPage(
        @Parameter (description = "유저 ID") @PathVariable Long userId,
        @Parameter (description = "생체 정보 종류") @RequestParam String category,
        @RequestParam(defaultValue = "0") int page,
        @RequestParam(defaultValue = "10") int size){
            return ResponseEntity.ok(bioValueRecordService.getBioValuPageByCategory(userId, category, page, size));
        }
    @Operation(summary = "생체 수치 정보 삭제")
    @DeleteMapping("/{recordId}")
    public ResponseEntity<Void> deleteBioValueRecord
    (@Parameter(description = "생체정보ID") @PathVariable Long recordId){
        bioValueRecordService.deleteBioValueRecord(recordId);

        return ResponseEntity.noContent().build();
    }
}
