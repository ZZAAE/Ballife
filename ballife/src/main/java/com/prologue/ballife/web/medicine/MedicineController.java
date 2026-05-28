package com.prologue.ballife.web.medicine;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.prologue.ballife.domain.medicine.Medicine;
import com.prologue.ballife.service.medicine.MedicineApiService;

import io.swagger.v3.oas.annotations.Operation;
import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/medicines")
@RequiredArgsConstructor
public class MedicineController {
    private final MedicineApiService medicineApiService;

    @Operation(summary = "공공 API 의약품 조회", description = "공공 API에 의약품을 조회합니다.")
    @GetMapping("/search")
    public ResponseEntity<Medicine> getMedicine(@RequestParam String itemName){
        return ResponseEntity.ok(medicineApiService.findOrFetch(itemName));
    }
}
