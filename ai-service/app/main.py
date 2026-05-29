from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from langchain_openai import ChatOpenAI
from langchain_core.prompts import ChatPromptTemplate
from langchain_core.output_parsers import StrOutputParser
from dotenv import load_dotenv

load_dotenv()

app = FastAPI()

# React 개발서버(포트 5173)에서 오는 요청 허용

# cd ai-service
# 환경 설정이 안되어 있으면
# pip install virtualenv
# virtualenv .venv
# ===============
# .venv\Scripts\activate
# pip install -r requirements.txt
# uvicorn app.main:app --reload --port 8001 로 실행
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
    allow_methods=["POST"],
    allow_headers=["*"],
)

llm = ChatOpenAI(model="gpt-4o-mini")

prompt = ChatPromptTemplate.from_messages([
    ("system", "당신은 Ballife의 친근한 건강 AI 비서 'Ball'입니다. 한국어로 답변하세요."),
    ("human", "{message}"),
])

chain = prompt | llm | StrOutputParser()

class ChatRequest(BaseModel):
    message: str

@app.post("/chat")
async def chat(req: ChatRequest):
    result = await chain.ainvoke({"message": req.message})
    return {"reply": result}