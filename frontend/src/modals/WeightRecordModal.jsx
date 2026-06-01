import React, { useEffect, useState } from 'react';
import { Sparkles, X } from 'lucide-react';
import toast from 'react-hot-toast';
import bioValueRecordApi from '../api/bioValueRecordApi';
import userApi from '../api/userApi';
import userConfigApi from '../api/userConfigApi';
import { useAuth } from '../contexts/AuthContext';
import { USER_KEY } from '../api/api';
import { BIO_CATEGORY } from '../constants/bioCategory';
import { persistMemberProfile, loadCachedMemberProfile } from '../utils/userProfile';

const WEIGHT_CATEGORY = BIO_CATEGORY.WEIGHT;


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

const WeightRecordModal = ({ isOpen, onClose, onSaved, recordDate }) => {
  const { user } = useAuth();
  const userId = resolveUserId(user);

  const [weight, setWeight] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [targetWeight, setTargetWeight] = useState(null);

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
          setWeight(String(Number(last.weight)));
        }
      }
    });

    return () => {
      cancelled = true;
    };
  }, [isOpen, userId]);

  if (!isOpen) return null;

  // 달성률: 목표와의 절대 거리를 10kg 스케일로 환산 (1kg ≈ 10%)
  // 0kg 차이 → 100%, 5kg → 50%, 10kg+ → 0%
  const PROGRESS_SCALE_KG = 10;
  const calculateProgress = () => {
    if (targetWeight == null) return 0;
    const current = parseFloat(weight) || 0;
    if (!current) return 0;
    const diff = Math.abs(current - targetWeight);
    const percentage = 100 - (diff / PROGRESS_SCALE_KG) * 100;
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
    const todayStr = `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}`;
    const targetDate = recordDate || todayStr; // 부모가 날짜 안 주면 오늘
    const recordTime = `${pad(now.getHours())}:${pad(now.getMinutes())}:${pad(now.getSeconds())}`;

    const payload = {
      recordDate: targetDate,
      recordTime,
      category: WEIGHT_CATEGORY,
      weight: weightValue,
    };

    setSubmitting(true);
    try {
      // 1. 선택한 날짜에 같은 카테고리 기록이 이미 있는지 조회 (하루 1개만 유지)
      const dayRes = await bioValueRecordApi.searchByDate(
        userId,
        WEIGHT_CATEGORY,
        targetDate,
      );
      const existing = Array.isArray(dayRes.data) ? dayRes.data[0] : null;

      let res;
      if (existing?.recordId != null) {
        // 2-a. 있으면 update
        res = await bioValueRecordApi.updateBioValueRecord(
          existing.recordId,
          payload,
        );
        toast.success(`${targetDate} 체중 기록이 수정되었습니다.`);
      } else {
        // 2-b. 없으면 insert
        res = await bioValueRecordApi.createBioValueRecord(userId, payload);
        toast.success(`${targetDate} 체중이 기록되었습니다.`);
      }

      // 3. 회원정보의 현재 체중(member.weight)도 동기화 — UserInformation 페이지의 "현재 체중" 갱신용
      try {
        const { data: updatedMember } = await userApi.updateMember(userId, {
          weight: weightValue,
        });
        persistMemberProfile({
          ...loadCachedMemberProfile(),
          ...updatedMember,
        });
      } catch (memberErr) {
        console.error("회원 체중 동기화 실패:", memberErr);
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
      className="fixed inset-0 z-50 flex items-center justify-center bg-[#0f172a]/40 backdrop-blur-sm px-4 py-6"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div className="relative flex h-[785px] max-h-[92vh] w-full max-w-[672px] flex-col overflow-y-auto rounded-[32px] bg-white p-10 shadow-[0_24px_80px_rgba(15,23,42,0.18)] xl:h-[840px] xl:max-w-[760px] 2xl:h-[880px] 2xl:max-w-[820px]">

        {/* Header */}
        <div className="mb-8 flex items-start justify-between gap-4">
          <div>
            <h2 className="text-[24px] font-bold leading-tight text-[#0F172A]">체중 기록하기</h2>
            <p className="mt-1 text-[14px] leading-relaxed text-[#94A3B8]">오늘의 체중을 기록하세요.</p>
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

          {/* AI 조언 카드 */}
          <div className="overflow-hidden rounded-[20px] border border-[#DBEAFE] bg-gradient-to-r from-[#EFF6FF] to-[#F8FBFF]">
            <div className="flex items-start gap-3 px-4 py-4">
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[#DBEAFE] text-[#2563EB]">
                <Sparkles className="h-[18px] w-[18px]" strokeWidth={2.2} />
              </div>

              <div className="flex-1">
                <p className="text-[13px] leading-relaxed text-[#475569]">
                  {targetWeight == null
                    ? "목표 체중을 설정하면 달성률과 맞춤 조언을 확인할 수 있어요."
                    : progress >= 100
                      ? "축하합니다! 목표 체중에 도달했습니다. 유지 관리에 집중해보세요."
                      : `목표까지 ${weightDiff}kg 남았습니다. 조금만 더 힘내세요!`}
                </p>
              </div>
            </div>
          </div>

          {/* Footer Button */}
          <div className="pt-4">
            <button
              onClick={handleSubmit}
              disabled={submitting}
              className="w-full rounded-[20px] bg-[#1a1a2e] py-5 text-lg font-bold text-white shadow-[0_10px_24px_rgba(15,23,42,0.18)] transition hover:bg-[#25253d] active:scale-[0.98] disabled:opacity-60 disabled:cursor-not-allowed"
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