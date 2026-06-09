package com.prologue.ballife.service.exercise;

import java.time.LocalDate;
import java.util.List;
import java.util.Map;
import java.util.Objects;
import java.util.Set;
import java.util.function.Function;
import java.util.stream.Collectors;
import java.util.stream.StreamSupport;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.prologue.ballife.config.MessageResolver;
import com.prologue.ballife.domain.exercise.ExerciseType;
import com.prologue.ballife.domain.exercise.UserExercise;
import com.prologue.ballife.domain.exercise.UserExerciseDetail;
import com.prologue.ballife.domain.user.User;
import com.prologue.ballife.exception.ResourceNotFoundException;
import com.prologue.ballife.repository.exercise.UserExerciseRepository;
import com.prologue.ballife.repository.exerciseMongo.ExerciseTypeRepository;
import com.prologue.ballife.repository.exerciseMongo.UserExerciseDetailRepository;
import com.prologue.ballife.repository.user.UserRepository;
import com.prologue.ballife.web.dto.exercise.UserExerciseDetailDto;
import com.prologue.ballife.web.dto.exercise.UserExerciseDto;

import lombok.RequiredArgsConstructor;

// user_exercise  -> MySQL (JPA)
// exercise_type, user_exercise_detail -> MongoDB
@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class UserExerciseService {

    // 프론트에서 영문 키를 넘기는 경우 운동명으로 매핑
    private static final Map<String, String> EXERCISE_TYPE_ALIASES = Map.ofEntries(
            Map.entry("cycling", "사이클"),
            Map.entry("running", "러닝"),
            Map.entry("jumprope", "줄넘기"),
            Map.entry("walking", "걷기"),
            Map.entry("stair", "천국의 계단"),
            Map.entry("dumbbellpress", "벤치프레스"),
            Map.entry("squat", "스쿼트"),
            Map.entry("deadlift", "데드리프트"),
            Map.entry("shoulderpress", "숄더프레스"),
            Map.entry("barbellrow", "바벨로우"));

    private final UserExerciseRepository userExerciseRepository;
    private final UserRepository userRepository;
    private final ExerciseTypeRepository exerciseTypeRepository;
    private final UserExerciseDetailService userExerciseDetailService;
    private final UserExerciseDetailRepository userExerciseDetailRepository;
    private final MessageResolver messages;

    // 특정 날짜의 소모 칼로리 합산 (기록 없으면 0)
    @Transactional(readOnly = true)
    public Integer getBurnedCalorieByDate(Long userId, LocalDate date) {
        Integer sum = userExerciseRepository.sumBurnedCalorieByUserIdAndDate(userId, date, date);
        return sum != null ? sum : 0;
    }

    @Transactional(readOnly = true)
    public List<UserExerciseDto.Response> getUserExercisesByDate(Long userId, LocalDate date) {
        List<UserExercise> exercises = userExerciseRepository
                .findByUser_UserIdAndExerciseDateAndIsDeletedFalse(userId, date);

        Map<String, ExerciseType> typeMap = loadExerciseTypeMap(exercises);

        return exercises.stream()
                .map(ue -> UserExerciseDto.Response.from(ue, typeMap.get(ue.getExerciseTypeId())))
                .collect(Collectors.toList());
    }

    // 기간 내 모든 운동 기록을 MongoDB 상세까지 한 번에 조인하여 반환
    @Transactional(readOnly = true)
    public List<UserExerciseDto.DetailedResponse> getUserExercisesWithDetails(
            Long userId, LocalDate startDate, LocalDate endDate) {
        List<UserExercise> exercises = userExerciseRepository
                .findByUser_UserIdAndExerciseDateBetweenAndIsDeletedFalse(userId, startDate, endDate);

        if (exercises.isEmpty()) {
            return List.of();
        }

        Map<String, ExerciseType> typeMap = loadExerciseTypeMap(exercises);

        List<Long> exerciseIds = exercises.stream()
                .map(UserExercise::getUserExerciseId)
                .collect(Collectors.toList());

        Map<Long, UserExerciseDetail> detailMap = userExerciseDetailRepository
                .findByUserExerciseIdIn(exerciseIds)
                .stream()
                .collect(Collectors.toMap(
                        UserExerciseDetail::getUserExerciseId,
                        Function.identity(),
                        (a, b) -> a));

        return exercises.stream()
                .map(ue -> {
                    ExerciseType type = typeMap.get(ue.getExerciseTypeId());
                    UserExerciseDetail detail = detailMap.get(ue.getUserExerciseId());
                    return UserExerciseDto.DetailedResponse.builder()
                            .userExerciseId(ue.getUserExerciseId())
                            .exerciseTypeId(ue.getExerciseTypeId())
                            .exerciseName(type != null ? type.getExerciseName() : null)
                            .exerciseCategory(type != null ? type.getExerciseCategory() : null)
                            .exerciseDate(ue.getExerciseDate())
                            .exerciseTime(ue.getExerciseTime())
                            .burnedCalorie(ue.getBurnedCalorie())
                            .exerciseMin(detail != null ? detail.getExerciseMin() : null)
                            .exerciseSet(detail != null ? detail.getExerciseSet() : null)
                            .exerciseReps(detail != null ? detail.getExerciseReps() : null)
                            .exerciseWeight(detail != null ? detail.getExerciseWeight() : null)
                            .exerciseHard(detail != null ? detail.getExerciseHard() : null)
                            .distanceKm(detail != null ? detail.getDistanceKm() : null)
                            .build();
                })
                .collect(Collectors.toList());
    }

    // 운동 기록 목록에 등장하는 exerciseTypeId 들을 한 번의 IN 쿼리로 가져와 Map 으로 매핑
    private Map<String, ExerciseType> loadExerciseTypeMap(List<UserExercise> exercises) {
        Set<String> typeIds = exercises.stream()
                .map(UserExercise::getExerciseTypeId)
                .filter(Objects::nonNull)
                .collect(Collectors.toSet());

        if (typeIds.isEmpty()) {
            return Map.of();
        }

        Iterable<ExerciseType> found = exerciseTypeRepository.findAllById(typeIds);
        return StreamSupport.stream(found.spliterator(), false)
                .collect(Collectors.toMap(ExerciseType::getExerciseTypeId, Function.identity()));
    }

    @Transactional
    public UserExerciseDto.Response createUserExercise(Long userId, UserExerciseDto.CreateRequest request) {

        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException(
                        messages.get("error.notFound", messages.get("resource.user"), userId)));

        ExerciseType exerciseType = resolveExerciseType(request.getExerciseTypeId());

        int burnedCalorie = calculateCalorie(exerciseType,
                request.getExerciseMin(),
                request.getExerciseSet(),
                request.getExerciseReps(),
                request.getExerciseWeight(),
                request.getExerciseHard(),
                user.getWeight());

        UserExercise userExercise = UserExercise.builder()
                .user(user)
                .exerciseTypeId(exerciseType.getExerciseTypeId())
                .exerciseDate(request.getExerciseDate())
                .exerciseTime(request.getExerciseTime())
                .burnedCalorie(burnedCalorie)
                .build();

        UserExercise saved = userExerciseRepository.save(userExercise);

        // 상세 정보(분/세트/반복/무게/강도)는 MongoDB user_exercise_detail 에 저장
        userExerciseDetailService.create(saved.getUserExerciseId(),
                UserExerciseDetailDto.CreateRequest.builder()
                        .exerciseMin(request.getExerciseMin())
                        .exerciseSet(request.getExerciseSet())
                        .exerciseReps(request.getExerciseReps())
                        .exerciseWeight(request.getExerciseWeight())
                        .exerciseHard(request.getExerciseHard())
                        .distanceKm(request.getDistanceKm())
                        .build());

        return UserExerciseDto.Response.from(saved, exerciseType);
    }

    @Transactional
    public UserExerciseDto.Response updateUserExercise(Long userExerciseId, UserExerciseDto.UpdateRequest request) {

        UserExercise userExercise = userExerciseRepository.findById(userExerciseId)
                .orElseThrow(() -> new ResourceNotFoundException(
                        messages.get("error.notFound", messages.get("resource.exercise"), userExerciseId)));

        ExerciseType exerciseType = resolveExerciseType(request.getExerciseTypeId());

        // MongoDB detail 부분 갱신 (null 필드는 기존 값 유지)
        userExerciseDetailService.update(userExerciseId,
                UserExerciseDetailDto.UpdateRequest.builder()
                        .exerciseMin(request.getExerciseMin())
                        .exerciseSet(request.getExerciseSet())
                        .exerciseReps(request.getExerciseReps())
                        .exerciseWeight(request.getExerciseWeight())
                        .exerciseHard(request.getExerciseHard())
                        .distanceKm(request.getDistanceKm())
                        .build());

        // 칼로리는 클라이언트가 직접 지정했으면 그 값을, 아니면 서버에서 재계산
        int burnedCalorie;
        if (request.getBurnedCalorie() != null) {
            burnedCalorie = request.getBurnedCalorie();
        } else {
            Double userWeight = userExercise.getUser() != null ? userExercise.getUser().getWeight() : null;
            burnedCalorie = calculateCalorie(exerciseType,
                    request.getExerciseMin(),
                    request.getExerciseSet(),
                    request.getExerciseReps(),
                    request.getExerciseWeight(),
                    request.getExerciseHard(),
                    userWeight);
        }

        userExercise.setExerciseTypeId(exerciseType.getExerciseTypeId());
        userExercise.setExerciseDate(request.getExerciseDate());
        if (request.getExerciseTime() != null) {
            userExercise.setExerciseTime(request.getExerciseTime());
        }
        userExercise.setBurnedCalorie(burnedCalorie);

        return UserExerciseDto.Response.from(userExercise, exerciseType);
    }

    @Transactional
    public void deleteUserExercise(Long userExerciseId) {

        UserExercise userExercise = userExerciseRepository.findById(userExerciseId)
                .orElseThrow(() -> new ResourceNotFoundException(
                        messages.get("error.notFound", messages.get("resource.exercise"), userExerciseId)));

        // MongoDB 상세 먼저 정리한 뒤 MySQL 본행을 실제 삭제
        userExerciseDetailService.deleteByUserExerciseId(userExerciseId);
        userExerciseRepository.delete(userExercise);
    }

    // MongoDB user_exercise_detail 단건 조회
    @Transactional(readOnly = true)
    public UserExerciseDetailDto.Response getUserExerciseDetail(Long userExerciseId) {
        return userExerciseDetailService.findByUserExerciseId(userExerciseId);
    }

    // 상세 정보만 부분 수정 (PATCH 의미)
    @Transactional
    public UserExerciseDetailDto.Response updateUserExerciseDetail(
            Long userExerciseId, UserExerciseDetailDto.UpdateRequest request) {
        return userExerciseDetailService.update(userExerciseId, request);
    }

    // 칼로리 계산 공식: MET × 체중(kg) × 운동시간(h)
    // - 유산소: MET 는 운동 종류 × 강도(exerciseHard)로 결정 (AEROBIC_MET 표)
    // - 무산소: MET 는 볼륨(중량 × 횟수 × 세트)에 비례해 연속적으로 변함
    //     MET = 4 + 4 × √(볼륨 / 5000) (볼륨 0 → 4, 5000 → 8, 이후로도 완만히 증가)
    // - 무산소에서 exerciseMin 이 없으면 sets × reps × 3초 로 시간을 추정
    //   (체육관 기준 1 rep ≒ 3초, 세트 간 휴식은 칼로리에 포함하지 않음)
    // - 체중이 비었으면 의미 있는 값을 계산할 수 없으므로 0 을 반환
    private static final int SECONDS_PER_REP = 3;
    private static final String AEROBIC = "유산소";

    // 유산소 운동 종류 × 강도[낮음, 보통, 높음] → MET.
    // 프론트(AEROBIC_MET_BY_INTENSITY)와 동일하게 유지해야 미리보기/저장 칼로리가 일치한다.
    private static final Map<String, double[]> AEROBIC_MET = Map.of(
            "걷기", new double[] { 3, 4, 5 },
            "러닝", new double[] { 8, 10, 12 },
            "사이클", new double[] { 4.5, 7, 11 },
            "줄넘기", new double[] { 8, 11, 13 },
            "천국의 계단", new double[] { 6, 8.5, 11 });

    private int calculateCalorie(ExerciseType exerciseType,
            Integer exerciseMin,
            Integer exerciseSet,
            Integer exerciseReps,
            Integer exerciseWeight,
            String exerciseHard,
            Double userWeightKg) {
        if (userWeightKg == null || userWeightKg <= 0) {
            return 0;
        }

        double metValue = resolveMet(exerciseType, exerciseSet, exerciseReps, exerciseWeight, exerciseHard);
        if (metValue <= 0) {
            return 0;
        }

        double hours = resolveExerciseHours(exerciseType, exerciseMin, exerciseSet, exerciseReps);
        if (hours <= 0) {
            return 0;
        }

        return (int) Math.round(metValue * userWeightKg * hours);
    }

    // 유산소: 운동 종류 × 강도 표 / 무산소: 볼륨 구간
    private double resolveMet(ExerciseType exerciseType,
            Integer exerciseSet, Integer exerciseReps, Integer exerciseWeight, String exerciseHard) {
        boolean isAnaerobic = !AEROBIC.equals(exerciseType.getExerciseCategory());
        if (isAnaerobic) {
            long volume = (long) nz(exerciseWeight) * nz(exerciseReps) * nz(exerciseSet);
            return anaerobicMetByVolume(volume);
        }

        double[] tiers = AEROBIC_MET.get(exerciseType.getExerciseName());
        if (tiers != null) {
            return tiers[intensityIndex(exerciseHard)];
        }
        // 표에 없는 유산소 운동은 시드 MET 로 폴백
        Double met = exerciseType.getMet();
        return (met != null && met > 0) ? met : 0.0;
    }

    // 볼륨에 비례해 연속 증가하는 MET (제곱근 곡선): 볼륨 0 → 4, 5000 → 8.
    // 프론트(anaerobicMetByVolume)와 동일한 공식이어야 미리보기/저장 칼로리가 일치한다.
    private double anaerobicMetByVolume(long volume) {
        double v = Math.max(0L, volume);
        return 4.0 + 4.0 * Math.sqrt(v / 5000.0);
    }

    // 낮음 → 0, 보통/미지정 → 1, 높음 → 2
    private int intensityIndex(String exerciseHard) {
        if ("낮음".equals(exerciseHard)) {
            return 0;
        }
        if ("높음".equals(exerciseHard)) {
            return 2;
        }
        return 1;
    }

    private int nz(Integer value) {
        return value != null ? value : 0;
    }

    private double resolveExerciseHours(ExerciseType exerciseType,
            Integer exerciseMin, Integer exerciseSet, Integer exerciseReps) {
        if (exerciseMin != null && exerciseMin > 0) {
            return exerciseMin / 60.0;
        }
        // 무산소: 분이 비면 sets × reps × 3초 로 추정
        boolean isAnaerobic = !AEROBIC.equals(exerciseType.getExerciseCategory());
        if (isAnaerobic && exerciseSet != null && exerciseSet > 0
                && exerciseReps != null && exerciseReps > 0) {
            return (exerciseSet * exerciseReps * SECONDS_PER_REP) / 3600.0;
        }
        return 0.0;
    }

    private ExerciseType resolveExerciseType(String exerciseTypeKey) {
        if (exerciseTypeKey == null || exerciseTypeKey.isBlank()) {
            throw new ResourceNotFoundException(
                    messages.get("error.notFound", messages.get("resource.exerciseType"), exerciseTypeKey));
        }

        // 1) ObjectId(24자 hex) 로 보이면 _id 조회
        if (exerciseTypeKey.length() == 24 && exerciseTypeKey.chars().allMatch(c -> isHexDigit((char) c))) {
            return exerciseTypeRepository.findById(exerciseTypeKey)
                    .orElseThrow(() -> new ResourceNotFoundException(
                            messages.get("error.notFound", messages.get("resource.exerciseType"), exerciseTypeKey)));
        }

        // 2) 영문 별칭이면 한글 운동명으로 변환
        String resolvedName = EXERCISE_TYPE_ALIASES.getOrDefault(exerciseTypeKey, exerciseTypeKey);

        return exerciseTypeRepository.findByExerciseName(resolvedName)
                .orElseThrow(() -> new ResourceNotFoundException(
                        messages.get("error.notFound", messages.get("resource.exerciseType"), exerciseTypeKey)));
    }

    private static boolean isHexDigit(char c) {
        return (c >= '0' && c <= '9') || (c >= 'a' && c <= 'f') || (c >= 'A' && c <= 'F');
    }
}
