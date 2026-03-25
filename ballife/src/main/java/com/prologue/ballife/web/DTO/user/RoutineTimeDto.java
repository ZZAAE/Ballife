package com.prologue.ballife.web.DTO.user;

import java.time.LocalTime;

import com.prologue.ballife.domain.user.RoutineTime;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

public class RoutineTimeDto {
    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class CreateRequest {
        private LocalTime wakeupTime;
        private LocalTime breakfastTime;
        private LocalTime lunchTime;
        private LocalTime dinnerTime;
        private LocalTime bedtimeTime;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class UpdateRequest {
        private LocalTime wakeupTime;
        private LocalTime breakfastTime;
        private LocalTime lunchTime;
        private LocalTime dinnerTime;
        private LocalTime bedtimeTime;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class RouinteResponse {
        private LocalTime wakeupTime;
        private LocalTime breakfastTime;
        private LocalTime lunchTime;
        private LocalTime dinnerTime;
        private LocalTime bedtimeTime;

        public static RouinteResponse from(RoutineTime routine) {
            return RouinteResponse.builder()
                    .wakeupTime(routine.getWakeupTime())
                    .breakfastTime(routine.getBreakfastTime())
                    .lunchTime(routine.getLunchTime())
                    .dinnerTime(routine.getDinnerTime())
                    .bedtimeTime(routine.getBedtimeTime())
                    .build();
        }

    }

}
