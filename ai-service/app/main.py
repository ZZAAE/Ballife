from fastapi import FastAPI, File, UploadFile
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from langchain_openai import ChatOpenAI
from langchain_core.prompts import ChatPromptTemplate, MessagesPlaceholder
from langchain_core.output_parsers import StrOutputParser
from langchain_core.messages import HumanMessage, AIMessage, SystemMessage
from dotenv import load_dotenv
import httpx
import asyncio
import json
from collections import defaultdict
from datetime import date

from app.food_classifier import predict as predict_food, warmup as warmup_food_model

load_dotenv()

app = FastAPI()

SPRING_API = "http://localhost:8080"

# React 개발서버(포트 5173)에서 오는 요청 허용
# cd ai-service

# pip install virtualenv 최초 1회
# virtualenv .venv

# .venv\Scripts\activate
# pip install -r requirements.txt
# uvicorn app.main:app --reload --port 8001 로 실행
# deactivate
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
    allow_methods=["*"],
    allow_headers=["*"],
)

llm = ChatOpenAI(model="gpt-4o-mini")

# 사용자별 대화 히스토리 (서버 메모리, 최근 10턴 유지)
conversation_histories: dict[int, list] = defaultdict(list)
MAX_HISTORY = 5  # LLM 문맥용 — 메시지 개수 기준 (HumanMessage + AIMessage 합산)

# 화면 표시용 기록 (LLM 문맥과 분리, 토큰 영향 없이 더 길게 보관)
# {"role": "user"|"assistant", "content": str} 형태로 저장
display_histories: dict[int, list] = defaultdict(list)
MAX_DISPLAY = 40  # 메시지 개수 기준 (약 20턴)

SYSTEM_PROMPT = """당신은 Ballife의 건강 AI 비서 'Ball'입니다.
사용자의 최근 건강 데이터 요약이 매 질문과 함께 제공됩니다. 이를 바탕으로 개인화된 조언을 제공하세요.

[데이터 해석 규칙]
- 건강 데이터가 있으면 반드시 해당 수치를 언급하며 답변
- 데이터가 없는 항목은 "기록이 없습니다"라고 말하지 말고, 일반적인 조언만 제공
- 정상 범위를 벗어난 수치는 주의를 권고하되 과도한 불안감 조성 금지
- 며칠치 데이터가 있으면 추세를 분석해 언급

[역할]
- 혈당, 혈압, 체중, 식단, 운동, 수분섭취 관련 질문에 답변
- 의학적 진단은 불가, 전문의 상담 권유

[Ballife 서비스 정보]
- 식단 기록: 사진으로 자동 분석 가능
- 혈압/혈당 측정값 기록 및 그래프 제공
- 운동 루틴 등록 가능

[답변 규칙]
- 항상 한국어로 답변
- 2~4문장으로 간결하게
- 이모지 사용 금지
- 수치를 언급할 때는 단위를 반드시 명시 (mg/dL, mmHg, kcal 등)
- 이전 대화 내용을 기억하고 일관성 있게 답변
- 사용자가 같은 질문을 반복하면 다른 각도로 설명
- 적절하게 줄바꿈을 통해 가독성 증가
- 사용자 데이터를 종합적으로 분석하여 조언 제공

[금지 사항]
- 특정 약물명, 처방, 복용량 추천 금지
- "확실합니다", "반드시" 같은 단정적 표현 금지
- 근거 없는 민간요법이나 보조식품 추천 금지
- 사용자의 건강 데이터를 제3자와 공유하는 것처럼 표현 금지

[대화 스타일]
- 첫 인사는 1회만, 이후 반복 금지
- 질문이 모호하면 한 가지만 되물어보기
- 답변 후 관련 후속 행동 1가지 제안 (예: "오늘 식단을 기록해보세요")
- 사용자가 걱정이나 불안을 표현하면 공감 한 문장 먼저

[목표 연계]
- 사용자의 건강 데이터 추세가 개선되고 있으면 긍정적 피드백 제공
- 식단/운동/혈당/혈압 기록이 없는 날이 보이면 기록을 권유
- Ballife 기능(식단 사진 분석, 그래프 등)을 자연스럽게 활용 유도
"""

# AI 건강 분석 카드용 프롬프트 (대화가 아닌 단건 분석)
ANALYSIS_PROMPT = """당신은 Ballife의 건강 데이터 분석가 'Ball'입니다.
사용자의 특정 건강 지표 데이터를 보고 핵심 인사이트를 간결하게 제공합니다.

[분석 규칙]
- 항상 한국어, 3~4문장, 이모지 사용 금지
- 추세(증가/감소/안정)를 가장 먼저 언급
- 수치는 반드시 단위와 함께 표기 (kg, mmHg, mg/dL 등)
- 정상 범위를 벗어난 값은 주의를 권고하되 과도한 불안 조성 금지
- 의학적 진단·특정 약물 추천 금지, 필요 시 전문의 상담 권유
- 데이터가 비어 있거나 부족하면 꾸준한 기록을 권유
- 마지막 문장에 실천 가능한 조언 1가지 제안

[출력 형식]
- 한 문장이 끝나면 줄바꿈(\\n)2번 하여 한 줄에 한 문장씩 작성 (가독성)
- 문장이 길면 의미 단위로 한 번 더 줄바꿈"""

