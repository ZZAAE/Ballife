package com.prologue.ballife.web.medicine;

import java.time.LocalDate;
import java.time.LocalTime;
import java.util.List;

import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.prologue.ballife.domain.medicine.UserMedicineRecord.TakenCategory;
import com.prologue.ballife.security.CustomUserDetails;
import com.prologue.ballife.service.medicine.UserMedicineRecordService;
import com.prologue.ballife.web.dto.medicine.UserMedicineRecordDto;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;

/**
 * 복약 체크(복용 기록) API.
 * 복용 일정에서 체크 ON/OFF 할 때 호출 → DB(USER_MEDICINE_RECORD)에 영속화.
 * 모두 로그인 필요(JWT). userId 는 토큰의 principal 에서 가져온다.
 */
@Tag(name = "MedicineRecord", description = "복약 체크(복용 기록) API")
@RestController
@RequestMapping("/api/medicine-records")
@RequiredArgsConstructor
public class UserMedicineRecordController {

    private final UserMedicineRecordService service;

    /** POST 바디 — 복용 체크 ON */
    public record MarkRequest(
            Long prescriptionId,
            LocalDate intakeDate,
            LocalTime intakeTime,
            TakenCategory takenCategory) {}

    @Operation(summary = "복용 기록 조회", description = "로그인 유저의 특정 날짜 복용 체크 목록")
    @GetMapping
    public ResponseEntity<List<UserMedicineRecordDto.UserMedicineRecordResponse>> list(
            @AuthenticationPrincipal CustomUserDetails principal,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate date) {
        return ResponseEntity.ok(service.getByUserAndDate(principal.getUserId(), date));
    }

    @Operation(summary = "복용 체크 ON", description = "(처방전·날짜·시간대) 복용 기록 생성")
    @PostMapping
    public ResponseEntity<UserMedicineRecordDto.UserMedicineRecordResponse> mark(
            @AuthenticationPrincipal CustomUserDetails principal,
            @RequestBody MarkRequest req) {
        UserMedicineRecordDto.UserMedicineRecordResponse res = service.markTaken(
                principal.getUserId(), req.prescriptionId(), req.intakeDate(),
                req.intakeTime(), req.takenCategory());
        return ResponseEntity.status(HttpStatus.CREATED).body(res);
    }

    @Operation(summary = "복용 체크 OFF", description = "(처방전·날짜·시간대) 복용 기록 삭제")
    @DeleteMapping
    public ResponseEntity<Void> unmark(
            @AuthenticationPrincipal CustomUserDetails principal,
            @RequestParam Long prescriptionId,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate date,
            @RequestParam TakenCategory takenCategory) {
        service.unmarkTaken(principal.getUserId(), prescriptionId, date, takenCategory);
        return ResponseEntity.noContent().build();
    }
}
