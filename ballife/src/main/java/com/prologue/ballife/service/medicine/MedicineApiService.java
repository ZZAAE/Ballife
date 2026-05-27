package com.prologue.ballife.service.medicine;

import java.net.URI;
import java.nio.charset.StandardCharsets;
import java.util.Optional;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.web.reactive.function.client.WebClient;
import org.springframework.web.util.UriComponentsBuilder;

import com.prologue.ballife.web.dto.medicine.MedicineApiResponse;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Slf4j
@RequiredArgsConstructor
public class MedicineApiService {
    private final WebClient webClient = WebClient.builder().build();
    
    @Value("${mfds.api.base-url}")
    private String baseUrl;

    @Value("${mfds.api.service-key}")
    private String serviceKey;

    public Optional<MedicineApiResponse.MediApiItem> fetchByItemName(String itemName){
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
            
            
        } catch (Exception e){

        }
        
    }
}
