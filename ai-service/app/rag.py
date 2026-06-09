"""RAG 모듈 — 성인병 진단수치 PDF 기반 지식 검색

서버 시작 시 PDF를 로드 → 청크 분할 → 임베딩 → FAISS 인메모리 벡터 DB 구축
chat 엔드포인트에서 retrieve(query) 호출 → 유사 청크 텍스트 반환
"""

from pathlib import Path
from langchain_community.document_loaders import PyPDFLoader
from langchain.text_splitter import RecursiveCharacterTextSplitter
from langchain_openai import OpenAIEmbeddings
from langchain_community.vectorstores import FAISS

PDF_PATH = Path(__file__).parent.parent / "config" / "성인병_5종_분류_및_진단수치_정리.pdf"

TOP_K = 3          # 검색 시 반환할 청크 수
CHUNK_SIZE = 500   # 청크 최대 글자 수
CHUNK_OVERLAP = 80 # 청크 간 겹침 글자 수

_vectorstore: FAISS | None = None


def build_vectorstore() -> None:
    """서버 시작 시 1회 실행 — PDF 로드 → 임베딩 → 인메모리 FAISS 저장."""
    global _vectorstore

    if not PDF_PATH.exists():
        print(f"[RAG] PDF 파일을 찾을 수 없습니다: {PDF_PATH}")
        return

    loader = PyPDFLoader(str(PDF_PATH))
    docs = loader.load()

    splitter = RecursiveCharacterTextSplitter(
        chunk_size=CHUNK_SIZE,
        chunk_overlap=CHUNK_OVERLAP,
    )
    chunks = splitter.split_documents(docs)

    embeddings = OpenAIEmbeddings(model="text-embedding-3-small")
    _vectorstore = FAISS.from_documents(chunks, embeddings)

    print(f"[RAG] 벡터 DB 구축 완료 — {len(chunks)}개 청크 ({PDF_PATH.name})")


def retrieve(query: str) -> str:
    """질문과 유사한 PDF 청크를 검색해 단일 텍스트로 반환.
    벡터 DB 미초기화 또는 결과 없으면 빈 문자열 반환."""
    if _vectorstore is None:
        return ""

    results = _vectorstore.similarity_search(query, k=TOP_K)
    if not results:
        return ""

    return "\n\n".join(doc.page_content for doc in results)
