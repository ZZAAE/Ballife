package com.prologue.ballife.domain.medicine;

import java.time.LocalDateTime;

import jakarta.persistence.*;
import lombok.*;


@Entity 
@Table(name = "ALARM")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor

public class Alarm {
    @Id 
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "MEDICATION_ALARM_ID", nullable = false)
    private Long medicationAlarmId;

    // 알람 카테고리 (영양제, 병원약)
    @Enumerated(EnumType.STRING)
    @Column(name = "ALARM_CATEGORY")
    private AlarmCategory alarmCategory;

    // 알람 시간
    @Column (name = "TIME", nullable = false) 
    private LocalDateTime time;

    // 알람 요일 (예: "월, 수, 금")
    @Column(name = "ALARM_DAY", length = 30, nullable = false)
    private String alarmDay;

    @ManyToOne
    @JoinColumn(name = "USER_ID")
    private User user;
    
    @ManyToOne
    @JoinColumn(name = "KD_CORD")
    private Medicine kdCode;

    @ManyToOne
    @JoinColumn(name = "SUPPLEMENT_ID")
    private Supplement supplementId;

    public enum AlarmCategory {
    MEDICINE,
    SUPPLEMENT
}
    

}
