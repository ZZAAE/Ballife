from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from langchain_openai import ChatOpenAI
from langchain_core.prompts import ChatPromptTemplate, MessagesPlaceholder
from langchain_core.output_parsers import StrOutputParser
from langchain_core.messages import HumanMessage, AIMessage
from dotenv import load_dotenv
import httpx
import asyncio
from collections import defaultdict

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
    allow_methods=["POST"],
    allow_headers=["*"],
)

llm = ChatOpenAI(model="gpt-4o-mini")

# 사용자별 대화 히스토리 (서버 메모리, 최근 10턴 유지)
conversation_histories: dict[int, list] = defaultdict(list)
MAX_HISTORY = 5  # 메시지 개수 기준 (HumanMessage + AIMessage 합산)

prompt = ChatPromptTemplate.from_messages([
    ("system", """당신은 Ballife의 건강 AI 비서 'Ball'입니다.
아래는 사용자의 최근 건강 데이터입니다. 이를 바탕으로 개인화된 조언을 제공하세요.

[사용자 건강 데이터]
{health_data}

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
"""),
    MessagesPlaceholder(variable_name="history"),
    ("human", "{message}"),
])

chain = prompt | llm | StrOutputParser()

class ChatRequest(BaseModel):
    message: str
    userId: int
    token: str | None = None
    
async def fetch_user_health_data(user_id: int, token: str | None) -> dict:
    headers = {"Authorization": f"Bearer {token}"} if token else {}
    async with httpx.AsyncClient() as client:
        results = await asyncio.gather(
            client.get(f"{SPRING_API}/api/bioValueRecords/search/{user_id}", headers=headers),
            client.get(f"{SPRING_API}/api/meal/list?userId={user_id}", headers=headers),
            return_exceptions=True
        )
    return {
        "bio": results[0].json() if not isinstance(results[0], Exception) else {},
        "meals": results[1].json() if not isinstance(results[1], Exception) else {},
    }

@app.post("/chat")
async def chat(req: ChatRequest):
    health_data = await fetch_user_health_data(req.userId, req.token)

    history = conversation_histories[req.userId]

    chain = prompt | llm | StrOutputParser()
    result = await chain.ainvoke({
        "health_data": str(health_data),
        "history": history,
        "message": req.message,
    })

    # 히스토리에 이번 대화 추가 후 MAX_HISTORY 초과분 제거
    history.append(HumanMessage(content=req.message))
    history.append(AIMessage(content=result))
    if len(history) > MAX_HISTORY:
        conversation_histories[req.userId] = history[-MAX_HISTORY:]

    return {"reply": result}


@app.delete("/chat/history/{user_id}")
async def clear_history(user_id: int):
    conversation_histories.pop(user_id, None)
    return {"ok": True}