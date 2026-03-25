package com.prologue.ballife.web.Daily;

import java.time.LocalDate;
import java.time.LocalTime;

import jakarta.validation.constraints.NotNull;
import lombok.*;

public class DailyCalorieDto {
    //칼로리기록
    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class CreateRequest {

        @NotNull(message = "날짜를 입력해주세요")
        private LocalDate date;

        @NotNull(message = "시간를 입력해주세요")
        private LocalTime time;

    }
}
