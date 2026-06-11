# Ballife RAG 구현 학습 정리

> 성인병 진단수치 PDF를 지식베이스로 삼아, 챗봇이 "근거 있는" 건강 답변을 하도록 만든 RAG(Retrieval-Augmented Generation) 파이프라인 정리.
> 실제 코드 파일: [`app/rag.py`](app/rag.py), [`app/main.py`](app/main.py), [`requirements.txt`](requirements.txt), [`Dockerfile`](Dockerfile)

---

## 0. RAG가 뭐고, 왜 썼나 (개념)

**문제**: LLM(gpt-4o-mini)은 "성인병 진단 수치 기준"을 정확히 외우고 있지 않다. 그냥 물어보면 그럴듯하지만 부정확한 숫자(환각, hallucination)를 말할 수 있다.

**해결(RAG)**: 답변을 생성하기 **전에**, 신뢰할 수 있는 문서(우리가 만든 PDF)에서 질문과 관련된 부분을 **검색(Retrieval)**해서 프롬프트에 끼워 넣는다. LLM은 그 근거를 보고 답한다 → **정확도 ↑, 환각 ↓**.

```
[일반 LLM]   질문 ─────────────────────────► LLM ─► 답변(부정확 가능)

[RAG]        질문 ─► 관련 문서 청크 검색 ─► (질문 + 근거) ─► LLM ─► 답변(근거 기반)
                      └ 우리 PDF 지식베이스
```

핵심 한 줄: **"검색해서(R) → 프롬프트에 더해(A) → 생성한다(G)"**

---

## 1. 한눈에 보는 전체 파이프라인

RAG는 **두 단계**로 나뉜다.

### (A) 인덱싱 — 서버 기동 시 1회 (오프라인 준비)
```
PDF 로드 ─► 청크 분할 ─► 임베딩(벡터화) ─► FAISS 벡터 DB 적재(메모리)
PyPDFLoader   Splitter      OpenAIEmbeddings    FAISS.from_documents
```

### (B) 검색·생성 — 사용자가 질문할 때마다 (실시간)
```
사용자 질문 ─► 질문 임베딩 ─► 유사 청크 Top-3 검색 ─► 프롬프트에 주입 ─► LLM 생성
              (자동)          similarity_search        [참고자료] 섹션      ainvoke
```

| 단계 | 담당 코드 | 실행 시점 |
|---|---|---|
| 인덱싱 | `build_vectorstore()` ([rag.py](app/rag.py)) | 서버 startup 1회 |
| 검색 | `retrieve(query)` ([rag.py](app/rag.py)) | `/chat` 요청마다 |
| 생성 | `/chat` 핸들러 ([main.py](app/main.py)) | `/chat` 요청마다 |

---

## 2. 단계별 상세 (코드 + 설명)

### Step 0. 의존성 ([requirements.txt](requirements.txt))

```txt
langchain-openai>=0.2.0          # OpenAI 임베딩 + ChatLLM
langchain>=0.3.0
langchain-community>=0.3.0       # PyPDFLoader, FAISS 벡터스토어
langchain-text-splitters>=0.3.0  # 청크 분할기
pypdf>=4.0.0                     # PDF 파싱 엔진 (PyPDFLoader가 내부 사용)
faiss-cpu>=1.8.0                 # 벡터 유사도 검색 엔진 (CPU 버전)
```

- **왜 `faiss-cpu`?** GPU가 없는 가비아 클라우드(Rocky Linux)에서 돌리므로 CPU 버전으로 충분. 19개 청크 정도는 CPU로 순식간.
- **`langchain-community`**: PDF 로더와 FAISS 래퍼가 여기에 들어있다(코어가 아니라 커뮤니티 패키지).

---

### Step 1. PDF 경로 지정 + 로드

