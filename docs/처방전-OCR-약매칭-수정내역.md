# 처방전 OCR → 약 이름 추출 → 식약처 매칭 파이프라인 수정 내역

> 작성일: 2026-06-01
> 대상 기능: 처방전 이미지 업로드 → 약 이름 자동 추출 → 약 정보 조회
> 관련 화면: `PrescriptionOcrTestModal` (처방전 등록 모달)

---

## 1. 전체 데이터 흐름

```
[프론트] PrescriptionOcrTestModal
   │  이미지(multipart/form-data) 전송
   ▼
[스프링] POST /api/ocr  (MedicineOcrController)
   │  ① NaverOcrService       → 이미지에서 모든 텍스트 토큰 추출 (List<String>)
   │  ② MedicineLLMService    → FastAPI 호출, 약 이름만 거른 List<String> 수신
   │  ③ MedicineApiService    → 약 이름별로 식약처 API 조회 → List<MedicineItemResponse>
   ▼
[FastAPI] POST /ocr  (ai-service/app/main.py)
   │  LangChain + LLM(gpt-4o-mini) → OCR 토큰 중 의약품 상품명만 추출
   ▼
[프론트] 모달에 약 이름 목록 표시 (스크롤 지원)
```

---

## 2. 수정 항목 요약

| # | 영역 | 파일 | 문제 | 해결 |
|---|------|------|------|------|
| 1 | FastAPI | `ai-service/app/main.py` | LLM이 약 목록을 ```` ```json ```` 코드펜스로 감싼 **문자열**로 반환 → 스프링 역직렬화 실패 | `with_structured_output`으로 **JSON 강제** |
| 2 | 스프링 | `MedicineApiService.java` | 약 하나라도 못 찾으면 예외로 **전체 요청 중단(500)** | 예외 잡고 **건너뛰기** |
| 3 | 스프링 | `MedicineApiService.java` | 순차 동기 호출로 **응답 지연** → 프론트 타임아웃 | `parallelStream` **병렬 호출** |
| 4 | 프론트 | `api/medicineApi.js` | 기본 타임아웃 10초 < OCR 처리 시간 → **요청 중단** | OCR 요청만 **타임아웃 60초** |
| 5 | 프론트 | `modals/prescriptionOcrTestModal.jsx` | 응답이 `[{medicineName}]` 객체 배열인데 문자열로 렌더 | `medicineName` **추출** |
| 6 | 프론트 | `modals/prescriptionOcrTestModal.jsx` | 약 목록이 많으면 모달 밖으로 넘침 | 목록 영역 **스크롤 처리** |

---

## 3. 상세 내역 (수정 전 / 수정 후 비교)

### 3-1. FastAPI — LLM 출력을 JSON으로 강제

**문제**
LLM(gpt-4o-mini)에게 "JSON 배열로 답해줘"라고 프롬프트로 *부탁*만 하면, 응답을 사람이 읽기 좋게 마크다운 코드펜스로 감싼다. 이 전체가 **하나의 문자열**이라 스프링의 `List<String>` 역직렬화가 실패한다.

```
JSON decoding error: Cannot construct instance of `java.util.ArrayList`
... from String value ('```json\n["알마겔정", ...]\n```')
```

#### 🔴 수정 전
```python
# ai-service/app/main.py
@app.post("/ocr")
async def ocr_Str_Extraction(ocrStrList: List[str] = Body(...)):
    ocrChain = promptOcrParsing | llm | StrOutputParser()   # 원문 문자열 그대로 반환
    result = await ocrChain.ainvoke({"OCR_STR": ocrStrList})
    return result   # "```json\n[...]\n```" 형태의 문자열 → 스프링 파싱 실패
```

#### 🟢 수정 후
```python
# ai-service/app/main.py
from pydantic import BaseModel
from typing import List

class MedicineList(BaseModel):
    medicines: List[str]

llm_structured = llm.with_structured_output(MedicineList)   # JSON Schema 토큰 단위 강제

@app.post("/ocr")
async def ocr_Str_Extraction(ocrStrList: List[str] = Body(...)):
    ocrChain = promptOcrParsing | llm_structured
    result = await ocrChain.ainvoke({"OCR_STR": ocrStrList})
    return result.medicines   # 순수 List[str], 코드펜스 없음
