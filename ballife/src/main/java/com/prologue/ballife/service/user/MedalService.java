package com.prologue.ballife.service.user;

import java.util.List;
import java.util.stream.Collectors;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.prologue.ballife.domain.user.Medal;
import com.prologue.ballife.exception.DuplicateResourceException;
import com.prologue.ballife.exception.ResourceNotFoundException;
import com.prologue.ballife.repository.user.MedalRepository;
import com.prologue.ballife.web.dto.user.MedalDto;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class MedalService {

    private final MedalRepository medalRepository;

    // 메달 전체 조회 (가격순)
    public List<MedalDto.Response> getAllMedals() {
        return medalRepository.findAllByOrderByMedalPriceAsc().stream()
                .map(MedalDto.Response::from)
                .collect(Collectors.toList());
    }

    // 메달 단건 조회
    public MedalDto.Response getMedal(Long medalId) {
        Medal medal = medalRepository.findById(medalId)
                .orElseThrow(() -> new ResourceNotFoundException("메달", medalId));
        return MedalDto.Response.from(medal);
    }

    // 메달 생성 (관리자)
    @Transactional
    public MedalDto.Response createMedal(MedalDto.CreateRequest request) {
        if (medalRepository.existsByMedalName(request.getMedalName())) {
            throw new DuplicateResourceException("메달 이름", request.getMedalName());
        }

        Medal medal = Medal.builder()
                .medalName(request.getMedalName())
                .medalIcon(request.getMedalIcon())
                .medalPrice(request.getMedalPrice())
                .build();

        return MedalDto.Response.from(medalRepository.save(medal));
    }

    // 메달 삭제 (관리자)
    @Transactional
    public void deleteMedal(Long medalId) {
        if (!medalRepository.existsById(medalId)) {
            throw new ResourceNotFoundException("메달", medalId);
        }
        medalRepository.deleteById(medalId);
    }
}
