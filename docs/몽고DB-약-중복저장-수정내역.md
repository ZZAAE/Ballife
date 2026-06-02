# MongoDB 의약품 중복 저장 문제 분석 및 수정 내역

> 작성일: 2026-06-01
> 대상 기능: 처방전 OCR → 약 이름 추출 → 식약처 API 조회 → MongoDB 캐싱
> 증상: OCR로 약 이름을 받아 저장할 때, **동일한 약이 MongoDB `medicines` 컬렉션에 중복 저장됨**

---

## 1. 데이터 흐름 요약

```
OCR 토큰(List<String>)
   │  예: "알마게이트500mg"
   ▼ MedicineApiService.findOrFetchList()  — 전처리(mg/··· 잘라내기) + parallelStream
   │  예: "알마게이트"
   ▼ findOrFetch(itemName)
   │  ① findByItemName(itemName)  → 캐시 확인
   │  ② 없으면 식약처 API 조회 → 공식 상품명 + itemSeq 획득
   │  ③ save() → MongoDB medicines 컬렉션
   ▼
저장된 문서: { itemSeq, itemName: "알마게이트정", ... }
```

`Medicine` 도메인은 `itemSeq`(품목기준코드)를 유니크 키로 의도하고 있다.

---

## 2. 원인 분석

중복 저장은 **세 가지 원인이 겹쳐서** 발생한다.

### 원인 ① (핵심) — `itemSeq` 유니크 인덱스가 실제로 생성되지 않음

`Medicine` 도메인에는 유니크 인덱스가 선언돼 있다.

```java
// Medicine.java
@Indexed(unique = true)
private String itemSeq; // 품목기준코드
```

그러나 **Spring Boot 2.2+ 부터 `spring.data.mongodb.auto-index-creation` 기본값이 `false`** 이고,
`application.yml`에 이 설정이 없었다.

```yaml
# 수정 전 application.yml — auto-index-creation 설정 없음
data:
  mongodb:
    host: localhost
    port: 27017
    database: Ballife
```

→ `@Indexed(unique=true)` 어노테이션이 **무시되어 MongoDB에 유니크 제약이 만들어지지 않음**
→ `save()`가 같은 `itemSeq`라도 막지 않고 **계속 새 문서를 insert**
→ `findOrFetch`의 `catch (DuplicateKeyException)` 폴백은 **예외가 절대 안 터지므로 죽은 코드**

> 참고: `Medicine`은 `@Id String id`가 새 엔티티에서 `null` → `save()`가 무조건 신규 insert로 처리한다.

### 원인 ② — 캐시 조회 이름 불일치 (재조회·재저장 유발)

`findOrFetch`의 캐시 체크는 **OCR 토큰 이름**으로 조회한다.

```java
// 조회: 전처리로 잘린 토큰 "알마게이트"
Optional<Medicine> medicineItem = medicineRepository.findByItemName(itemName);
```

하지만 DB에 저장된 문서의 `itemName`은 **식약처 API가 준 공식 상품명 "알마게이트정"** 이다.

→ 둘이 달라서 `findByItemName`이 **매 스캔마다 miss**
→ 매번 API 재조회 후 다시 save
→ 원인 ①과 겹치면 **스캔할 때마다 같은 약이 새로 쌓임**

특히 OCR 토큰 전처리(`mg`, `···` 잘라내기)가 이 불일치를 키운다 — 잘린 이름은 공식명과 절대 일치할 수 없다.

### 원인 ③ — `parallelStream` 동시성 경쟁 (한 요청 내부)

`findOrFetchList`는 `parallelStream()`으로 여러 약을 동시에 처리한다.
`distinct()`는 **동일 문자열만** 제거하므로, 서로 다른 토큰이 같은 약(itemSeq)으로 귀결되면
두 스레드가 동시에 "조회 miss → save"를 수행해 같은 약을 2번 insert한다.
유니크 인덱스가 있으면 한쪽이 `DuplicateKeyException`으로 걸러지지만, 원인 ① 때문에 둘 다 저장됐다.

### 요약표

| 원인 | 효과 | 단독 유발 |
|------|------|-----------|
| ① 유니크 인덱스 미생성 | `save` 무한 insert 허용 | ✅ (핵심) |
| ② 캐시 조회 이름 불일치 | 매 스캔마다 재조회·재저장 | ✅ (반복 스캔) |
| ③ parallelStream 경쟁 | 한 요청 내 동시 insert | ⚠️ (①과 겹칠 때) |

---

## 3. 수정 내역 (수정 전 / 수정 후)

### 수정 A — `itemSeq` 유니크 인덱스 실제 생성

MongoDB가 `@Indexed` 어노테이션을 읽어 인덱스를 자동 생성하도록 설정 추가.