```python
# app/rag.py
from pathlib import Path
from langchain_community.document_loaders import PyPDFLoader

PDF_PATH = Path(__file__).parent.parent / "config" / "성인병_5종_분류_및_진단수치_정리.pdf"

loader = PyPDFLoader(str(PDF_PATH))
docs = loader.load()   # 페이지 단위 Document 리스트 반환
```

**설명**
- `Path(__file__).parent.parent` = `app/`의 부모 = `ai-service/` → `ai-service/config/...pdf`.
  - 상대경로(`"./config/..."`)가 아니라 **파일 기준 절대경로**로 잡은 이유: 서버를 어느 디렉터리에서 실행하든(`uvicorn`을 어디서 띄우든) PDF를 항상 찾기 위함.
- `loader.load()`는 PDF를 **페이지 단위** `Document` 객체 리스트로 변환한다. 각 `Document`는 `page_content`(텍스트) + `metadata`(페이지 번호 등)를 가진다.

---

### Step 2. 청크 분할 (Chunking)

```python
# app/rag.py
from langchain_text_splitters import RecursiveCharacterTextSplitter

CHUNK_SIZE = 500     # 청크 최대 글자 수
CHUNK_OVERLAP = 80   # 청크 간 겹침 글자 수

splitter = RecursiveCharacterTextSplitter(
    chunk_size=CHUNK_SIZE,
    chunk_overlap=CHUNK_OVERLAP,
)
chunks = splitter.split_documents(docs)
```

**왜 자르나?**
- 페이지 전체를 한 덩어리로 검색하면 **불필요한 내용까지 같이** 딸려와 LLM 프롬프트가 길어지고(토큰 낭비) 정확도가 떨어진다.
- 작게 자르면 질문과 **딱 맞는 조각**만 검색되어 정밀해진다.

**`RecursiveCharacterTextSplitter`의 원리**
- 문단(`\n\n`) → 줄(`\n`) → 문장 → 단어 순으로 **의미 단위를 최대한 보존**하며 자른다. 그냥 글자 수로 뚝 자르는 것보다 문맥이 덜 깨진다.

**`chunk_overlap`(겹침)이 왜 필요한가?**
- 경계에서 문장이 두 청크로 쪼개지면 둘 다 의미가 깨진다. 80자를 겹쳐 두면 경계 문장이 한쪽 청크에는 온전히 들어가 **검색 누락을 방지**한다.

```
청크1: [..... 공복혈당 126mg/dL 이상이면]
청크2: [126mg/dL 이상이면 당뇨로 진단한다 .....]   ← 겹침 덕에 "진단한다"가 살아있음
```

> 우리 PDF는 분할 결과 **총 19개 청크**가 나왔다 (로그: `[RAG] 벡터 DB 구축 완료 — 19개 청크`).

---

### Step 3. 임베딩 (텍스트 → 벡터)

```python
# app/rag.py
from langchain_openai import OpenAIEmbeddings

embeddings = OpenAIEmbeddings(model="text-embedding-3-small")
```

**설명**
- **임베딩** = 텍스트를 의미를 담은 **숫자 벡터(좌표)**로 바꾸는 것. 의미가 비슷한 문장은 벡터 공간에서 **가까이** 위치한다.
- `text-embedding-3-small`: OpenAI의 가성비 임베딩 모델(1536차원). 정확도 대비 저렴/빠름 → 소규모 지식베이스에 적합.
- ⚠️ 이 호출은 **OpenAI API**를 쓰므로 `OPENAI_API_KEY` 환경변수가 필요하다. (배포 오류 항목 참고)

```
"공복혈당 126 이상은 당뇨"  ─OpenAIEmbeddings─►  [0.021, -0.10, 0.33, ... ] (1536개 숫자)
```

---

### Step 4. FAISS 벡터 DB 구축

```python
# app/rag.py
from langchain_community.vectorstores import FAISS

_vectorstore: FAISS | None = None   # 모듈 전역 (싱글톤처럼 1개만 유지)

_vectorstore = FAISS.from_documents(chunks, embeddings)
```