```

**원리**: Pydantic 모델 → JSON Schema 자동 변환 → OpenAI Structured Outputs가 토큰 생성 단계에서 스키마에 맞는 출력만 허용 → 코드펜스나 자연어가 애초에 생성 불가.

> 대안: `JsonOutputParser`도 코드펜스를 자동으로 벗겨 파싱한다. (`StrOutputParser`는 원문 문자열 그대로 반환하므로 사용 금지)

---

### 3-2 & 3-3. 스프링 — 개별 실패 무시 + 병렬 호출

**문제**
- OCR로 추출된 토큰에는 성분명(`에보글립틴타르타르산염`), 잘린 값(`슈가메트서방정5/100···`), 잡토큰(`AC300`)이 섞여 있어 식약처 API에서 못 찾는 경우가 많다.
- 기존 `findOrFetch`는 못 찾으면 `MedicineNotFoundException`을 던지고, `findOrFetchList`가 이를 잡지 않아 **요청 전체가 500으로 폭사**했다.
- 또한 토큰을 **하나씩 순차로** 외부 API에 `block()` 동기 호출 → 19건이면 20~30초 소요 → 프론트 타임아웃.

```
com.prologue.ballife.exception.MedicineNotFoundException: 의약품을 찾을 수 없습니다: 알마게이트500mg
```

#### 🔴 수정 전
```java
// MedicineApiService.java
public List<MedicineItemDto.MedicineItemResponse> findOrFetchList(List<String> itemList){
    List<MedicineItemDto.MedicineItemResponse> medicineList = new ArrayList<>();
    for (String item : itemList) {                  // 순차 처리
        Medicine medicine = findOrFetch(item);      // 못 찾으면 예외 → 루프 전체 중단(500)
        if(medicine != null){                       // findOrFetch는 null이 아니라 예외를 던지므로 무의미
            MedicineItemDto.MedicineItemResponse mediItem = MedicineItemResponse.from(medicine);
            medicineList.add(mediItem);
        }
    }
    return medicineList;
}
```

#### 🟢 수정 후
```java
// MedicineApiService.java
import java.util.Objects;
import java.util.stream.Collectors;

