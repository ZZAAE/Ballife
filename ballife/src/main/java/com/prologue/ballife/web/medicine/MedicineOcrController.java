package com.prologue.ballife.web.medicine;

import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

import com.prologue.ballife.service.medicine.MedicineApiService;
import com.prologue.ballife.service.medicine.MedicineLLMService;
import com.prologue.ballife.service.ocr.NaverOcrService;
import com.prologue.ballife.web.dto.medicine.MedicineItemDto;
import com.prologue.ballife.web.dto.medicine.MedicineApiResponse.MediApiItem;

import io.swagger.v3.oas.annotations.Operation;
import lombok.RequiredArgsConstructor;

import java.io.IOException;
import java.util.List;

@RestController
@RequestMapping("/api")
@RequiredArgsConstructor
public class MedicineOcrController {
    private final NaverOcrService ocrService;
    private final MedicineLLMService medicineLLMService;
    private final MedicineApiService medicineApiService;

    @Operation(summary = "OCR 스캔", description = "OCR을 스캔해서 약 목록을 추출")
    @PostMapping(value = "/ocr", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<List<MedicineItemDto.MedicineItemResponse>> getMedicineList(
        @RequestParam("image") MultipartFile image
    ) throws IOException {
        List<String> ocrStrList = ocrService.getOcrStringList(image);
        List<String> mediNameList = medicineLLMService.getMedicineNameList(ocrStrList);
        List<MedicineItemDto.MedicineItemResponse> medicineList = medicineApiService.findOrFetchList(mediNameList);
        return ResponseEntity.ok(medicineList);
    }
}