**설명**
- **FAISS**(Facebook AI Similarity Search) = 벡터들 사이의 **유사도(거리) 검색**을 빠르게 해주는 엔진.
- `FAISS.from_documents(chunks, embeddings)` 한 줄이 내부적으로:
  1. 19개 청크를 각각 임베딩(벡터화)하고
  2. 그 벡터들을 인덱스에 담아
  3. **검색 가능한 벡터 DB**를 만든다.
- **인메모리(in-memory)**: 디스크에 저장하지 않고 프로세스 메모리에 올린다. 서버가 꺼지면 사라지고, 켤 때마다 다시 만든다. (→ 고도화 항목에서 개선 포인트)
- `_vectorstore`를 **모듈 전역**에 둔 이유: 매 요청마다 다시 만들면 비싸므로, **한 번 만들어 재사용**.

---

### Step 5. 서버 기동 시 1회만 빌드 (startup 훅)

```python
# app/main.py
from app.rag import build_vectorstore, retrieve

@app.on_event("startup")
async def _warmup_model():
    # 서버 기동 시 모델 & RAG 벡터 DB를 백그라운드로 미리 로드. 실패해도 서버는 정상 기동.
    asyncio.create_task(asyncio.to_thread(warmup_food_model))
    asyncio.create_task(asyncio.to_thread(build_vectorstore))
    return {"ok": True}
```

**설계 포인트**
- `asyncio.to_thread(build_vectorstore)`: PDF 로드+임베딩은 **블로킹(동기)** 작업이라 그대로 두면 서버 기동이 멈춘다. **별도 스레드**로 돌려 이벤트 루프를 막지 않는다.
- `asyncio.create_task(...)`: 기다리지 않고 **백그라운드로** 실행. 그래서 서버는 즉시 뜨고, 벡터 DB는 잠시 뒤 준비된다.
- **실패 내성**: PDF가 없거나 임베딩이 실패해도 `build_vectorstore` 안에서 조용히 처리(아래)되어 **서버 자체는 정상 기동**한다. RAG만 비활성(빈 컨텍스트)으로 동작.

```python
# app/rag.py — 실패 내성
def build_vectorstore() -> None:
    global _vectorstore
    if not PDF_PATH.exists():
        print(f"[RAG] PDF 파일을 찾을 수 없습니다: {PDF_PATH}")
        return   # ← 여기서 끝내도 서버는 살아있음 (_vectorstore = None 유지)
    ...
```

---

### Step 6. 검색 — `retrieve(query)`

```python
# app/rag.py
TOP_K = 3   # 검색 시 반환할 청크 수

def retrieve(query: str) -> str:
    if _vectorstore is None:
        return ""                       # 벡터 DB 미준비 → 빈 문자열 (RAG 비활성)

    results = _vectorstore.similarity_search(query, k=TOP_K)
    if not results:
        return ""

    return "\n\n".join(doc.page_content for doc in results)
```

**설명**
- `similarity_search(query, k=3)`: 질문을 **자동으로 임베딩**한 뒤, 벡터 DB에서 **가장 가까운(유사한) 청크 3개**를 찾아 반환.
- 찾은 3개 청크의 텍스트를 `\n\n`로 이어 **하나의 문자열**로 만들어 돌려준다.
- 방어 코드 2개: ① 벡터 DB가 아직 안 만들어졌으면 빈 문자열, ② 결과가 없어도 빈 문자열 → **호출부가 RAG 없이도 동작**하게 함.

---

### Step 7. 생성 — `/chat`에서 프롬프트에 근거 주입

```python
# app/main.py  (/chat 핸들러 일부)

# RAG: 질문과 관련된 성인병 진단수치 문서 청크 검색
rag_context = retrieve(user_text) if user_text else ""
rag_section = (
    f"\n\n[성인병 진단수치 참고자료]\n{rag_context}" if rag_context else ""
)

text_block = (
    f"[사용자 건강 데이터 요약]\n{health_summary}"
    f"{rag_section}\n\n[질문]\n{user_text}"
)
messages = [SystemMessage(content=system_prompt), *history,
            HumanMessage(content=text_block)]

response = await llm.ainvoke(messages)
```

