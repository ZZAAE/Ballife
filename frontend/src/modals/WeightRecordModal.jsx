import React, { useEffect, useState } from 'react';
import { X, Calendar } from 'lucide-react';
import toast from 'react-hot-toast';
import bioValueRecordApi from '../api/bioValueRecordApi';
import userConfigApi from '../api/userConfigApi';
import { useAuth } from '../contexts/AuthContext';
import { USER_KEY } from '../api/api';

const WEIGHT_CATEGORY = "Weight";


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

const WeightRecordModal = ({ isOpen, onClose, onSaved }) => {
  const { user } = useAuth();
  const userId = resolveUserId(user);

  const [weight, setWeight] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [targetWeight, setTargetWeight] = useState(null);
  const [startWeight, setStartWeight] = useState(null);

  useEffect(() => {
    if (!isOpen || !userId) return;

    let cancelled = false;

    Promise.allSettled([
      userConfigApi.getTargetWeight(userId),
      bioValueRecordApi.getLatestPageByCategory(userId, WEIGHT_CATEGORY),
    ]).then(([targetRes, latestRes]) => {
      if (cancelled) return;

      if (targetRes.status === "fulfilled" && targetRes.value?.data != null) {
        setTargetWeight(Number(targetRes.value.data));
      }

      if (latestRes.status === "fulfilled") {
        const content = latestRes.value?.data?.content ?? [];
        const last = content[0];
        if (last?.weight != null) {
          const lastWeight = Number(last.weight);
          setStartWeight(lastWeight);
          setWeight(String(lastWeight));
        }
      }
    });

    return () => {
      cancelled = true;
    };
  }, [isOpen, userId]);

  if (!isOpen) return null;

  // 1. 달성률 계산 로직 (시작체중 - 목표체중 대비 현재 감량 폭)
  const calculateProgress = () => {
    if (targetWeight == null || startWeight == null) return 0;
    const current = parseFloat(weight) || 0;
    if (current <= targetWeight) return 100;
    const totalToLose = startWeight - targetWeight;
    if (totalToLose <= 0) return 0;
    const lostSoFar = startWeight - current;
    const percentage = (lostSoFar / totalToLose) * 100;
    return Math.max(0, Math.min(100, Math.round(percentage)));
  };

  const progress = calculateProgress();
  const weightDiff =
    targetWeight == null
      ? null
      : (parseFloat(weight || 0) - targetWeight).toFixed(1);

  // 체중입력에 숫자 외 다른거 걸러줌
  const handleWeightChange = (e) => {
    const value = e.target.value;
    if (/^\d*\.?\d{0,1}$/.test(value)) {
      setWeight(value);
    }
  };

  const handleSubmit = async () => {
    if (!userId) {
      toast.error("로그인이 필요합니다.");
      return;
    }
    const weightValue = parseFloat(weight);
    if (!weightValue || weightValue <= 0) {
      toast.error("체중을 정확히 입력해주세요.");
      return;
    }

    const now = new Date();
    const pad = (n) => String(n).padStart(2, "0");
    const recordDate = `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}`;
    const recordTime = `${pad(now.getHours())}:${pad(now.getMinutes())}:${pad(now.getSeconds())}`;

    const payload = {
      recordDate,
      recordTime,
      category: WEIGHT_CATEGORY,
      weight: weightValue,
    };

    setSubmitting(true);
    try {
      // 1. 오늘 같은 카테고리 기록이 이미 있는지 조회 (체중은 하루 1개만 유지)
      const todayRes = await bioValueRecordApi.searchByDate(
        userId,
        WEIGHT_CATEGORY,
        recordDate,
      );
      const existing = Array.isArray(todayRes.data) ? todayRes.data[0] : null;

      let res;
      if (existing?.recordId != null) {
        // 2-a. 있으면 update
        res = await bioValueRecordApi.updateBioValueRecord(
          existing.recordId,
          payload,
        );
        toast.success("오늘의 체중 기록이 수정되었습니다.");
      } else {
        // 2-b. 없으면 insert
        res = await bioValueRecordApi.createBioValueRecord(userId, payload);
        toast.success("체중이 기록되었습니다.");
      }

      onSaved?.(res.data);
      onClose?.();
    } catch (err) {
      console.error("체중 기록 실패:", err);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div className="relative w-[672px] h-[785px] flex flex-col rounded-[32px] bg-white shadow-2xl animate-in fade-in zoom-in duration-200 p-10">
        
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="text-2xl font-bold text-slate-900">체중 기록하기</h2>
            <p className="text-sm text-slate-400 mt-1 font-medium">오늘의 체중을 기록하세요.</p>
          </div>
          <button onClick={onClose} style={{
              background: "none", border: "none", cursor: "pointer", padding: 4,
              color: "#bbb", fontSize: 20, lineHeight: 1,
            }}>
              <svg
                width="18"
                height="18"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <line x1="18" y1="6" x2="6" y2="18" />
                <line x1="6" y1="6" x2="18" y2="18" />
              </svg>
            </button>
        </div>

        <div className="flex-1 flex flex-col justify-between">

          {/* Weight Input */}
          <div className="flex flex-col items-center justify-center py-2">
            <div className="flex items-baseline gap-4 relative group">
              <input
                type="text"
                value={weight}
                onChange={handleWeightChange}
                className="w-[350px] text-[110px] leading-none font-bold text-slate-900 tracking-tighter text-center outline-none border-none bg-transparent focus:ring-0"
                autoFocus
              />
              <span className="text-4xl font-bold text-slate-300">kg</span>
            </div>
            <div className="w-40 h-1.5 bg-slate-50 rounded-full mt-4"></div>
          </div>

          {/* Progress Section - 실시간 연동 핵심 부분 */}
          <div className="space-y-5">
            <div className="flex justify-between items-end px-1">
              <div>
                <p className="text-[13px] text-slate-400 font-bold mb-1 uppercase tracking-wider">목표 체중</p>
                <p className="text-2xl font-extrabold text-slate-800">
                  {targetWeight != null ? `${targetWeight.toFixed(1)} kg` : "— kg"}
                </p>
              </div>
              <div className="text-right">
                <p className="text-[13px] text-slate-400 font-bold mb-1 uppercase tracking-wider">현재와의 차이</p>
                <p className={`text-2xl font-extrabold ${weightDiff != null && parseFloat(weightDiff) <= 0 ? 'text-green-500' : 'text-blue-600'}`}>
                   {weightDiff == null
                     ? "— kg"
                     : `${parseFloat(weightDiff) > 0 ? "+ " : ""}${weightDiff} kg`}
                </p>
              </div>
            </div>

            {/* Progress Bar Container */}
            <div className="relative h-[14px] w-full rounded-full bg-slate-100 overflow-hidden shadow-inner">
              {/* 바의 width가 progress 상태에 따라 실시간으로 변함 */}
              <div 
                className="absolute top-0 left-0 h-full rounded-full bg-gradient-to-r from-blue-400 to-blue-600 transition-all duration-500 ease-out shadow-[0_0_10px_rgba(59,130,246,0.5)]" 
                style={{ width: `${progress}%` }}
              ></div>
            </div>

            <div className="flex justify-between items-center text-[13px] text-slate-400 font-bold px-1">
              <span>현재 {weight || "0"}kg</span>
              <span className="text-blue-600">목표까지 {progress}% 달성</span>
            </div>
          </div>

          {/* Insight Card */}
          <div className="rounded-[24px] bg-blue-50/40 p-5 border border-blue-100 flex gap-4">
            <div className="mt-0.5"><span className="text-blue-500 text-2xl">✦</span></div>
            <p className="text-[14px] leading-relaxed text-slate-600 font-medium">
              {targetWeight == null
                ? "목표 체중을 설정하면 달성률과 맞춤 조언을 확인할 수 있어요."
                : progress >= 100
                  ? "축하합니다! 목표 체중에 도달했습니다. 유지 관리에 집중해보세요."
                  : `목표까지 ${weightDiff}kg 남았습니다. 조금만 더 힘내세요!`}
            </p>
          </div>

          {/* Footer Button */}
          <div className="pt-4">
            <button
              onClick={handleSubmit}
              disabled={submitting}
              className="w-full rounded-[24px] bg-[#1a1a2e] py-5 text-xl font-bold text-white transition-all active:scale-[0.98] hover:bg-[#25253d] shadow-xl disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {submitting ? "저장 중..." : "기록 저장 및 확인"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default WeightRecordModal;