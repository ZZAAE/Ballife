package com.prologue.ballife.service.daily;

import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import com.prologue.ballife.domain.daily.BioValueRecord;
import com.prologue.ballife.domain.user.User;
import com.prologue.ballife.exception.ResourceNotFoundException;
import com.prologue.ballife.repository.daily.BioValueRecordRepository;
import com.prologue.ballife.repository.user.UserRepository;
import com.prologue.ballife.web.dto.daily.BioValueRecordDto;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor // 의존성 주입 DI ->멤버변수를 생성자 자동 주입
@Transactional(readOnly = true)
@SuppressWarnings("null")
public class BioValueRecordService {

    final private BioValueRecordRepository bioValueRecordRepository;
    final private UserRepository userRepository;

    // 생체 수치 기록
    @Transactional
    public BioValueRecordDto.BioResponse createBioValueRecord(Long USER_ID, BioValueRecordDto.CreateRequest request) {
        
        User user = userRepository.findById(USER_ID)
            .orElseThrow(() -> new ResourceNotFoundException("회원", USER_ID));

        // 기록 생성 (ERDCLOUDE에서는 DATETIME인데 DOMAIN에는 DATE, TIME으로 나눠져있음)
        BioValueRecord bio = BioValueRecord.builder()
                .user(user)
                .date(request.getDate())
                .time(request.getTime())
                .category(request.getCategory())
                .bloodSugar(request.getBloodSugar())
                .systolicBP(request.getSystolicBP())
                .diastolicBP(request.getDiastolicBP())
                .weight(request.getWeight())
                .waterIntakeCup(request.getWaterIntakeCup())
                .build();

        return BioValueRecordDto.BioResponse.from(bioValueRecordRepository.save(bio));
    }


    // 생체 수치 수정
    @Transactional
    public BioValueRecordDto.UpdateRequest updateBioValueRecord(Long userId, Long recordId, BioValueRecordDto.UpdateRequest request){
        
        BioValueRecord record = bioValueRecordRepository.findByUserId(userId)
            .orElseThrow(() -> new ResourceNotFoundException("생체 수치 기록", recordId));

        if (!record.getUser().getUserId().equals(userId)) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "해당 기록에 대한 권한이 없습니다.");
        }

        
        

        return BioValueRecordDto.UpdateRequest.from(bioValueRecordRepository.save(record));
    }
}