**설명 — 최종 프롬프트가 어떻게 조립되는가**
```
[사용자 건강 데이터 요약]
- 혈당: 최근값 130mg/dL ...

[성인병 진단수치 참고자료]      ← retrieve()가 찾아온 PDF 청크 3개 (있을 때만)
공복혈당 126mg/dL 이상이면 당뇨로 진단 ...

[질문]
내 혈당 괜찮아?
```
- RAG 컨텍스트가 **있을 때만** `[성인병 진단수치 참고자료]` 섹션을 끼운다(`if rag_context`). 없으면 깔끔히 생략 → 토큰 낭비 없음.
- 이미지 첨부(비전) 케이스에서도 동일하게 `rag_section`을 텍스트 블록에 포함한다.
- 결과적으로 LLM은 **사용자 데이터 + 진단 기준(PDF 근거) + 질문**을 함께 보고 답한다.

---

## 3. 핵심 파라미터 한 장 정리

| 파라미터 | 값 | 의미 | 바꾸면? |
|---|---|---|---|
| `CHUNK_SIZE` | 500 | 청크 최대 글자 수 | ↑ 문맥↑·정밀도↓·토큰↑ / ↓ 정밀↑·문맥끊김 위험 |
| `CHUNK_OVERLAP` | 80 | 청크 간 겹침 | ↑ 경계 누락↓·중복↑ / ↓ 누락 위험 |
| `TOP_K` | 3 | 검색해 가져올 청크 수 | ↑ 근거↑·토큰↑·노이즈↑ / ↓ 핵심만·누락 위험 |
| 임베딩 모델 | `text-embedding-3-small` | 텍스트→벡터(1536차원) | `-large`로 정확도↑(비용↑) |
| 저장 방식 | FAISS in-memory | 메모리 벡터 DB | 디스크 영속화로 기동 속도↑ |

---

## 4. 배포 관점에서 꼭 알아야 할 2가지

### (1) PDF를 도커 이미지에 포함시켜야 함 ([Dockerfile](Dockerfile))
```dockerfile
COPY app ./app
# RAG 지식베이스 PDF (config/ → /app/config). rag.py 가 /app/config/*.pdf 를 로드.
COPY config ./config
```
- 소스(`app/`)만 복사하면 컨테이너 안에 PDF가 없어서 RAG가 죽는다. `config/`(PDF 들어있음)를 **반드시 함께 COPY**해야 한다. (← 실제로 겪은 오류, 아래 참고)

### (2) OpenAI 키 주입
- 임베딩(`OpenAIEmbeddings`)·LLM 모두 `OPENAI_API_KEY` 환경변수가 필요. 배포 시 `.env`/compose의 `environment`로 주입한다. 로컬은 `load_dotenv()` + `.env`.

---

## 5. 내가 겪은 오류 → 해결 → 결과 (트러블슈팅 로그)

### 오류 ① `[RAG] PDF 파일을 찾을 수 없습니다`
- **증상**: 배포 컨테이너 로그에 PDF를 못 찾는다고 출력. 챗봇이 진단 근거 없이 답함.
- **원인**: Dockerfile이 `COPY app ./app`만 해서 컨테이너 안에 `config/PDF`가 존재하지 않음. (`ls: cannot access '/app/config': No such file or directory`로 확인)
- **해결**: Dockerfile에 `COPY config ./config` 추가.
- **결과**: 컨테이너 안 `/app/config/...pdf` 존재 → 로드 성공.

