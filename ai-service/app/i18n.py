"""AI 서비스 다국어 헬퍼.

프론트가 요청 body 의 lang ("ko"/"en"/"ja"/"zh-CN") 으로 응답 언어를 지정한다.
핵심은 LLM 출력 언어를 프롬프트로 강제하는 것. (건강 데이터 요약의 내부 한글 라벨은
LLM 입력 컨텍스트일 뿐이라 그대로 두어도 LLM 이 목표 언어로 답변한다.)
"""

DEFAULT_LANG = "ko"
SUPPORTED_LANGS = ("ko", "en", "ja", "zh-CN")

# LLM 에게 지시할 때 쓰는 언어 표기
LANGUAGE_NAMES = {
    "ko": "한국어 (Korean)",
    "en": "English",
    "ja": "日本語 (Japanese)",
    "zh-CN": "简体中文 (Simplified Chinese)",
}

# 텍스트 없이 이미지만 보낸 경우의 기본 질문
IMAGE_DEFAULT_QUESTION = {
    "ko": "이 사진을 분석해 주세요.",
    "en": "Please analyze this photo.",
    "ja": "この写真を分析してください。",
    "zh-CN": "请分析这张照片。",
}

# LLM 응답 실패 시 폴백 문구
NO_REPLY = {
    "ko": "응답을 받지 못했어요.",
    "en": "Sorry, I couldn't get a response.",
    "ja": "応答を取得できませんでした。",
    "zh-CN": "未能获取回复。",
}


def normalize_lang(lang: str | None) -> str:
    if not lang:
        return DEFAULT_LANG
    if lang in SUPPORTED_LANGS:
        return lang
    # "zh", "zh-Hans", "en-US" 등 region 변형 매칭
    base = lang.split("-")[0].lower()
    if base == "zh":
        return "zh-CN"
    for code in SUPPORTED_LANGS:
        if code.split("-")[0].lower() == base:
            return code
    return DEFAULT_LANG


def language_directive(lang: str) -> str:
    """비한국어 요청 시 시스템 프롬프트 끝에 붙일 출력 언어 강제 지시."""
    lang = normalize_lang(lang)
    if lang == "ko":
        return ""
    name = LANGUAGE_NAMES.get(lang, "English")
    return (
        f"\n\n[LANGUAGE OVERRIDE — HIGHEST PRIORITY]\n"
        f"Disregard any earlier rule that says to always answer in Korean (\"항상 한국어로 답변\").\n"
        f"You MUST write the ENTIRE response in {name} only. Do not mix languages.\n"
        f"Keep medical terminology accurate and natural for {name} readers, "
        f"and keep all measurement units (mg/dL, mmHg, kcal, kg) unchanged."
    )


def image_default_question(lang: str) -> str:
    return IMAGE_DEFAULT_QUESTION.get(normalize_lang(lang), IMAGE_DEFAULT_QUESTION["ko"])


def no_reply(lang: str) -> str:
    return NO_REPLY.get(normalize_lang(lang), NO_REPLY["ko"])