prompt = ChatPromptTemplate.from_messages([
    ("system", SYSTEM_PROMPT),
    MessagesPlaceholder(variable_name="history"),
    ("human", """[사용자 건강 데이터 요약]
{health_data}

[질문]
{message}"""),
])

chain = prompt | llm | StrOutputParser()

class ChatRequest(BaseModel):
    message: str = ""
    userId: int
    token: str | None = None
    image: str | None = None  # 첨부 이미지 data URL (data:image/...;base64,...)
    date: str | None = None   # 조회할 식단 날짜 (YYYY-MM-DD). 미지정 시 오늘 하루치만 조회

class AnalyzeRequest(BaseModel):
    userId: int
    metric: str = ""          # "weight" | "bloodPressure" | "bloodSugar"
    data: dict = {}           # 페이지가 계산한 요약/추세 데이터
    token: str | None = None
    
def _safe_json(result):
    # 예외(네트워크 오류 등)이거나 2xx 가 아니거나 JSON 파싱 실패 시 빈 dict 반환
    if isinstance(result, Exception) or result.status_code >= 400:
        return {}
    try:
        return result.json()
    except ValueError:
        return {}

async def fetch_user_health_data(user_id: int, token: str | None, target_date: date) -> dict:
    headers = {"Authorization": f"Bearer {token}"} if token else {}
    async with httpx.AsyncClient() as client:
        results = await asyncio.gather(
            client.get(f"{SPRING_API}/api/bioValueRecords/search/{user_id}", headers=headers),
            # 식단은 요청한 날 하루치만 조회 (Meal 단위)
            client.get(f"{SPRING_API}/api/meal/today",
                       params={"userId": user_id, "date": target_date.isoformat()}, headers=headers),
            client.get(f"{SPRING_API}/api/users/{user_id}", headers=headers),
            return_exceptions=True
        )
        bio = _safe_json(results[0])
        meals = _safe_json(results[1])
        user = _safe_json(results[2])

        # 하루치 각 Meal 의 음식 항목(MealItem)을 Meal 단위로 병렬 조회해 붙임
        meals = meals if isinstance(meals, list) else []
        meals_with_id = [m for m in meals if isinstance(m, dict) and m.get("mealId") is not None]
        item_results = await asyncio.gather(
            *[client.get(f"{SPRING_API}/api/mealItem/byMeal/{m['mealId']}", headers=headers)
              for m in meals_with_id],
            return_exceptions=True
        )
        for m, res in zip(meals_with_id, item_results):
            items = _safe_json(res)
            m["items"] = items if isinstance(items, list) else []

    return {
        "bio": bio,
        "meals": meals,
        "user": user,
    }


RECENT_DAYS = 14  # AI 에게 전달할 건강 데이터 기간 (최근 N일만 요약)


def _to_date(value):
    # "2026-05-20" / "2026-05-20T..." / None → date 또는 None
    if not value:
        return None
    try:
        return date.fromisoformat(str(value)[:10])
    except ValueError:
        return None


def _fmt(n):
    # 정수면 정수로, 실수면 소수 1자리까지만
    if isinstance(n, float) and not n.is_integer():
        return f"{n:.1f}"
    if isinstance(n, (int, float)):
        return str(int(n))
    return str(n)


def _age(birth):
    d = _to_date(birth)
    if not d:
        return None
    today = date.today()
    return today.year - d.year - ((today.month, today.day) < (d.month, d.day))


def _summarize_metric(records, field, label, unit):
    # 해당 수치가 있는 기록만 모아 최근값/평균/최소/최대 요약 (한 줄)
    points = []
    for r in records:
        v = r.get(field)
        d = _to_date(r.get("recordDate"))
        if v is None or d is None:
            continue
        points.append((d, v))
    if not points:
        return None
    points.sort(key=lambda x: x[0])
    values = [v for _, v in points]
    latest_date, latest_val = points[-1]
    avg = round(sum(values) / len(values), 1)
    return (
        f"- {label}: 최근값 {_fmt(latest_val)}{unit}({latest_date}), "
        f"평균 {_fmt(avg)}{unit}, 최소 {_fmt(min(values))}{unit}, 최대 {_fmt(max(values))}{unit} ({len(values)}건)"
    )


