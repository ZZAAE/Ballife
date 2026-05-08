// package com.prologue.ballife.web.dto.medicine;

// import java.time.LocalDateTime;

<<<<<<< HEAD
<<<<<<< HEAD
import com.prologue.ballife.domain.medicine.Prescription;
=======
import com.prologue.ballife.domain.medicine.Medicine;
import com.prologue.ballife.domain.medicine.Prescription;
import com.prologue.ballife.domain.medicine.Supplement;
>>>>>>> origin/jisoo0508
import com.prologue.ballife.domain.medicine.UserMedicineRecord;
=======
// import com.prologue.ballife.domain.medicine.Medicine;
// import com.prologue.ballife.domain.medicine.Prescription;
// import com.prologue.ballife.domain.medicine.Supplement;
// import com.prologue.ballife.domain.medicine.UserMedicineRecord;
>>>>>>> origin/LYJ0507

// import jakarta.validation.constraints.*;
// import lombok.*;



// public class UserMedicineRecordDto {
    
//     @Data
//     @Builder
//     @NoArgsConstructor
//     @AllArgsConstructor
//     public static class CreateRequest {
//         @NotBlank(message = "약품 카테고리를 선택해주세요")
//         private String medicineCategory;

//         @NotNull(message = "복용 시간을 입력해주세요")
//         private LocalDateTime intakeTime;

//         private String kdCode;  // 약품 카테고리가 '병원약'인 경우에만 사용
//         private Long supplementId;  // 약품 카테고리가 '영양제'인 경우에만 사용
//     }

//     @Data
//     @Builder
//     @NoArgsConstructor
//     @AllArgsConstructor
//     public static class UpdateRequest {
//         @NotBlank(message = "약품 카테고리를 선택해주세요")
//         private String medicineCategory;

//         @NotNull(message = "복용 시간을 입력해주세요")
//         private LocalDateTime intakeTime;

//         private String kdCode;  // 약품 카테고리가 '병원약'인 경우에만 사용
//         private Long supplementId;  // 약품 카테고리가 '영양제'
//     }

<<<<<<< HEAD
    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class UserMedicineRecordResponse {
        private Long userMedicineRecordId;
        private String medicineCategory;
        private LocalDateTime intakeTime;
        private Prescription prescriptionId;
<<<<<<< HEAD
        private String supplementId;
=======
        private Supplement supplementId;
>>>>>>> origin/jisoo0508

        public static UserMedicineRecordResponse from(UserMedicineRecord usermedinerecord) {
            return UserMedicineRecordResponse.builder()
                    .userMedicineRecordId(usermedinerecord.getUserMedicineRecordId())
                    .medicineCategory(usermedinerecord.getMedicineCategory())
                    .intakeTime(usermedinerecord.getIntakeTime())
<<<<<<< HEAD
                    .prescriptionId(usermedinerecord.getPrescriptionId())
=======
                    .prescriptionId(usermedinerecord.getPrescriptionId())  
                    .supplementId(usermedinerecord.getSupplementId())  
>>>>>>> origin/jisoo0508
                    .build();
        }
    }
}
=======
//     @Data
//     @Builder
//     @NoArgsConstructor
//     @AllArgsConstructor
//     public static class UserMedicineRecordResponse {
//         private Long userMedicineRecordId;
//         private String medicineCategory;
//         private LocalDateTime intakeTime;
//         private Prescription prescriptionId;
//         private Supplement supplementId;

//         public static UserMedicineRecordResponse from(UserMedicineRecord usermedinerecord) {
//             return UserMedicineRecordResponse.builder()
//                     .userMedicineRecordId(usermedinerecord.getUserMedicineRecordId())
//                     .medicineCategory(usermedinerecord.getMedicineCategory())
//                     .intakeTime(usermedinerecord.getIntakeTime())
//                     .prescriptionId(usermedinerecord.getPrescriptionId())  
//                     .supplementId(usermedinerecord.getSupplementId())  
//                     .build();
//         }
//     }
// }
>>>>>>> origin/LYJ0507