#### 🔴 수정 전 (`application.yml`)
```yaml
  data:
    mongodb:
      host: localhost #배포할때는 실제 서버 주소가 들어감
      port: 27017
      database: Ballife # 데이터베이스명
```

#### 🟢 수정 후 (`application.yml`)
```yaml
  data:
    mongodb:
      host: localhost #배포할때는 실제 서버 주소가 들어감
      port: 27017
      database: Ballife # 데이터베이스명
      auto-index-creation: true # @Indexed(unique=true) 등 인덱스 자동 생성 (itemSeq 중복 저장 방지)
```

> ⚠️ 주의: **이미 중복 문서가 쌓여 있으면 유니크 인덱스 생성이 실패**한다.
> 이 경우 기존 중복을 먼저 정리(원인 C, 별도 작업)해야 인덱스가 정상 생성된다.

---

### 수정 B — `itemSeq` 기준 사전 체크 (예외에 의존하지 않는 중복 방지)

API에서 공식 `itemSeq`를 얻은 뒤, **저장 전에 `findByItemSeq`로 한 번 더 확인**하여
이름 불일치(원인 ②)에도 불구하고 기존 문서를 재사용하도록 변경.

#### 🔴 수정 전 (`MedicineApiService.findOrFetch`)
```java
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
```

#### 🟢 수정 후 (`MedicineApiService.findOrFetch`)
```java
public Medicine findOrFetch(String itemName){
    Optional<Medicine> medicineItem = medicineRepository.findByItemName(itemName);
    if(medicineItem.isPresent()){
        log.info("DB 캐시 히트: {}", itemName);
        return medicineItem.get();
    }

    MedicineApiResponse.MediApiItem item = fetchByItemName(itemName)
                        .orElseThrow(() -> new MedicineNotFoundException(itemName));

    // 조회 토큰(전처리로 잘린 이름)과 저장된 공식명이 달라 findByItemName 이 빗나가도,
    // 식약처가 준 itemSeq 로 다시 확인해 이미 저장된 약이면 재사용한다 (중복 insert 방지).
    Optional<Medicine> existing = medicineRepository.findByItemSeq(item.getItemSeq());
    if (existing.isPresent()) {
        log.info("itemSeq 캐시 히트: {} ({})", item.getItemName(), item.getItemSeq());
        return existing.get();
    }

    Medicine medicine = toEntity(item);

    try{
        return medicineRepository.save(medicine);
    } catch (DuplicateKeyException e){
        // 병렬 처리 중 동시 저장된 경우 등 — itemSeq 유니크 인덱스가 막아주면 기존 문서를 반환
        return medicineRepository.findByItemSeq(item.getItemSeq())
                .orElseThrow(()->e);
    }
}
```

**핵심 변경**: 식약처 응답의 `itemSeq`로 `findByItemSeq` 사전 조회 추가
→ 이름이 달라도 동일 약이면 캐시 히트 → **반복 스캔 시 중복 insert 차단**.

---

## 4. 두 수정의 역할 분담

| 수정 | 막는 원인 | 방식 |
|------|-----------|------|
| **A** (인덱스) | ③ 동시성 + ① 최후 방어선 | DB 레벨 유니크 제약 (최종 안전망) |
| **B** (사전 체크) | ② 이름 불일치 + ① 반복 저장 | 애플리케이션 레벨 사전 조회 |

- **B**: 평상시 중복을 애플리케이션 단에서 미리 차단 (예외 비용 없음)
- **A**: B를 빠져나간 동시성 경쟁(③)까지 DB가 최종 차단 + 폴백 코드가 실제로 동작하게 함

둘 다 있어야 견고하다. (B만으로는 parallelStream 동시 insert를 100% 못 막고, A만으로는 예외→폴백 비용이 매 스캔 발생)

---

## 5. 변경된 파일

```
ballife/src/main/resources/application.yml                       (auto-index-creation: true)
ballife/.../service/medicine/MedicineApiService.java             (findByItemSeq 사전 체크)
```

---

## 6. 남은 작업 (TODO)

- [ ] **기존 중복 문서 정리 (원인 C)**: 이미 쌓인 중복을 `itemSeq` 기준으로 제거해야
      `auto-index-creation: true`로 유니크 인덱스가 정상 생성된다.
      (중복이 남아 있으면 인덱스 생성 실패 → 로그에 인덱스 빌드 오류)
- [ ] **정리용 1회성 스크립트/쿼리**: MongoDB aggregation으로 `itemSeq` 중복 그룹을 찾아
      가장 오래된 1건만 남기고 삭제
- [ ] **검증**: 같은 처방전을 2회 연속 스캔했을 때 `medicines` 컬렉션 문서 수가
      늘지 않는지 확인 (`itemSeq 캐시 히트` 로그 확인)