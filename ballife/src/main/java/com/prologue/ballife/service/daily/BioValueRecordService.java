package com.prologue.ballife.service.daily;

<<<<<<< HEAD
import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
=======
>>>>>>> origin/jisoo0508
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
<<<<<<< HEAD
                .recordDate(request.getRecordDate())
                .recordTime(request.getRecordTime())
=======
                .date(request.getDate())
                .time(request.getTime())
>>>>>>> origin/jisoo0508
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
<<<<<<< HEAD
    public BioValueRecordDto.BioResponse updateBioValueRecord(Long recordId, BioValueRecordDto.UpdateRequest request){
        
        BioValueRecord record = bioValueRecordRepository.findByRecordId(recordId)
            .orElseThrow(() -> new ResourceNotFoundException("생체 수치 기록", recordId));

        // 수정할 값 빼곤 null이라 그냥 다 업데이트함
        record.setRecordTime(request.getRecordTime());
        record.setCategory(request.getCategory());
        record.setBloodSugar(request.getBloodSugar());
        record.setSystolicBP(request.getSystolicBP());
        record.setDiastolicBP(request.getDiastolicBP());
        record.setWeight(request.getWeight());
        record.setWaterIntakeCup(request.getWaterIntakeCup());

        return BioValueRecordDto.BioResponse.from(bioValueRecordRepository.save(record));
    }

    //특정 날짜의 특정 유저의 특정 카테고리에 대한 정보 있는지 유무
    public Boolean existsByUserAndCategoryAndRecordDate(Long userId, String category, LocalDate date){
        User user = userRepository.findById(userId)
        .orElseThrow(()->new ResourceNotFoundException("유저가 존재하지 않음", userId));

        return bioValueRecordRepository.existsByUserAndCategoryAndRecordDate(user, category, date);
    }

    //특정 기간의 특정 유저의 특정 카테고리에 대한 정보 있는지 유무
    public List<Boolean> existsByUserAndCategoryAndRecordDateBetween(Long userId, String category, LocalDate start, LocalDate end){
        User user = userRepository.findById(userId)
        .orElseThrow(()->new ResourceNotFoundException("유저가 존재하지 않음", userId));
        
        List<Boolean> existList = new ArrayList<Boolean>();

        end = end.plusDays(1);
        while(!start.isEqual(end)){
            existList.add(bioValueRecordRepository.existsByUserAndCategoryAndRecordDate(user, category, start));
            start = start.plusDays(1);
        }

        return existList;
    }

    //특정 유저의 특정 카테고리의 특정 날짜에 존재하는 기록정보를 모두 불러옴
    public List<BioValueRecordDto.BioResponse> getBioRecordValueByDate(Long userId, String category, LocalDate date){
        User user = userRepository.findById(userId)
        .orElseThrow(() -> new ResourceNotFoundException("유저가 존재하지 않음", userId));

        List<BioValueRecord> recordList = bioValueRecordRepository.findByUserAndCategoryAndRecordDate(user, category, date);
        
        return recordList.stream()
                         .map(BioValueRecordDto.BioResponse::from)
                         .collect(Collectors.toList());
    }

    //특정 유저의 특정 카테고리의 특정 기간에 존재하는 기록정보를 모두 불러옴
    public List<BioValueRecordDto.BioResponse> getBioRecordValueByDateBetween(Long userId, String category, LocalDate start, LocalDate end){
        User user = userRepository.findByUserId(userId)
        .orElseThrow(()->new ResourceNotFoundException("유저가 존재하지 않음", userId));

        List<BioValueRecord> recordList = bioValueRecordRepository.findByUserAndCategoryAndRecordDateBetween(user, category, start, end);

        return recordList.stream()
                         .map(BioValueRecordDto.BioResponse::from)
                         .collect(Collectors.toList());
    }

    //특정 유저의 정보를 모두 불러옴
    public List<BioValueRecordDto.BioResponse> getUserRecordValueAll(Long userId){
        User user  = userRepository.findByUserId(userId)
        .orElseThrow(() -> new ResourceNotFoundException("유저가 존재하지 않음", userId));

        List<BioValueRecord> recordList = bioValueRecordRepository.findAllByUser(user);

        return recordList.stream()
                         .map(BioValueRecordDto.BioResponse::from)
                         .collect(Collectors.toList());
    }
    
    //유저별 최신 생체 수치 카테고리 별 단건 조회
    public BioValueRecordDto.BioResponse getLastBioValueRecord(Long userId, String category){
        User user = userRepository.findById(userId)
        .orElseThrow(() -> new ResourceNotFoundException("유저가 존재하지 않음", userId));

        BioValueRecord record;

        switch (category) {
            case "BloodSugar":
                record = bioValueRecordRepository.findLastBloodSugarRecordByUser(user)
                                .orElseThrow(() -> new ResourceNotFoundException("생체 수치 기록", user));
                record.setRecordDate(record.getRecordDate());
                record.setRecordTime(record.getRecordTime());                        
                record.setBloodSugar(record.getBloodSugar());
                break;
            case "BloodPressure":
                record = bioValueRecordRepository.findLastSystolicBPRecordByUser(user)
                            .orElseThrow(() -> new ResourceNotFoundException("생체 수치 기록", user));       
                record.setRecordDate(record.getRecordDate());
                record.setRecordTime(record.getRecordTime());                        
                record.setSystolicBP(record.getSystolicBP());
                record.setDiastolicBP(record.getDiastolicBP());
            case "Weight":
                record = bioValueRecordRepository.findLastSystolicBPRecordByUser(user)
                            .orElseThrow(() -> new ResourceNotFoundException("생체 수치 기록", user));
        
                record.setRecordDate(record.getRecordDate());
                record.setRecordTime(record.getRecordTime());                        
                record.setWeight(record.getWeight());
            case "WaterIntake":
                record = bioValueRecordRepository.findLastWaterIntakeCupRecordByUser(user)
                            .orElseThrow(() -> new ResourceNotFoundException("생체 수치 기록", user));
                record.setRecordDate(record.getRecordDate());
                record.setRecordTime(record.getRecordTime());                        
                record.setWaterIntakeCup(record.getWaterIntakeCup());
            default:
                record = null;
                break;
        }

        return BioValueRecordDto.BioResponse.from(record);
    }

    //유저별 생체 수치 카테고리 별 페이지
    public Page<BioValueRecordDto.BioResponse> getBioValuPageByCategory(Long userId, String category, int page, int size){
        User user = userRepository.findById(userId)
        .orElseThrow(() -> new ResourceNotFoundException("유저가 존재하지 않음", userId));

        Pageable pageable = PageRequest.of(page, size, Sort.by("recordDate", "recordTime").descending());
        Page<BioValueRecord> bioRecords = bioValueRecordRepository.findByUserAndCategory(user, category,pageable);
        return bioRecords.map(BioValueRecordDto.BioResponse::from);
    }

    //생체 수치 정보 삭제
    public void deleteBioValueRecord(Long recordId){
        BioValueRecord record = bioValueRecordRepository.findById(recordId)
                       .orElseThrow(() -> new ResourceNotFoundException("생체 수치 정보", recordId));
        bioValueRecordRepository.delete(record);
=======
    public BioValueRecordDto.UpdateRequest updateBioValueRecord(Long userId, Long recordId, BioValueRecordDto.UpdateRequest request){
        
        BioValueRecord record = bioValueRecordRepository.findByUserId(userId)
            .orElseThrow(() -> new ResourceNotFoundException("생체 수치 기록", recordId));

        if (!record.getUser().getUserId().equals(userId)) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "해당 기록에 대한 권한이 없습니다.");
        }

        
        

        return BioValueRecordDto.UpdateRequest.from(bioValueRecordRepository.save(record));
>>>>>>> origin/jisoo0508
    }
}
