package com.prologue.ballife.web.dto.medicine;

import java.util.List;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.fasterxml.jackson.annotation.JsonProperty;

import lombok.Data;

@Data
@JsonIgnoreProperties(ignoreUnknown = true)
public class MedicineApiResponse {
    
    private Header header;
    private Body body;
    @Data
    @JsonIgnoreProperties(ignoreUnknown = true)
    public static class Header{
        private String resultCode;
        private String resultMsg;
    }

    @Data
    @JsonIgnoreProperties(ignoreUnknown = true)
    public static class Body{
        private Integer pageNo;
        private Integer totalCount;
        private Integer numOfRows;
        private List<MediApiItem> items;
    }

    @Data
    @JsonIgnoreProperties(ignoreUnknown = true)
    public static class MediApiItem {
        @JsonProperty("ITEM_SEQ")           
        private String itemSeq;
        @JsonProperty("ITEM_NAME")          
        private String itemName;
        @JsonProperty("ITEM_ENG_NAME")      
        private String itemEngName;
        @JsonProperty("ENTP_NAME")          
        private String entpName;
        @JsonProperty("ENTP_ENG_NAME")      
        private String entpEngName;
        @JsonProperty("BIZRNO")             
        private String bizrno;
        @JsonProperty("ITEM_PERMIT_DATE")   
        private String itemPermitDate;
        @JsonProperty("ETC_OTC_CODE")       
        private String etcOtcCode;
        @JsonProperty("CHART")              
        private String chart;
        @JsonProperty("BAR_CODE")           
        private String barCode;
        @JsonProperty("MATERIAL_NAME")      
        private String materialName;
        @JsonProperty("MAIN_ITEM_INGR")     
        private String mainItemIngr;
        @JsonProperty("MAIN_INGR_ENG")      
        private String mainIngrEng;
        @JsonProperty("INGR_NAME")          
        private String ingrName;
        @JsonProperty("STORAGE_METHOD")     
        private String storageMethod;
        @JsonProperty("VALID_TERM")         
        private String validTerm;
        @JsonProperty("PACK_UNIT")          
        private String packUnit;
        @JsonProperty("EDI_CODE")           
        private String ediCode;
        @JsonProperty("ATC_CODE")           
        private String atcCode;
        @JsonProperty("PERMIT_KIND_NAME")   
        private String permitKindName;
        @JsonProperty("CANCEL_NAME")        
        private String cancelName;
        @JsonProperty("CHANGE_DATE")        
        private String changeDate;
        @JsonProperty("RARE_DRUG_YN")       
        private String rareDrugYn;

        // PDF URL
        @JsonProperty("EE_DOC_ID")          
        private String eeDocId;   
        @JsonProperty("UD_DOC_ID")          
        private String udDocId;
        @JsonProperty("NB_DOC_ID")          
        private String nbDocId;

        // XML 문자열
        @JsonProperty("EE_DOC_DATA")        
        private String eeDocData; 
        @JsonProperty("UD_DOC_DATA")        
        private String udDocData;
        @JsonProperty("NB_DOC_DATA")        
        private String nbDocData;
    }
}
