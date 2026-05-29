import { useId, useState, useEffect } from 'react';
import { Sparkles, X } from 'lucide-react';
import toast from 'react-hot-toast';
import { useAuth } from '../contexts/AuthContext';
import { BIO_CATEGORY } from '../constants/bioCategory';
import bioValueRecordApi from '../api/bioValueRecordApi';
import userConfigApi from '../api/userConfigApi';
import { USER_KEY } from '../api/api';

const DEFAULT_TARGET_CUPS = 10;

const resolveUserId = (user) => {
  const fromContext = user?.userId ?? user?.id ?? user?.memberId;
  if (fromContext != null) return fromContext;
  try {
    const raw =
      localStorage.getItem(USER_KEY) ||
      localStorage.getItem('user') ||
      localStorage.getItem('loginUser');
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    return parsed?.userId ?? parsed?.id ?? parsed?.memberId ?? null;
  } catch {
    return null;
  }
};


// 데이터베이스에서 기존에 사용자가 저장한 최신 물먹은양, 목표 수분섭취량 가져와서 
// currentAmount, targetAmount에 넣어야함 이후 currentAmount 값 새로 저장

const getProgressMessage = (progress) => {
  if (progress >= 100) {
    return '오늘 목표를 달성했습니다. 몸 상태도 함께 체크해보세요.';
  }

  if (progress >= 70) {
    return '현재 페이스를 유지하시면 오늘 목표에 무리 없이 도달할 수 있습니다.';
  }

  if (progress >= 40) {
    return '좋은 흐름입니다. 계속해서 천천히 마시면 목표에 가까워집니다.';
  }

  return '아직 여유가 있습니다. 조금씩 나눠 마시면 부담 없이 목표를 채울 수 있습니다.';
};

