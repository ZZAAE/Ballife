# ============================================================
# Ballife AI 서비스(FastAPI + 자체 YOLO 음식 분류) 이미지
# 빌드 컨텍스트는 ai-service/ 디렉터리 기준.
# ============================================================
FROM python:3.11-slim AS runtime
WORKDIR /app

# OpenCV(ultralytics 의존) 가 필요로 하는 런타임 라이브러리
RUN apt-get update && apt-get install -y --no-install-recommends \
        libgl1 libglib2.0-0 \
    && rm -rf /var/lib/apt/lists/*

ENV PIP_NO_CACHE_DIR=1 \
    PYTHONUNBUFFERED=1 \
    PYTHONDONTWRITEBYTECODE=1

# torch 는 CPU 휠로 먼저 설치 → 불필요한 CUDA 의존(수 GB) 회피.
# 이후 requirements 의 ultralytics 가 이미 설치된 torch 를 그대로 사용.
RUN pip install torch torchvision --index-url https://download.pytorch.org/whl/cpu

COPY requirements.txt ./
RUN pip install -r requirements.txt

# 앱 소스만 복사 (모델 best.pt 는 용량이 커서 이미지에 안 굽고 런타임 볼륨으로 마운트)
COPY app ./app

# RAG 지식베이스 PDF (config/ → /app/config). rag.py 가 /app/config/*.pdf 를 로드.
COPY config ./config

# food_classifier 가 읽는 모델 경로. AI 서버 compose 에서 ./model 을 /app/model 로 마운트하고
# 그 안에 best.pt 를 둔다. 모델이 없으면 YOLO 로드 실패 → OpenAI 폴백(서비스는 정상 기동).
ENV FOOD_MODEL_PATH=/app/model/best.pt
ENV FOOD_MODEL_DEVICE=cpu

EXPOSE 8001
CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8001"]