public List<MedicineItemDto.MedicineItemResponse> findOrFetchList(List<String> itemList){
    // 중복 제거 후 외부 API 호출을 병렬로 수행
    List<MedicineItemDto.MedicineItemResponse> medicineList = itemList.parallelStream()
            .distinct()
            .map(item -> {
                try {
                    return MedicineItemResponse.from(findOrFetch(item));
                } catch (MedicineNotFoundException e) {
                    log.info("약 조회 실패, 건너뜀: {}", item);   // 못 찾은 항목은 제외
                    return null;
                }
            })
            .filter(Objects::nonNull)
            .collect(Collectors.toList());

    log.info("약 조회 결과: 요청 {}건 중 {}건 매칭", itemList.size(), medicineList.size());
    return medicineList;
}
```

**효과**
- 한 약이 실패해도 나머지는 정상 반환 (500 → 부분 성공)
- 순차 20~30초 → 병렬 수 초로 단축
- `distinct()`로 중복 토큰의 헛 호출 제거
- 매칭 건수 로그로 진단 가능

---

### 3-4. 프론트 — OCR 요청 타임아웃 상향

**문제**
공통 axios 인스턴스의 `timeout: 10000`(10초)이 OCR 처리 시간보다 짧아, 응답 도착 전 요청이 중단된다. 이때 `error.response`가 비어 있어 인터셉터가 제네릭 토스트(`오류가 발생했습니다`)를 띄우고 Response는 빈 상태가 된다.

#### 🔴 수정 전
```javascript
// frontend/src/api/medicineApi.js
//OCR 스캔
ocrScan: (formData) => {
  return api.post("/ocr", formData);     // 공통 timeout 10초 적용 → OCR 처리 중 중단
},
```

#### 🟢 수정 후
```javascript
// frontend/src/api/medicineApi.js
//OCR 스캔 (OCR + LLM + 식약처 조회로 시간이 걸려 타임아웃을 넉넉히 둔다)
ocrScan: (formData) => {
  return api.post("/ocr", formData, { timeout: 60000 });   // 이 요청만 60초
},
```

> 공통 인스턴스(`api.js`)의 10초는 그대로 두고, 느린 OCR 요청에만 개별 타임아웃을 덮어쓴다.

---

### 3-5. 프론트 — 응답 객체에서 medicineName 추출

**문제**
백엔드가 `List<MedicineItemResponse>` 즉 `[{ "medicineName": "..." }, ...]` 객체 배열을 반환하는데, 모달은 문자열 배열로 가정하고 객체를 직접 렌더 → `Objects are not valid as a React child` 에러.

#### 🔴 수정 전
```javascript
// frontend/src/modals/prescriptionOcrTestModal.jsx
const res = await medicineApi.ocrScan(formData);
const data = res.data;
const names = Array.isArray(data) ? data : data.medicines ?? [];   // 객체 배열 그대로 저장
setMedicineNames(names);
// → 렌더 시 {name} 이 객체라 React 에러
```

#### 🟢 수정 후
```javascript
// frontend/src/modals/prescriptionOcrTestModal.jsx
const res = await medicineApi.ocrScan(formData);
const data = res.data;
// 백엔드 응답: [{ medicineName: "..." }, ...]
const list = Array.isArray(data) ? data : data.medicines ?? [];
const names = list.map((item) =>
  typeof item === "string" ? item : item.medicineName,   // 객체에서 문자열만 추출
);
setMedicineNames(names);
```

> `typeof item === "string" ? ...`는 백엔드가 다시 순수 문자열 배열을 주더라도 깨지지 않게 한 방어 코드.

---

### 3-6. 프론트 — 약 목록 스크롤 처리

**문제**
추출된 약이 많으면 목록이 모달 영역을 넘어가 레이아웃이 깨진다.

#### 🔴 수정 전
```javascript
// frontend/src/modals/prescriptionOcrTestModal.jsx
) : medicineNames.length > 0 ? (
  <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>   // 높이 제한 없음 → 무한 확장
    {medicineNames.map((name, idx) => (
```

#### 🟢 수정 후
```javascript
// frontend/src/modals/prescriptionOcrTestModal.jsx
) : medicineNames.length > 0 ? (
  <div
    style={{
      display: "flex",
      flexDirection: "column",
      gap: 8,
      maxHeight: 240,       // 최대 높이 제한
      overflowY: "auto",    // 넘치면 이 영역 안에서 스크롤
      paddingRight: 4,      // 스크롤바가 텍스트 가리지 않게
    }}
  >
    {medicineNames.map((name, idx) => (
```

> 라벨("약이름 목록")과 상태 배지는 스크롤 영역 밖에 있어 항상 고정 표시된다.

---

## 4. 변경된 파일 목록

```
ai-service/app/main.py                                          (FastAPI: 구조화 출력)
ballife/.../service/medicine/MedicineApiService.java            (예외 처리 + 병렬화)
ballife/.../service/medicine/MedicineLLMService.java            (FastAPI 연동)
ballife/.../web/medicine/MedicineOcrController.java             (엔드포인트)
ballife/.../web/dto/medicine/MedicineItemDto.java               (응답 DTO)
frontend/src/api/medicineApi.js                                 (OCR 타임아웃)
frontend/src/modals/prescriptionOcrTestModal.jsx               (응답 파싱 + 스크롤)
```

---

## 5. 남은 과제 (TODO)

- [ ] **토큰 정제**: OCR 결과의 성분명·잘린 값(`···`)·잡토큰(`AC300`)을 매칭 전에 거르거나, LLM 프롬프트에서 더 강하게 상품명만 추출하도록 개선
- [ ] **부분 검색**: 식약처 API가 정확한 상품명만 매칭하므로, 매칭률이 낮으면 부분 일치 검색 검토
- [ ] **디버그 코드 정리**: `MedicineLLMService`의 원본 로그 등 임시 코드 확인
- [ ] **에러 메시지 개선**: 매칭 0건일 때 프론트에 "추출된 약을 찾지 못했습니다" 안내 표시
