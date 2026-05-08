import { useState, useRef, useEffect } from "react";

export default function BallChatbot() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([]); // {role: 'user'|'assistant', content, time}
  const [input, setInput] = useState("");
  const [isWaiting, setIsWaiting] = useState(false);

  const chatBodyRef = useRef(null);
  const textareaRef = useRef(null);
  const inputRef = useRef(null);

  /* ---------- Auto-scroll to bottom on new message ---------- */
  useEffect(() => {
    if (chatBodyRef.current) {
      chatBodyRef.current.scrollTop = chatBodyRef.current.scrollHeight;
    }
  }, [messages, isWaiting]);

  /* ---------- Auto-focus when modal opens ---------- */
  useEffect(() => {
    if (isOpen) {
      const t = setTimeout(() => inputRef.current?.focus(), 200);
      return () => clearTimeout(t);
    }
  }, [isOpen]);

  /* ---------- ESC to close ---------- */
  useEffect(() => {
    function onKey(e) {
      if (e.key === "Escape" && isOpen) setIsOpen(false);
    }
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [isOpen]);

  /* ---------- Auto-resize textarea ---------- */
  function handleInputChange(e) {
    setInput(e.target.value);
    const ta = textareaRef.current;
    if (ta) {
      ta.style.height = "auto";
      ta.style.height = Math.min(ta.scrollHeight, 120) + "px";
    }
  }

  function handleKeyDown(e) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      send();
    }
  }

  function nowTime() {
    const d = new Date();
    return `${d.getHours()}:${String(d.getMinutes()).padStart(2, "0")}`;
  }

  /* ---------- Send to Claude API ---------- */
  async function send() {
    const text = input.trim();
    if (!text || isWaiting) return;

    const newUserMsg = { role: "user", content: text, time: nowTime() };
    const updated = [...messages, newUserMsg];
    setMessages(updated);
    setInput("");
    if (textareaRef.current) textareaRef.current.style.height = "auto";
    setIsWaiting(true);

    try {
      const response = await fetch("https://api.anthropic.com/v1/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          model: "claude-sonnet-4-20250514",
          max_tokens: 1000,
          system:
            "당신은 Bal.life의 친근한 건강 AI 비서 'Ball'입니다. 사용자의 건강 관련 질문(혈당, 영양, 운동, 수면, 생활습관 등)에 한국어로 친절하고 명확하게 답변하세요. 답변은 핵심을 짚어 2~5문장 정도로 간결하게 작성하세요. 의학적 진단이 필요한 사안에는 전문의 상담을 권유하세요. 이모지는 사용하지 마세요.",
          messages: updated.map((m) => ({ role: m.role, content: m.content })),
        }),
      });
      const data = await response.json();
      const reply =
        (data.content || [])
          .filter((b) => b.type === "text")
          .map((b) => b.text)
          .join("\n")
          .trim() || "응답을 받지 못했어요. 다시 시도해 주세요.";

      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: reply, time: nowTime() },
      ]);
    } catch (err) {
      console.error(err);
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content: "죄송해요, 잠시 응답을 가져올 수 없어요. 잠시 후 다시 시도해 주세요.",
          time: nowTime(),
        },
      ]);
    } finally {
      setIsWaiting(false);
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }

  /* ---------- Avatars ---------- */
  const BotAvatar = ({ size = 20 }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <circle cx="12" cy="12" r="10" fill="#2D6BFF" />
      <text
        x="12"
        y="16"
        fontSize="11"
        fontWeight="700"
        fill="#fff"
        textAnchor="middle"
        fontFamily="Noto Sans KR, sans-serif"
      >
        B
      </text>
    </svg>
  );

  const UserAvatar = () => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
      <circle cx="12" cy="9" r="3.5" stroke="#4A5363" strokeWidth="1.6" />
      <path
        d="M5 19 C5 15.5 8 13.5 12 13.5 C16 13.5 19 15.5 19 19"
        stroke="#4A5363"
        strokeWidth="1.6"
        strokeLinecap="round"
      />
    </svg>
  );

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Noto+Sans+KR:wght@400;500;600;700&display=swap');

        .ball-chatbot {
          --navy-900: #0F1A2E;
          --navy-800: #152238;
          --gray-50:  #F7F8FA;
          --gray-100: #EEF1F5;
          --gray-200: #E2E6EC;
          --gray-300: #C9D0DA;
          --gray-500: #8993A4;
          --gray-700: #4A5363;
          --blue-100: #E6F0FF;
          --green-500: #22C55E;
          font-family: 'Noto Sans KR', -apple-system, BlinkMacSystemFont, sans-serif;
        }

        /* Floating button */
        .ball-fab {
          position: fixed;
          right: 28px;
          bottom: 28px;
          width: 75px;
          height: 75px;
          border-radius: 50%;
          border: none;
          background: var(--navy-900);
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          box-shadow:
            0 12px 28px rgba(15, 26, 46, 0.28),
            0 4px 10px rgba(15, 26, 46, 0.18);
          z-index: 100;
          transition: transform .25s cubic-bezier(.2,.8,.2,1), box-shadow .25s ease;
          padding: 0;
        }
        .ball-fab:hover {
          transform: translateY(-3px) scale(1.03);
          box-shadow:
            0 18px 36px rgba(15, 26, 46, 0.35),
            0 6px 14px rgba(15, 26, 46, 0.22);
        }
        .ball-fab:active { transform: translateY(-1px) scale(0.99); }
        .ball-fab svg { width: 60px; height: 60px; }

        /* Modal */
        .ball-overlay {
          position: fixed;
          inset: 0;
          background: transparent;
          backdrop-filter: blur(1.5px);
          -webkit-backdrop-filter: blur(1.5px);
          display: flex;
          justify-content: flex-end;
          align-items: flex-end;
          padding: 24px 28px 124px 28px;
          z-index: 99;
          opacity: 0;
          pointer-events: none;
          transition: opacity .22s ease;
        }
        .ball-overlay.is-open { opacity: 1; pointer-events: auto; }

        .ball-modal {
          width: 530px;
          max-width: 100%;
          height: min(720px, calc(100vh - 160px));
          background: #ffffff;
          border-radius: 18px;
          box-shadow:
            0 30px 80px rgba(15, 26, 46, 0.35),
            0 8px 24px rgba(15, 26, 46, 0.18);
          display: flex;
          flex-direction: column;
          overflow: hidden;
          transform: translateY(16px) scale(0.98);
          opacity: 0;
          transition: transform .28s cubic-bezier(.2,.8,.2,1), opacity .22s ease;
        }
        .ball-overlay.is-open .ball-modal { transform: translateY(0) scale(1); opacity: 1; }

        .ball-header {
          background: var(--navy-900);
          color: #fff;
          padding: 16px 18px;
          display: flex;
          align-items: center;
          gap: 12px;
        }
        .ball-header__icon {
          width: 38px; height: 38px;
          border-radius: 9px;
          background: rgba(255,255,255,0.08);
          display: flex; align-items: center; justify-content: center;
          flex-shrink: 0;
        }
        .ball-header__title-wrap { flex: 1; min-width: 0; }
        .ball-header__title { font-size: 16px; font-weight: 700; letter-spacing: -0.01em; }
        .ball-header__status {
          display: flex; align-items: center; gap: 6px;
          font-size: 11px; color: rgba(255,255,255,0.7); margin-top: 2px;
        }
        .ball-header__status::before {
          content: "";
          width: 7px; height: 7px;
          border-radius: 50%;
          background: var(--green-500);
          box-shadow: 0 0 0 0 rgba(34,197,94,0.5);
          animation: ball-dot-pulse 1.6s ease-out infinite;
        }
        @keyframes ball-dot-pulse {
          0%   { box-shadow: 0 0 0 0 rgba(34,197,94,0.55); }
          70%  { box-shadow: 0 0 0 8px rgba(34,197,94,0); }
          100% { box-shadow: 0 0 0 0 rgba(34,197,94,0); }
        }
        .ball-header__close {
          background: transparent;
          border: none;
          color: rgba(255,255,255,0.85);
          cursor: pointer;
          padding: 6px;
          border-radius: 6px;
          display: flex;
          transition: background .15s ease;
        }
        .ball-header__close:hover { background: rgba(255,255,255,0.1); }

        .ball-body {
          flex: 1;
          overflow-y: auto;
          background: var(--gray-50);
          padding: 22px 18px;
          display: flex;
          flex-direction: column;
          gap: 18px;
        }
        .ball-body::-webkit-scrollbar { width: 6px; }
        .ball-body::-webkit-scrollbar-thumb { background: var(--gray-200); border-radius: 3px; }

        .ball-empty {
          margin: auto;
          display: flex; flex-direction: column;
          align-items: center; justify-content: center;
          padding: 28px 16px; text-align: center;
          color: var(--gray-700);
        }
        .ball-empty__icon {
          width: 64px; height: 64px;
          border-radius: 50%;
          background: var(--blue-100);
          display: flex; align-items: center; justify-content: center;
          margin-bottom: 14px;
        }
        .ball-empty__title {
          font-size: 15px; font-weight: 700;
          color: var(--navy-900); margin-bottom: 6px;
        }
        .ball-empty__desc {
          font-size: 12.5px; line-height: 1.6;
          color: var(--gray-500); max-width: 320px;
        }

        .ball-row { display: flex; gap: 10px; animation: ball-fade-in .25s ease; }
        .ball-row.is-user { justify-content: flex-end; }
        @keyframes ball-fade-in {
          from { opacity: 0; transform: translateY(4px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        .ball-avatar {
          width: 34px; height: 34px; border-radius: 50%;
          flex-shrink: 0;
          display: flex; align-items: center; justify-content: center;
          background: var(--blue-100);
        }
        .ball-avatar.is-user { background: var(--gray-200); }
        .ball-stack { display: flex; flex-direction: column; gap: 6px; max-width: 78%; }
        .ball-row.is-user .ball-stack { align-items: flex-end; }
        .ball-name { font-size: 12px; font-weight: 600; color: var(--gray-700); }

        .ball-bubble {
          padding: 12px 14px;
          border-radius: 14px;
          font-size: 13.5px;
          line-height: 1.6;
          color: var(--navy-900);
          background: #fff;
          border: 1px solid var(--gray-100);
          word-break: keep-all;
          white-space: pre-wrap;
        }
        .ball-bubble.is-user {
          background: var(--navy-900);
          color: #fff;
          border-color: var(--navy-900);
        }
        .ball-time { font-size: 10.5px; color: var(--gray-500); padding: 0 4px; }

        .ball-typing { display: inline-flex; align-items: center; gap: 4px; padding: 2px 4px; }
        .ball-typing span {
          width: 6px; height: 6px;
          border-radius: 50%;
          background: var(--gray-300);
          animation: ball-bounce 1.2s infinite ease-in-out;
        }
        .ball-typing span:nth-child(2) { animation-delay: .15s; }
        .ball-typing span:nth-child(3) { animation-delay: .3s; }
        @keyframes ball-bounce {
          0%, 80%, 100% { transform: scale(0.7); opacity: 0.5; }
          40%           { transform: scale(1.0); opacity: 1; }
        }

        .ball-input-wrap {
          border-top: 1px solid var(--gray-100);
          background: #fff;
          padding: 12px 14px 6px;
        }
        .ball-input {
          display: flex; align-items: flex-end; gap: 8px;
          background: var(--gray-50);
          border: 1px solid var(--gray-100);
          border-radius: 12px;
          padding: 8px 8px 8px 12px;
          transition: border-color .15s ease, background .15s ease;
        }
        .ball-input:focus-within {
          border-color: var(--gray-300);
          background: #fff;
        }
        .ball-input textarea {
          flex: 1; border: none; outline: none; background: transparent;
          font-family: inherit; font-size: 13.5px;
          color: var(--navy-900);
          padding: 6px 0; resize: none;
          max-height: 120px; line-height: 1.5;
        }
        .ball-input textarea::placeholder { color: var(--gray-500); }

        .ball-icon-btn {
          border: none; background: transparent;
          width: 32px; height: 32px;
          border-radius: 8px;
          display: flex; align-items: center; justify-content: center;
          cursor: pointer; color: var(--gray-500);
          transition: background .15s ease, color .15s ease, opacity .15s ease;
          flex-shrink: 0; padding: 0;
        }
        .ball-icon-btn:hover:not(:disabled) { background: var(--gray-100); color: var(--navy-900); }
        .ball-icon-btn:disabled { opacity: 0.4; cursor: not-allowed; }
        .ball-send-btn {
          background: var(--navy-900); color: #fff;
          width: 36px; height: 36px; border-radius: 9px;
        }
        .ball-send-btn:hover:not(:disabled) { background: var(--navy-800); color: #fff; }
        .ball-send-btn:disabled { background: var(--gray-300); color: #fff; }

        .ball-disclaimer {
          text-align: center; font-size: 10.5px;
          color: var(--gray-500); padding: 8px 0 4px;
        }

        @media (max-width: 640px) {
          .ball-overlay { padding: 0; align-items: stretch; justify-content: stretch; }
          .ball-modal { width: 100%; height: 100%; border-radius: 0; }
          .ball-fab { width: 68px; height: 68px; right: 18px; bottom: 18px; }
          .ball-fab svg { width: 54px; height: 54px; }
        }
      `}</style>

      <div className="ball-chatbot">
        {/* Floating Button */}
        <button
          className="ball-fab"
          onClick={() => setIsOpen(true)}
          aria-label="AI 챗봇 열기"
        >
          <svg viewBox="0 0 200 200" fill="none" xmlns="http://www.w3.org/2000/svg">
            <rect x="34" y="78" width="14" height="34" rx="6" fill="#B6CCE6" />
            <rect x="118" y="78" width="14" height="34" rx="6" fill="#B6CCE6" />
            <rect x="44" y="58" width="92" height="68" rx="14" fill="#DCEAFA" />
            <circle cx="68" cy="78" r="5.2" fill="#22D3EE" />
            <circle cx="112" cy="78" r="5.2" fill="#22D3EE" />
            <rect x="56" y="80" width="68" height="36" rx="7" fill="#16335E" />
            <circle cx="74" cy="94" r="5" fill="#22D3EE" />
            <circle cx="106" cy="94" r="5" fill="#22D3EE" />
            <path d="M86 104 H94 L90 112 Z" fill="#22D3EE" />
            <rect x="68" y="124" width="44" height="6" rx="3" fill="#B6CCE6" />
            <path
              d="M52 134 Q52 126 60 126 H120 Q128 126 128 134 V158 Q128 174 110 174 H70 Q52 174 52 158 Z"
              fill="#CFE0F4"
            />
            <circle cx="90" cy="152" r="9" fill="#16335E" />
            <path d="M34 138 Q26 148 30 168 Q42 168 46 154 Z" fill="#CFE0F4" />
            <path d="M146 138 Q154 148 150 168 Q138 168 134 154 Z" fill="#CFE0F4" />
            <path
              d="M124 28 H172 Q180 28 180 36 V72 Q180 80 172 80 H150 L142 90 L143 80 H124 Q116 80 116 72 V36 Q116 28 124 28 Z"
              fill="#5BC97F"
            />
            <line x1="128" y1="42" x2="168" y2="42" stroke="#3F9F5F" strokeWidth="3.2" strokeLinecap="round" />
            <line x1="128" y1="54" x2="168" y2="54" stroke="#3F9F5F" strokeWidth="3.2" strokeLinecap="round" />
            <line x1="128" y1="66" x2="158" y2="66" stroke="#3F9F5F" strokeWidth="3.2" strokeLinecap="round" />
          </svg>
        </button>

        {/* Modal */}
        <div
          className={`ball-overlay ${isOpen ? "is-open" : ""}`}
          onClick={(e) => {
            if (e.target === e.currentTarget) setIsOpen(false);
          }}
          role="dialog"
          aria-modal="true"
        >
          <div className="ball-modal">
            {/* Header */}
            <header className="ball-header">
              <div className="ball-header__icon">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                  <path
                    d="M12 2 L20 5 V12 C20 17 16 21 12 22 C8 21 4 17 4 12 V5 Z"
                    stroke="#fff"
                    strokeWidth="1.7"
                    strokeLinejoin="round"
                    fill="none"
                  />
                  <path
                    d="M9 12 L11 14 L15 10"
                    stroke="#fff"
                    strokeWidth="1.7"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </div>
              <div className="ball-header__title-wrap">
                <div className="ball-header__title">건강 AI 비서</div>
                <div className="ball-header__status">실시간 상담 가능</div>
              </div>
              <button
                className="ball-header__close"
                onClick={() => setIsOpen(false)}
                aria-label="닫기"
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                  <path
                    d="M6 6 L18 18 M18 6 L6 18"
                    stroke="currentColor"
                    strokeWidth="1.8"
                    strokeLinecap="round"
                  />
                </svg>
              </button>
            </header>

            {/* Body */}
            <div className="ball-body" ref={chatBodyRef}>
              {messages.length === 0 && !isWaiting && (
                <div className="ball-empty">
                  <div className="ball-empty__icon">
                    <BotAvatar size={32} />
                  </div>
                  <div className="ball-empty__title">안녕하세요, Ball이에요</div>
                  <div className="ball-empty__desc">
                    혈당, 영양, 운동, 수면 등 건강과 관련된
                    <br />
                    궁금한 점을 편하게 물어봐 주세요.
                  </div>
                </div>
              )}

              {messages.map((m, i) =>
                m.role === "user" ? (
                  <div key={i} className="ball-row is-user">
                    <div className="ball-stack">
                      <div className="ball-bubble is-user">{m.content}</div>
                      <div className="ball-time">{m.time}</div>
                    </div>
                    <div className="ball-avatar is-user">
                      <UserAvatar />
                    </div>
                  </div>
                ) : (
                  <div key={i} className="ball-row">
                    <div className="ball-avatar">
                      <BotAvatar />
                    </div>
                    <div className="ball-stack">
                      <div className="ball-name">Ball</div>
                      <div className="ball-bubble">{m.content}</div>
                      <div className="ball-time">{m.time}</div>
                    </div>
                  </div>
                )
              )}

              {isWaiting && (
                <div className="ball-row">
                  <div className="ball-avatar">
                    <BotAvatar />
                  </div>
                  <div className="ball-stack">
                    <div className="ball-name">Ball</div>
                    <div className="ball-bubble">
                      <div className="ball-typing">
                        <span></span>
                        <span></span>
                        <span></span>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Input */}
            <div className="ball-input-wrap">
              <div className="ball-input">
                <button className="ball-icon-btn" type="button" aria-label="파일 첨부">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                    <path
                      d="M21 12 L12 21 a5 5 0 0 1 -7 -7 L14 5 a3.5 3.5 0 0 1 5 5 L10 19"
                      stroke="currentColor"
                      strokeWidth="1.7"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                </button>
                <textarea
                  ref={(el) => {
                    textareaRef.current = el;
                    inputRef.current = el;
                  }}
                  rows={1}
                  placeholder="메시지를 입력하세요..."
                  value={input}
                  onChange={handleInputChange}
                  onKeyDown={handleKeyDown}
                />
                <button
                  className="ball-icon-btn ball-send-btn"
                  type="button"
                  aria-label="전송"
                  onClick={send}
                  disabled={!input.trim() || isWaiting}
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                    <path
                      d="M3 12 L21 4 L13 21 L11 13 Z"
                      stroke="currentColor"
                      strokeWidth="1.7"
                      strokeLinejoin="round"
                      fill="none"
                    />
                  </svg>
                </button>
              </div>
              <div className="ball-disclaimer">
                AI 비서의 조언은 참고용이며 의학적 진단을 대신할 수 없습니다.
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}