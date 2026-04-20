import { useId, useState } from 'react';
import { X } from 'lucide-react';

const getProgressMessage = (progress) => {
  if (progress >= 100) {
    return '오늘 목표를 달성했습니다. 지금 페이스를 유지하면서 몸 상태도 함께 체크해보세요.';
  }

  if (progress >= 70) {
    return '현재 페이스를 유지하시면 오늘 목표에 무리 없이 도달할 수 있습니다.';
  }

  if (progress >= 40) {
    return '좋은 흐름입니다. 남은 시간 동안 2~3회 정도 나눠 마시면 목표에 가까워집니다.';
  }

  return '아직 여유가 있습니다. 지금부터 조금씩 나눠 마시면 부담 없이 목표를 채울 수 있습니다.';
};

const WaterRecordModal = ({
  isOpen = true,
  onClose,
  onSave,
  currentAmount = 1400, // 먹은 물 양
  targetAmount = 1900, // 목표치
}) => {
  const clipPathId = useId();
  const [inputAmount, setInputAmount] = useState(() => String(currentAmount));

  if (!isOpen) return null;

  const parsedCurrentAmount = Number(inputAmount) || 0;
  const safeTargetAmount = targetAmount > 0 ? targetAmount : 1;
  const progress = Math.max(0, Math.min(Math.round((parsedCurrentAmount / safeTargetAmount) * 100)));
  const fillHeight = Math.max(0, Math.min(132, (progress / 100) * 132));
  const fillY = 132 - fillHeight;
  const feedbackMessage = getProgressMessage(progress);

  const handleAmountChange = (event) => {
    const nextValue = event.target.value.replace(/[^0-9]/g, '');
    setInputAmount(nextValue);
  };

  const handleSave = () => { // api 호출해서 create하기
    if (onSave) {
      onSave(parsedCurrentAmount);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/18 px-3 py-4 backdrop-blur-[1px]">
      <div className="relative h-[785px] w-[700px] overflow-hidden rounded-[28px] bg-white px-8 pb-7 pt-7 shadow-[0_24px_60px_rgba(15,23,42,0.18)]">
        <div className="flex items-start justify-between border-b border-slate-100 pb-5">
          <div>
            <h2 className="text-[32px] font-bold leading-none text-slate-900">수분 섭취 기록하기</h2>
            <p className="mt-2 text-[14px] font-medium text-slate-400">오늘의 수분 섭취량을 기록하세요.</p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-full p-1.5 text-slate-500 transition hover:bg-slate-100 hover:text-slate-700"
            aria-label="닫기"
          >
            <X size={24} strokeWidth={2.2} />
          </button>
        </div>

        <div className="relative pb-8 pt-10">
          <div className="absolute right-0 top-2 text-right">
            <div className="flex items-end justify-end gap-1 leading-none">
              <label htmlFor="water-amount" className="sr-only">현재 수분 섭취량 입력</label>
              <input
                id="water-amount"
                type="text"
                inputMode="numeric"
                value={inputAmount}
                onChange={handleAmountChange}
                placeholder="0"
                className="w-[240px] border-0 bg-transparent p-0 text-right text-[78px] font-extrabold tracking-[-0.06em] text-gray-600 outline-none placeholder:text-slate-200"
              />
              <span className="pb-2 text-[28px] font-bold text-slate-300">ml</span>
            </div>
            <div className="mt-1 space-y-1">
              <p className="text-[12px] font-semibold text-slate-500">현재 수분 섭취량</p>
              <p className="text-[24px] font-extrabold text-[#3454ff]">{progress}%</p>
            </div>
          </div>

          <div className="mx-auto flex w-full justify-center pt-10">
            <svg viewBox="0 0 100 132" className="h-[380px] w-[290px]" aria-hidden="true">
              <defs>
                <clipPath id={clipPathId}>
                  <path d="M50 1C52.5 1 79 35.5 89.2 58.7C94.7 71.3 96.6 81 95 92.8C91.6 116 73.2 131 50 131C26.8 131 8.4 116 5 92.8C3.4 81 5.3 71.3 10.8 58.7C21 35.5 47.5 1 50 1Z" />
                </clipPath>
                <linearGradient id="waterDropBackground" x1="50" y1="1" x2="50" y2="131" gradientUnits="userSpaceOnUse">
                  <stop stopColor="#f8fbff" />
                  <stop offset="1" stopColor="#eef3ff" />
                </linearGradient>
                <linearGradient id="waterDropFill" x1="50" y1="34" x2="50" y2="132" gradientUnits="userSpaceOnUse">
                  <stop stopColor="#5872ff" />
                  <stop offset="1" stopColor="#4760dd" />
                </linearGradient>
              </defs>
              <path
                d="M50 1C52.5 1 79 35.5 89.2 58.7C94.7 71.3 96.6 81 95 92.8C91.6 116 73.2 131 50 131C26.8 131 8.4 116 5 92.8C3.4 81 5.3 71.3 10.8 58.7C21 35.5 47.5 1 50 1Z"
                fill="url(#waterDropBackground)"
              />
              <g clipPath={`url(#${clipPathId})`}>
                <rect x="0" y={fillY} width="100" height={fillHeight} fill="url(#waterDropFill)" />
              </g>
            </svg>
          </div>

          <div className="absolute bottom-4 left-0">
            <p className="text-[12px] font-semibold text-slate-400">목표 수분 섭취량</p>
            <p className="mt-1 text-[34px] font-extrabold tracking-[-0.04em] text-[#2447ea]">{targetAmount}ml</p>
          </div>
        </div>

        <div className="space-y-6">
          <div className="flex items-start gap-4 rounded-[18px] bg-[#f4f7ff] px-5 py-4 text-[14px] leading-[1.6] text-slate-600">
            <div className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-white text-[#4462ff] shadow-[0_6px_14px_rgba(68,98,255,0.16)]">
              <svg viewBox="0 0 16 16" className="h-4 w-4" fill="currentColor" aria-hidden="true">
                <path d="M8.86 1.5 9.91 5l3.59.04-2.92 2.1 1.09 3.5L8.86 8.6 6.03 10.64l1.1-3.5-2.93-2.1L7.8 5l1.06-3.5Z" />
              </svg>
            </div>
            <div>
              <p>
                목표 수분 섭취량 대비 약 <span className="font-bold text-[#3454ff]">{progress}%</span>를 달성했습니다.
              </p>
              <p>{feedbackMessage}</p>
            </div>
          </div>

          <button
            type="button"
            onClick={handleSave}
            className="w-full rounded-[20px] bg-[#1d2036] py-5 text-[18px] font-bold text-white transition hover:bg-[#16192b] active:scale-[0.99]"
          >
            기록 저장 및 확인
          </button>
        </div>
      </div>
    </div>
  );
};

export default WaterRecordModal;