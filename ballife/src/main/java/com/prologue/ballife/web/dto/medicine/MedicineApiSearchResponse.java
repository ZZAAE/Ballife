package com.prologue.ballife.web.dto.medicine;

import java.util.List;

/*	식품의약품안전처_의약품개요정보(e약은요) API 통신을 위한 DTO */
public record MedicineApiSearchResponse(
    int totalCount,
    int pageNo,
    int numOfRows,
    List<MedicineItem> items
) {}
