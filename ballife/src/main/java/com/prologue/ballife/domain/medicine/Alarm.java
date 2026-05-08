package com.prologue.ballife.domain.medicine;

import java.time.LocalTime;

import com.prologue.ballife.domain.user.User;

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
    @Column(name = "ALARM_CATEGORY", nullable = false)
    private AlarmCategory alarmCategory;

    // 알람 시간
    @Column (name = "TIME", nullable = false) 
    private LocalTime time;

    // 알람 요일 (예: "월, 수, 금")
    @Column(name = "ALARM_DAY", length = 30)
    private String alarmDay;

    @ManyToOne
    @JoinColumn(name = "USER_ID")
    private User user;
    
    @Column(name = "KD_CODE", length = 15)
    private String kdCode;

    @Column(name = "SUPPLEMENT_ID")
    private Long supplementId;

    public enum AlarmCategory {
    MEDICINE,
    SUPPLEMENT
}
    

}