### 오류 ② 코드를 고쳤는데 배포에 반영이 안 됨 (`nothing to commit`인데 그대로)
- **원인**: 루트 `.gitignore`의 `**/*.yml` 패턴이 워크플로 파일(`deploy-ai.yml`)까지 무시 → 변경이 깃에 안 올라가 **AI 서버가 옛 이미지로 재배포**되고 있었음.
- **해결**: `.gitignore`에서 과도한 `**/*.yml`을 제거하고 `**/application.yml`처럼 **필요한 것만** 무시하도록 좁힘.
- **결과**: 워크플로/Dockerfile 변경이 정상 푸시 → 새 이미지로 재배포됨.

### 오류 ③ RAG는 떴는데 챗봇이 대답을 안 함
- **원인(추정·확인 중)**: 프론트→AI 라우팅(nginx `/ai` 프록시, AI 서버 사설 IP/방화벽) 문제. RAG 자체가 아니라 **네트워크 경로** 이슈.
- **조치**: 프론트 nginx 템플릿에 AI 서버 주소(`192.168.0.241:8001`) 직접 지정, 브라우저 Network 탭으로 `/ai` 호출 확인.
- **결과**: RAG 인덱싱은 정상(`벡터 DB 구축 완료 — 19개 청크`). 라우팅 점검으로 응답 경로 확보.

### ✅ 최종 성공 로그
```
[RAG] 벡터 DB 구축 완료 — 19개 청크 (성인병_5종_분류_및_진단수치_정리.pdf)
```

---

## 6. 고도화 방향 (다음 단계 아이디어)

1. **관련도 임계값(threshold) 추가**
   - 현재는 질문이 PDF와 무관해도 무조건 Top-3를 가져온다(노이즈).
   - `similarity_search_with_score`로 **점수가 일정 이상인 청크만** 사용 → 엉뚱한 근거 주입 방지.

2. **벡터 DB 디스크 영속화**
   - 현재는 매 기동마다 PDF를 다시 임베딩(OpenAI 호출 비용·시간).
   - `_vectorstore.save_local(path)` / `FAISS.load_local(path)`로 **한 번 만들고 재사용** → 기동 빠르고 비용 절감.

3. **지식베이스 확장**
   - PDF 1개 → 여러 문서(가이드라인, 약물 정보 등). 폴더 내 모든 PDF를 로드하도록 일반화.
   - 출처(파일명·페이지)를 답변에 **인용 표기**(metadata 활용)하면 신뢰도↑.

4. **하이브리드 검색**
   - 의미 검색(벡터) + 키워드 검색(BM25) 결합 → 숫자·전문용어(예: "126mg/dL") 검색 정확도 보완.

5. **`@app.on_event("startup")` → `lifespan`으로 교체**
   - 최신 FastAPI에서 `on_event`는 deprecated. `lifespan` 컨텍스트로 마이그레이션 권장.

6. **청크/모델 튜닝 실험**
   - `CHUNK_SIZE`, `TOP_K`를 바꿔가며 실제 질문 세트로 정확도 비교(평가셋 구축).

---

## 7. 스스로 점검용 질문 (이해도 체크)

- [ ] RAG의 두 단계(인덱싱 / 검색·생성)를 설명할 수 있는가?
- [ ] 임베딩이란 무엇이고, 왜 유사도 검색이 가능한가?
- [ ] `chunk_overlap`이 없으면 어떤 문제가 생기는가?
- [ ] `_vectorstore`를 전역에 둔 이유는?
- [ ] `retrieve()`가 빈 문자열을 반환하는 두 경우와, 그래도 서버가 안 죽는 이유는?
- [ ] RAG 컨텍스트가 LLM 프롬프트의 어느 위치에 어떻게 들어가는가?
- [ ] 배포 시 `COPY config`와 `OPENAI_API_KEY`가 빠지면 각각 어떤 증상이 나는가?

---

### 부록) 참고 — `app/llm_service.py`
이 파일은 RAG 파이프라인이 **아니다**. LangChain LCEL(`prompt | llm | parser`) 기본 동작을 익히려고 만든 **연습용 스크립트**(주제 한 문장 설명). RAG 개념(체인 구성)의 기초 감각을 잡는 용도로만 참고.
