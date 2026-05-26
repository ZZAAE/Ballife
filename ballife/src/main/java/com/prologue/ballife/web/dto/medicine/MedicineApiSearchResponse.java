package com.prologue.ballife.web.dto.medicine;

/*	식품의약품안전처_의약품개요정보(e약은요) API 통신을 위한 DTO */
public record MedicineApiSearchResponse(
    int totalCount,
    int pageNo,
    int numOfRows
) {}
