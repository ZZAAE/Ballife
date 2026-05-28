package com.prologue.ballife.web.medicine;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.prologue.ballife.domain.medicine.Medicine;
import com.prologue.ballife.service.medicine.MedicineApiService;

import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/medicines")
@RequiredArgsConstructor
public class MedicineController {
    private final MedicineApiService medicineApiService;

    @GetMapping
    public ResponseEntity<Medicine> getMedicine(@RequestParam String itemName){
        return ResponseEntity.ok(medicineApiService.findOrFetch(itemName));
    }
}