const WaterRecordModal = ({
  isOpen = true,
  onClose,
  onSave,
  currentAmount = 1400, // 먹은 물 양
  targetAmount = 2000, // 목표치
  recordDate, // 부모가 지정한 기록 날짜 (없으면 오늘)
}) => {
  const clipPathId = useId();
  const { user } = useAuth();
  const [inputAmount, setInputAmount] = useState('0');
  const [todayRecordId, setTodayRecordId] = useState(null);
  const [targetCups, setTargetCups] = useState(DEFAULT_TARGET_CUPS);

  const userId = resolveUserId(user);

  const pad = (n) => String(n).padStart(2, '0');
  const getTodayStr = () => {
    const now = new Date();
    return `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}`;
  };

  // 모달 열릴 때 오늘 물 기록 조회 → 있으면 recordId + 컵 수 로드
  useEffect(() => {
    if (!isOpen || !userId) return;
    const today = getTodayStr();
    bioValueRecordApi.searchByDate(userId, BIO_CATEGORY.WATER_INTAKE, today)
      .then((res) => {
        const list = res.data ?? [];
        if (list.length > 0) {
          const rec = list[0];
          setTodayRecordId(rec.recordId);
          setInputAmount(String(rec.waterIntakeCup ?? 0));
        } else {
          setTodayRecordId(null);
          setInputAmount('0');
        }
      })
      .catch(() => {});
  }, [isOpen, userId]);

  // 모달 열릴 때 user_config에서 목표 수분 섭취량 조회
  useEffect(() => {
    if (!isOpen || !userId) return;
    userConfigApi.getTargetDailyWaterIntake(userId)
      .then((res) => {
        const val = res.data;
        setTargetCups((val != null && val > 0) ? val : DEFAULT_TARGET_CUPS);
      })
      .catch(() => {
        setTargetCups(DEFAULT_TARGET_CUPS);
      });
  }, [isOpen, userId]);


  const parsedCurrentCups = Number(inputAmount) || 0;
  const parsedCurrentMl = parsedCurrentCups * 200;
  const targetAmountMl = targetCups * 200;
  const safeTargetAmount = targetAmountMl > 0 ? targetAmountMl : 1;
  const progress = Math.max(0, Math.min(Math.round((parsedCurrentMl / safeTargetAmount) * 100)));
  const fillHeight = Math.max(0, Math.min(132, (progress / 100) * 132));
  const fillY = 132 - fillHeight;
  const feedbackMessage = getProgressMessage(progress);

  const handleSave = async () => {
    if (!userId) {
      toast.error("로그인이 필요합니다.");
      return;
    }
    const now = new Date();
    const targetDate = recordDate || getTodayStr(); // 부모가 날짜 안 주면 오늘
    const recordTime = `${pad(now.getHours())}:${pad(now.getMinutes())}:${pad(now.getSeconds())}`;
    const payload = {
      recordDate: targetDate,
      recordTime,
      category: BIO_CATEGORY.WATER_INTAKE,
      waterIntakeCup: parsedCurrentCups,
    };

    try {
      // 선택한 날짜에 기록이 있으면 UPDATE, 없으면 CREATE
      // (부모가 오늘 날짜를 줬을 때만 todayRecordId 캐시 사용)
      let existingId = (recordDate && recordDate !== getTodayStr()) ? null : todayRecordId;
      if (!existingId) {
        const check = await bioValueRecordApi.searchByDate(userId, BIO_CATEGORY.WATER_INTAKE, targetDate);
        const list = check.data ?? [];
        if (list.length > 0) existingId = list[0].recordId;
      }

      if (existingId) {
        await bioValueRecordApi.updateBioValueRecord(existingId, payload);
      } else {
        await bioValueRecordApi.createBioValueRecord(userId, payload);
      }

      if (onSave) onSave(parsedCurrentCups);
      onClose?.();
    } catch (error) {
      console.error('수분 섭취 기록 실패:', error);
    }
  };

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-[#0f172a]/40 backdrop-blur-sm px-4 py-6"
      onClick={(event) => event.target === event.currentTarget && onClose?.()}
    >
      <div className="relative flex h-[785px] w-full max-w-[672px] flex-col overflow-hidden rounded-[32px] bg-white shadow-[0_24px_80px_rgba(15,23,42,0.18)]">
        {/* 헤더 */}
        <div className="shrink-0 border-b border-[#F1F5F9] px-6 pb-5 pt-7">
          <div className="flex items-start justify-between gap-4">
            <div>
              <h2 className="text-[24px] font-bold leading-tight text-[#0F172A]">수분 섭취 기록하기</h2>
              <p className="mt-1 text-[14px] leading-relaxed text-[#94A3B8]">오늘의 수분 섭취량을 기록하세요.</p>
            </div>

            <button
              type="button"
              onClick={onClose}
              aria-label="닫기"
              className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-[#94A3B8] transition hover:bg-[#F1F5F9] hover:text-[#0F172A]"
            >
              <X size={18} strokeWidth={2.2} />
            </button>
          </div>
        </div>

        {/* 본문 */}
        <div className="flex flex-1 flex-col overflow-y-auto px-6 py-6">
          <div className="relative flex-1">
            <div className="absolute right-0 top-2 text-right">
              <div className="flex items-center justify-end gap-4 leading-none">
                <div className="flex flex-col items-center gap-3">
                  <button
                    onClick={() => setInputAmount(String(parsedCurrentCups + 1))}
                    className="w-12 h-12 rounded-full bg-slate-100 hover:bg-blue-100 text-slate-500 hover:text-blue-600 flex items-center justify-center transition-colors shadow-sm"
                    aria-label="컵 수 증가"
                  >
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                      <polyline points="18 15 12 9 6 15" />
                    </svg>
                  </button>
                  <span className="text-[80px] font-bold tracking-tighter text-slate-900 w-[160px] text-center leading-none select-none">
                    {parsedCurrentCups}
                  </span>
                  <button
                    onClick={() => setInputAmount(String(Math.max(0, parsedCurrentCups - 1)))}
                    className="w-12 h-12 rounded-full bg-slate-100 hover:bg-blue-100 text-slate-500 hover:text-blue-600 flex items-center justify-center transition-colors shadow-sm"
                    aria-label="컵 수 감소"
                  >
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                      <polyline points="6 9 12 15 18 9" />
                    </svg>
                  </button>
                </div>
                <span className="text-4xl font-bold text-slate-300 self-center">컵</span>
              </div>
              <div className="mt-2 space-y-1">
                <p className="text-[12px] font-semibold text-slate-500">현재 수분 섭취량</p>
                <p className="text-[26px] font-extrabold text-[#3454ff]">{progress}%</p>
                <p className="text-[13px] font-semibold text-slate-400">= {parsedCurrentMl}ml</p>
              </div>
            </div>

            <div className="mx-auto flex w-full justify-center pt-12">
              <svg viewBox="0 0 100 132" className="h-[336px] w-[240px]" aria-hidden="true">
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

            <div className="absolute bottom-3 left-0">
              <p className="text-[12px] font-semibold text-slate-400">목표 수분 섭취량</p>
              <p className="mt-1 text-[34px] font-extrabold tracking-[-0.04em] text-[#2447ea]">{targetCups}컵</p>
            </div>
          </div>

          {/* AI 조언 카드 */}
          <div className="mt-6 overflow-hidden rounded-[20px] border border-[#DBEAFE] bg-gradient-to-r from-[#EFF6FF] to-[#F8FBFF]">
            <div className="flex items-start gap-3 px-4 py-4">
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[#DBEAFE] text-[#2563EB]">
                <Sparkles className="h-[18px] w-[18px]" strokeWidth={2.2} />
              </div>

              <div className="flex-1 space-y-1">
                <p className="text-[13px] leading-relaxed text-[#475569]">
                  목표 수분 섭취량 대비 약 <span className="font-bold text-[#2563EB]">{progress}%</span>를 달성했습니다.
                </p>
                <p className="text-[12px] text-[#94A3B8]">{feedbackMessage}</p>
              </div>
            </div>
          </div>
        </div>

        {/* 저장 버튼 */}
        <div className="shrink-0 border-t border-[#F1F5F9] px-6 py-5">
          <button
            onClick={handleSave}
            className="w-full rounded-[20px] bg-[#1a1a2e] py-5 text-lg font-bold text-white shadow-[0_10px_24px_rgba(15,23,42,0.18)] transition hover:bg-[#25253d] active:scale-[0.98]"
          >
            기록 저장 및 확인
          </button>
        </div>
      </div>
    </div>
  );
};

export default WaterRecordModal;