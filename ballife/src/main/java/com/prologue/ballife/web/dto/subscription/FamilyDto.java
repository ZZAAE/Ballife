package com.prologue.ballife.web.dto.subscription;

import java.time.LocalDate;
import java.util.List;

import com.prologue.ballife.domain.subscription.FamilyMember;
import com.prologue.ballife.domain.subscription.FamilyRole;

import jakarta.validation.constraints.NotBlank;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

public class FamilyDto {

    // 초대 코드로 합류
    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class JoinRequest {
        @NotBlank(message = "초대 코드를 입력해주세요")
        private String inviteCode;
    }

    // 내 공유 동의 갱신 (null 인 항목은 변경하지 않음)
    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class ConsentUpdateRequest {
        private Boolean shareBloodSugar;
        private Boolean shareBloodPressure;
        private Boolean shareMedication; // 미연동(미래)
        private Boolean shareExercise;   // 미연동(미래)
    }

    // 공유 동의 상태
    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class ConsentResponse {
        private boolean shareBloodSugar;
        private boolean shareBloodPressure;
        private boolean shareMedication;
        private boolean shareExercise;

        public static ConsentResponse from(FamilyMember m) {
            return ConsentResponse.builder()
                    .shareBloodSugar(Boolean.TRUE.equals(m.getShareBloodSugar()))
                    .shareBloodPressure(Boolean.TRUE.equals(m.getShareBloodPressure()))
                    .shareMedication(Boolean.TRUE.equals(m.getShareMedication()))
                    .shareExercise(Boolean.TRUE.equals(m.getShareExercise()))
                    .build();
        }
    }

    // 최신 혈당 (동의 없으면 null)
    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class LatestBloodSugar {
        private Integer value;        // mg/dL
        private LocalDate recordDate;
    }

    // 최신 혈압 (동의 없으면 null)
    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class LatestBloodPressure {
        private Integer systolic;     // mmHg
        private Integer diastolic;    // mmHg
        private LocalDate recordDate;
    }

    // 최신 운동 (동의 없으면 null)
    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class LatestExercise {
        private String exerciseName;   // 운동명 (예: 러닝)
        private Integer burnedCalorie; // 소모 칼로리 (kcal)
        private LocalDate recordDate;
    }

    // 가족 구성원 카드 (목록용)
    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class MemberCardResponse {
        private Long userId;
        private String nickname;
        private FamilyRole role;
        private boolean me; // 조회자 본인 여부
        private ConsentResponse consent;
        private LatestBloodSugar bloodSugar;       // 동의/데이터 없으면 null
        private LatestBloodPressure bloodPressure; // 동의/데이터 없으면 null
        private LatestExercise exercise;           // 동의/데이터 없으면 null
    }

    // 특정 구성원 건강 상세
    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class MemberHealthResponse {
        private Long userId;
        private String nickname;
        private LatestBloodSugar bloodSugar;
        private LatestBloodPressure bloodPressure;
    }

    // 내 가족 상태
    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class MyFamilyResponse {
        private boolean inGroup;
        private FamilyRole role;        // null 가능
        private Long groupId;           // null 가능
        private String groupName;
        private String inviteCode;      // 오너에게만 채움
        private String ownerNickname;
        private boolean groupActive;    // 오너 구독 해지 시 false
        private ConsentResponse myConsent;
        private List<MemberCardResponse> members; // 옵션: 그룹 구성원 목록
    }

    // 초대 코드 응답
    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class InviteCodeResponse {
        private String inviteCode;
    }
}
