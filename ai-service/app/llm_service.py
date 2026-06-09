from dotenv import load_dotenv
import os

from langchain_openai import ChatOpenAI
from langchain_core.prompts import PromptTemplate # 문자열 템플릿 기반으로 프롬프트를 자동 구성해주는 유틸
from langchain_core.output_parsers import StrOutputParser

load_dotenv()
api_key=os.getenv("OPENAI_API_KEY")

# LCEL 방식: 파이프라인 형태로 선언
llm=ChatOpenAI(model="gpt-4o-mini")
prompt=PromptTemplate.from_template("'{topic}' 주제에 대해 한 문장으로 설명해줘.")
output_str=StrOutputParser()# 결과 객체에서 텍스트(content)만 깔끔하게 추출해 문자열로 변환함

# LCEL 표현 (프롬프트 → LLM → 출력)
chain=prompt|llm|output_str

# chain.invoke() 는 전체 파이프라인을 한 번 실행하는 메서드
result=chain.invoke({"topic":"LangChain"})
print(result)