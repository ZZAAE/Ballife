"""음식 사진 → YOLO 분류 (추론 전용).

이 모듈은 '음식이 무엇인지'만 판단한다. 영양성분 조회는 Spring 백엔드
(FoodNutritionService + 식약처 + MongoDB 캐시)가 담당하므로 여기서는 하지 않는다.

Spring이 호출하는 단일 진입점은 predict(image_bytes) 이다:
    result = predict(image_bytes)
    # {"known": bool, "food": str|None, "confidence": float, "candidates": [...]}

known=False 이면 Spring이 OpenAI Vision 으로 폴백한다.
모델 로드 실패 등 어떤 예외가 나도 known=False 로 떨어지므로 무중단이다.
"""
import io
import os
import threading

# ─────────────────────────────────────────────────────────────
# 설정 (환경변수로 덮어쓰기 가능)
# ─────────────────────────────────────────────────────────────
_MODEL_DIR = os.path.join(os.path.dirname(__file__), "model")
DEFAULT_WEIGHTS = os.path.join(_MODEL_DIR, "best.pt")

FOOD_MODEL_PATH = os.getenv("FOOD_MODEL_PATH", DEFAULT_WEIGHTS)
FOOD_MODEL_DEVICE = os.getenv("FOOD_MODEL_DEVICE", "cpu")  # 웹 서버는 보통 cpu, GPU 있으면 "0"
# 최상위 후보의 신뢰도가 이 값 미만이면 "모름"(known=False) → Spring이 OpenAI로 폴백
FOOD_CONFIDENCE_THRESHOLD = float(os.getenv("FOOD_CONFIDENCE_THRESHOLD", "0.55"))

# ─────────────────────────────────────────────────────────────
# 클래스명 보정 (food_config.py 의 추론 관련 부분만 가져옴)
# ─────────────────────────────────────────────────────────────
# 예측 클래스명을 대표 이름으로 통합 (철자/순서만 다른 진짜 중복 정리, 재학습 불필요)
MERGE_MAP = {
    "파프리카노랑": "노랑파프리카",      # 단어 순서만 다름
    "마르게리따피자": "마르게리타피자",   # 철자만 다름
    "후라이드치킨,날개": "후라이드치킨",  # 쉼표 표기 정리
}

# 모델 클래스명 ↔ 식약처(Spring) 검색어가 다를 때 교정.
# 비어 있으면 클래스명을 그대로 Spring에 넘겨 식약처에서 검색한다.
# 학습 클래스가 식약처 명칭과 안 맞는 음식이 나오면 여기에 추가하면 된다.
#   예) "된장국": "된장찌개"
CLASS_NAME_MAP = {}

# ─────────────────────────────────────────────────────────────
# 모델 로드 (최초 1회, 스레드 안전)
# ─────────────────────────────────────────────────────────────
_model = None
_model_lock = threading.Lock()
_load_error = None


def _get_model():
    """best.pt 를 1회만 로드해 재사용. 로드 실패 시 None (이후 재시도 안 함)."""
    global _model, _load_error
    if _model is not None or _load_error is not None:
        return _model
    with _model_lock:
        if _model is None and _load_error is None:
            try:
                from ultralytics import YOLO  # 무거운 import 라 함수 안에서 지연 로드
                _model = YOLO(FOOD_MODEL_PATH)
            except Exception as e:  # noqa: BLE001 - 어떤 실패든 폴백으로 넘김
                _load_error = e
    return _model


def warmup():
    """서버 기동 시 미리 모델을 로드해 첫 요청 지연을 없앤다. 실패해도 무시."""
    return _get_model() is not None


def classify(image_bytes, topk=3):
    """이미지 바이트 → 상위 topk 후보 [(food, confidence), ...]. 실패 시 빈 리스트."""
    model = _get_model()
    if model is None:
        return []

    from PIL import Image  # ultralytics 의존성이라 항상 사용 가능
    image = Image.open(io.BytesIO(image_bytes)).convert("RGB")

    r = model.predict(image, device=FOOD_MODEL_DEVICE, verbose=False)[0]
    names = r.names          # {idx: 클래스명}
    probs = r.probs          # 분류 확률
    out = []
    for i in probs.top5[:topk]:
        raw = names[i]
        name = MERGE_MAP.get(raw, raw)        # 1) 대표 이름으로 통합
        name = CLASS_NAME_MAP.get(name, name)  # 2) 식약처 검색어로 교정
        out.append((name, float(probs.data[i])))
    return out


def predict(image_bytes, topk=3):
    """Spring이 호출하는 단일 진입점. 분류 + known 판정.

    반환: {"known", "food", "confidence", "candidates"}
      - known=True  : 최상위 후보 신뢰도 ≥ FOOD_CONFIDENCE_THRESHOLD
      - known=False : 모델이 확신 못 함 → Spring이 OpenAI Vision 으로 폴백
    """
    candidates = classify(image_bytes, topk=topk)
    if not candidates:
        return {"known": False, "food": None, "confidence": 0.0, "candidates": []}

    best_food, best_conf = candidates[0]
    return {
        "known": best_conf >= FOOD_CONFIDENCE_THRESHOLD,
        "food": best_food,
        "confidence": best_conf,
        
    }
