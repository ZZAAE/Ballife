package com.prologue.ballife.service.medicine;

import java.net.URI;
import java.nio.charset.StandardCharsets;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.Collections;
import java.util.List;
import java.util.Objects;
import java.util.Optional;
import java.util.stream.Collectors;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.reactive.function.client.WebClient;
import org.springframework.web.util.UriComponentsBuilder;

import com.mongodb.DuplicateKeyException;
import com.prologue.ballife.domain.medicine.Medicine;
import com.prologue.ballife.exception.MedicineNotFoundException;
import com.prologue.ballife.repository.medicineMongo.MedicineRepository;
import com.prologue.ballife.util.MediApiXMLParser;
import com.prologue.ballife.web.dto.medicine.MedicineApiResponse;
import com.prologue.ballife.web.dto.medicine.MedicineItemDto;
import com.prologue.ballife.web.dto.medicine.MedicineItemDto.MedicineItemResponse;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Slf4j
@Service
@RequiredArgsConstructor
public class MedicineApiService {
    private final WebClient webClient = WebClient.builder().build();
    
    private final MedicineRepository medicineRepository;
    
    @Value("${mfds.api.base-url}")
    private String baseUrl;

    @Value("${mfds.api.service-key}")
    private String serviceKey;

    public Medicine findOrFetch(String itemName){
        Optional<Medicine> medicineItem = medicineRepository.findByItemName(itemName);
        if(medicineItem.isPresent()){
            log.info("DB 캐시 히트: {}", itemName);
            return medicineItem.get();
        }

        MedicineApiResponse.MediApiItem item = fetchByItemName(itemName)
                            .orElseThrow(() -> new MedicineNotFoundException(itemName));

        Medicine medicine = toEntity(item);

        try{
            return medicineRepository.save(medicine);
        } catch (DuplicateKeyException e){
            return medicineRepository.findByItemSeq(item.getItemSeq())
                    .orElseThrow(()->e);
        }
    }

    public List<MedicineItemDto.MedicineItemResponse> findOrFetchList(List<String> itemList){
        // 중복 제거 후 외부 API 호출을 병렬로 수행 (순차 시 토큰 수만큼 지연 누적 → 프론트 타임아웃)
        List<MedicineItemDto.MedicineItemResponse> medicineList = itemList.parallelStream()
                .distinct()
                .map(item -> {
                    try {
                        return MedicineItemResponse.from(findOrFetch(item));
                    } catch (MedicineNotFoundException e) {
                        // 성분명·잡토큰 등 식약처 API에 없는 항목은 건너뜀
                        log.info("약 조회 실패, 건너뜀: {}", item);
                        return null;
                    }
                })
                .filter(Objects::nonNull)
                .collect(Collectors.toList());

        log.info("약 조회 결과: 요청 {}건 중 {}건 매칭", itemList.size(), medicineList.size());
        return medicineList;
    }

    private Medicine toEntity(MedicineApiResponse.MediApiItem item) {
        List<String> barCodes = item.getBarCode() == null || item.getBarCode().isBlank()
                ? Collections.emptyList()
                : Arrays.asList(item.getBarCode().split(","));

        return Medicine.builder()
                .itemSeq(item.getItemSeq())
                .itemName(item.getItemName())
                .itemEngName(item.getItemEngName())
                .etcOtcCode(item.getEtcOtcCode())
                .chart(item.getChart())
                .storageMethod(item.getStorageMethod())
                .validTerm(item.getValidTerm())
                .packUnit(item.getPackUnit())
                .materialName(item.getMaterialName())
                .mainItemIngr(item.getMainItemIngr())
                .mainIngrEng(item.getMainIngrEng())
                .ingrName(item.getIngrName())
                .atcCode(item.getAtcCode())
                .ediCode(item.getEdiCode())
                .barCodes(barCodes)
                .efficacy(MediApiXMLParser.toPlainText(item.getEeDocData()))
                .dosage(MediApiXMLParser.toPlainText(item.getUdDocData()))
                .precautions(MediApiXMLParser.toPlainText(item.getNbDocData()))
                .cachedAt(LocalDateTime.now())
                .build();
    }

    private Optional<MedicineApiResponse.MediApiItem> fetchByItemName(String itemName){
        URI uri = UriComponentsBuilder
                .fromHttpUrl(baseUrl + "/getDrugPrdtPrmsnDtlInq06")
                .queryParam("serviceKey", serviceKey)
                .queryParam("item_name", itemName)
                .queryParam("type", "json")
                .queryParam("numOfRows", 1)
                .queryParam("pageNo", 1)
                .build()
                .encode(StandardCharsets.UTF_8)
                .toUri();
        try{
            MedicineApiResponse response = webClient.get()
                                .uri(uri)
                                .retrieve()
                                .bodyToMono(MedicineApiResponse.class)
                                .block();
            if (response == null
                    || response.getHeader() == null
                    || !"00".equals(response.getHeader().getResultCode())) {
                log.warn("Medicine API 비정상 응답: {}",
                        response != null ? response.getHeader() : "null");
                return Optional.empty();
            }
            if (response.getBody() == null
                    || response.getBody().getTotalCount() == null
                    || response.getBody().getTotalCount() == 0
                    || response.getBody().getItems() == null
                    || response.getBody().getItems().isEmpty()){
                        return Optional.empty();
                    }
                    return Optional.of(response.getBody().getItems().get(0));
        } catch (Exception e){
            log.error("Medicine API 호출 실패: itemName={}", itemName, e);
            return Optional.empty();
        }
        
    }
}
