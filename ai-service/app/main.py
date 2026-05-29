from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from langchain_openai import ChatOpenAI
from langchain_core.prompts import ChatPromptTemplate
from langchain_core.output_parsers import StrOutputParser
from dotenv import load_dotenv
import httpx
import asyncio

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

prompt = ChatPromptTemplate.from_messages([
    ("system", """당신은 Ballife의 건강 AI 비서 'Ball'입니다.
아래는 사용자의 최근 건강 데이터입니다. 이를 바탕으로 개인화된 조언을 제공하세요.

[사용자 건강 데이터]
{health_data}

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
"""),
    ("human", "{message}"),
])

chain = prompt | llm | StrOutputParser()

class ChatRequest(BaseModel):
    message: str
    userId: int
    
    async def fetch_user_health_data(user_id: int) -> dict:
        async with httpx.AsyncClient() as client:
        # 필요한 데이터만 선택적으로 호출
            results = await asyncio.gather(
                client.get(f"{SPRING_API}/api/users/{user_id}/bio-values/recent"),
                client.get(f"{SPRING_API}/api/users/{user_id}/meals/today"),
                client.get(f"{SPRING_API}/api/users/{user_id}/exercise/recent"),
                return_exceptions=True
        )
        return {
            "bio": results[0].json() if not isinstance(results[0], Exception) else {},
            "meals": results[1].json() if not isinstance(results[1], Exception) else {},
            "exercise": results[2].json() if not isinstance(results[2], Exception) else {},
        }

@app.post("/chat")
async def chat(req: ChatRequest):
    health_data = await fetch_user_health_data(req.userId)

    personalized_prompt = ChatPromptTemplate.from_messages([
        ("system", """당신은 Ballife의 건강 AI 비서 'Ball'입니다.
아래는 사용자의 최근 건강 데이터입니다. 이를 바탕으로 개인화된 조언을 제공하세요.

[사용자 건강 데이터]
{health_data}

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
"""),
        ("human", "{message}"),
    ])

    chain = personalized_prompt | llm | StrOutputParser()
    result = await chain.ainvoke({
        "health_data": str(health_data),
        "message": req.message,
    })
    return {"reply": result}