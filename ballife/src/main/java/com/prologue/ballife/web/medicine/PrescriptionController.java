package com.prologue.ballife.web.medicine;

import java.util.List;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.prologue.ballife.service.medicine.MedicineService;
import com.prologue.ballife.web.dto.medicine.PrescriptionAndMedicineDto;
import com.prologue.ballife.web.dto.medicine.PrescriptionDto;
import com.prologue.ballife.web.dto.medicine.UserMedicineDto;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;

@Tag(name = "Prescription")
@RestController
@RequestMapping("/api")
@RequiredArgsConstructor

public class PrescriptionController {
    
    private final MedicineService medicineService;

    @Operation(summary = "약 등록", description = "처방전별 약을 등록합니다.")
    @PostMapping("/register/medicine")
    public ResponseEntity<PrescriptionAndMedicineDto.PrescriptionAndMedicineResponse> postMedicine(
        @Valid @RequestBody PrescriptionAndMedicineDto.CreateRequest request) {
            PrescriptionAndMedicineDto.PrescriptionAndMedicineResponse response = medicineService.postMedicine(request);
            return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    //@Operation(summary = "처방전 조회")

    @Operation(summary = "처방전 약 목록 조회", description = "처방전별 약 목록을 조회합니다.")
    @PostMapping("/{prescriptionId}")
    public ResponseEntity<List<UserMedicineDto.UserMedicineResponse>> getUserMedicine(
        @PathVariable Long prescriptionId) {
            return ResponseEntity.ok(medicineService.getUserMedicine(prescriptionId));
    }

    
    // @Operation(summary = "처방전 수정", description = "등록된 처방전을 수정합니다.")
    // @PostMapping("/{prescriptionId}/edit")
    // public ResponseEntity<PrescriptionDto.PrescriptionResponse> putPrescription(
    //     @PathVariable
    // )h


}