def _recent(records, date_field):
    # 최근 RECENT_DAYS 일 이내 기록만 (dict 가 아닌 항목/잘못된 날짜는 제외)
    cutoff = date.today().toordinal() - RECENT_DAYS
    out = []
    for r in records or []:
        if not isinstance(r, dict):
            continue
        d = _to_date(r.get(date_field))
        if d and d.toordinal() >= cutoff:
            out.append(r)
    return out


# Meal.MealCategory(enum) → 한글 표기
MEAL_CATEGORY_KR = {
    "BREAKFAST": "아침",
    "LUNCH": "점심",
    "DINNER": "저녁",
    "SNACK": "간식",
}


def _summarize_day_meals(meals, target_date) -> list[str]:
    """요청한 날 하루치 식단을 Meal 단위로(각 끼니의 음식 항목 포함) 요약."""
    meals = [m for m in (meals or []) if isinstance(m, dict)]
    if not meals:
        return [f"[{target_date} 식단] 기록 없음"]

    # 끼니 시간순 정렬 (시간 없는 항목은 뒤로)
    meals.sort(key=lambda m: str(m.get("mealTime") or "99:99"))

    day_cal = 0
    day_carb = day_sugar = day_sodium = day_protein = 0.0
    meal_lines = []
    for m in meals:
        cat = MEAL_CATEGORY_KR.get(str(m.get("mealCategory")), str(m.get("mealCategory") or "기타"))
        time_str = str(m.get("mealTime") or "")[:5]
        head = f"- {cat}" + (f"({time_str})" if time_str else "")

        items = [it for it in (m.get("items") or []) if isinstance(it, dict)]
        if not items:
            meal_lines.append(f"{head}: 등록된 음식 없음")
            continue

        food_parts = []
        meal_cal = 0
        for it in items:
            name = it.get("foodName") or "음식"
            grams = it.get("grams")
            cal = it.get("calorie")
            seg = name
            if grams:
                seg += f" {_fmt(grams)}g"
            if cal is not None:
                seg += f" {_fmt(cal)}kcal"
                meal_cal += cal
            food_parts.append(seg)
            day_carb += it.get("carbohydrate") or 0
            day_sugar += it.get("sugar") or 0
            day_sodium += it.get("sodium") or 0
            day_protein += it.get("protein") or 0
        day_cal += meal_cal
        meal_lines.append(f"{head}: " + ", ".join(food_parts) + f" (끼니 합계 {_fmt(meal_cal)}kcal)")

    header = (
        f"[{target_date} 식단] 총 {_fmt(day_cal)}kcal "
        f"(탄수화물 {_fmt(day_carb)}g, 당 {_fmt(day_sugar)}g, "
        f"단백질 {_fmt(day_protein)}g, 나트륨 {_fmt(day_sodium)}mg)"
    )
    return [header, *meal_lines]


def summarize_health_data(raw: dict, target_date: date) -> str:
    """전체 원시 데이터를 최근 RECENT_DAYS 일 요약 텍스트로 압축 (프롬프트 토큰 절감).
    식단은 요청한 날(target_date) 하루치만 Meal 단위로 상세 요약."""
    lines = []

    # 1) 기본 정보
    user = raw.get("user") or {}
    if isinstance(user, dict) and user:
        parts = []
        age = _age(user.get("birthDate"))
        if age is not None:
            parts.append(f"{age}세")
        if user.get("gender"):
            parts.append(str(user.get("gender")))
        if user.get("height"):
            parts.append(f"키 {_fmt(user.get('height'))}cm")
        if user.get("weight"):
            parts.append(f"체중 {_fmt(user.get('weight'))}kg")
        if user.get("diseaseIndex"):
            parts.append(f"질환 {user.get('diseaseIndex')}")
        if parts:
            lines.append("[기본 정보] " + ", ".join(parts))

    # 2) 생체 수치 (최근 N일)
    bio_recent = _recent(raw.get("bio"), "recordDate")
    metric_specs = [
        ("bloodSugar", "혈당", "mg/dL"),
        ("systolicBP", "수축기혈압", "mmHg"),
        ("diastolicBP", "이완기혈압", "mmHg"),
        ("weight", "체중", "kg"),
        ("waterIntakeCup", "수분섭취", "컵"),
    ]
    metric_lines = [
        line for field, label, unit in metric_specs
        if (line := _summarize_metric(bio_recent, field, label, unit))
    ]
    if metric_lines:
        lines.append(f"[최근 {RECENT_DAYS}일 생체 수치]")
        lines.extend(metric_lines)
    else:
        lines.append(f"[최근 {RECENT_DAYS}일 생체 수치] 기록 없음")

    # 3) 식단 — 요청한 날 하루치만 Meal 단위로 음식 항목까지 상세 요약
    lines.extend(_summarize_day_meals(raw.get("meals"), target_date))

    return "\n".join(lines) if lines else "기록된 건강 데이터가 없습니다."


@app.post("/chat")
async def chat(req: ChatRequest):
    # 식단 조회 날짜: 요청에 date 가 있으면 그 날, 없으면 오늘 하루치
    target_date = _to_date(req.date) or date.today()
    raw = await fetch_user_health_data(req.userId, req.token, target_date)
    health_summary = summarize_health_data(raw, target_date)

    history = conversation_histories[req.userId]

    # 사용자가 텍스트 없이 이미지만 보낸 경우 기본 질문을 채움
    user_text = req.message.strip()
    if req.image and not user_text:
        user_text = "이 사진을 분석해 주세요."

    if req.image:
        # 비전: 텍스트 + 이미지로 멀티모달 human 메시지 구성 후 LLM 직접 호출
        text_block = f"[사용자 건강 데이터 요약]\n{health_summary}\n\n[질문]\n{user_text}"
        human_message = HumanMessage(content=[
            {"type": "text", "text": text_block},
            {"type": "image_url", "image_url": {"url": req.image}},
        ])
        messages = [SystemMessage(content=SYSTEM_PROMPT), *history, human_message]
        response = await llm.ainvoke(messages)
        result = response.content
    else:
        result = await chain.ainvoke({
            "health_data": health_summary,
            "history": history,
            "message": user_text,
        })

    # LLM 문맥/표시용 기록에는 텍스트만 저장 (이미지는 재전송 비용 때문에 누적하지 않음)
    history_text = f"[사진] {user_text}" if req.image else user_text

    # LLM 문맥 히스토리에 추가 후 MAX_HISTORY 초과분 제거
    history.append(HumanMessage(content=history_text))
    history.append(AIMessage(content=result))
    if len(history) > MAX_HISTORY:
        conversation_histories[req.userId] = history[-MAX_HISTORY:]

    # 화면 표시용 기록에도 추가 후 MAX_DISPLAY 초과분 제거
    display = display_histories[req.userId]
    display.append({"role": "user", "content": history_text})
    display.append({"role": "assistant", "content": result})
    if len(display) > MAX_DISPLAY:
        display_histories[req.userId] = display[-MAX_DISPLAY:]

    return {"reply": result}


METRIC_LABELS = {
    "weight": "체중(kg)",
    "bloodPressure": "혈압(mmHg, 수축기/이완기)",
    "bloodSugar": "혈당(mg/dL)",
}


@app.post("/analyze")
async def analyze(req: AnalyzeRequest):
    # 건강 기록 페이지(체중/혈압/혈당)의 요약 데이터를 받아 단건 AI 분석 생성
    data = dict(req.data or {})

    # 추세 배열이 너무 길면 최근 항목만 사용 (토큰 절감)
    trend = data.get("trend")
    if isinstance(trend, list) and len(trend) > 60:
        data["trend"] = trend[-60:]

    label = METRIC_LABELS.get(req.metric, req.metric or "건강 지표")
    text = (
        f"[분석 지표] {label}\n"
        f"[데이터(JSON)]\n{json.dumps(data, ensure_ascii=False)}"
    )

    response = await llm.ainvoke([
        SystemMessage(content=ANALYSIS_PROMPT),
        HumanMessage(content=text),
    ])
    return {"analysis": response.content}


@app.get("/chat/history/{user_id}")
async def get_history(user_id: int):
    # 모달 열 때 이전 대화 복원용 — 화면 표시용 기록 반환
    return {"messages": display_histories.get(user_id, [])}


@app.delete("/chat/history/{user_id}")
async def clear_history(user_id: int):
    conversation_histories.pop(user_id, None)
    display_histories.pop(user_id, None)
    return {"ok": True}


# ─────────────────────────────────────────────────────────────
# 음식 사진 → 자체 YOLO 모델 분류 (Spring이 1차로 호출)
# 모델이 확신하면 known=True + 음식명 반환, 모르면 known=False (Spring이 OpenAI로 폴백)
# ─────────────────────────────────────────────────────────────
@app.post("/predict-food")
async def predict_food_endpoint(file: UploadFile = File(...)):
    image_bytes = await file.read()
    try:
        # YOLO 추론은 CPU 바운드라 별도 스레드에서 실행 (이벤트 루프 비차단)
        return await asyncio.to_thread(predict_food, image_bytes)
    except Exception as e:  # noqa: BLE001 - 어떤 실패든 known=False 로 폴백 유도
        return {"known": False, "food": None, "confidence": 0.0, "candidates": [], "error": str(e)}


@app.on_event("startup")
async def _warmup_model():
    # 서버 기동 시 모델을 백그라운드로 미리 로드 (첫 요청 지연 제거). 실패해도 서버는 정상 기동.
    asyncio.create_task(asyncio.to_thread(warmup_food_model))