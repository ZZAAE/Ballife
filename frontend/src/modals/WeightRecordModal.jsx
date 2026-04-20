import React, { useState, useRef } from 'react';
import { X, Calendar } from 'lucide-react';

const WeightRecordModal = ({ isOpen, onClose }) => {
  const [weight, setWeight] = useState("70.5");
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const dateInputRef = useRef(null);

  // 목표 관련 설정값 (나중에는 UserConfig에서 불러옴)
  const targetWeight = 68.0;
  const startWeight = 75.0; // 시작 체중 (전날 체중으로 먼저 띄워줘도 될듯?)

  if (!isOpen) return null;

  // 1. 달성률 계산 로직 (시작체중 - 목표체중 대비 현재 감량 폭) // 수정 필요
  const calculateProgress = () => {
    const current = parseFloat(weight) || 0;
    if (current <= targetWeight) return 100;
    const totalToLose = startWeight - targetWeight;
    const lostSoFar = startWeight - current;
    const percentage = (lostSoFar / totalToLose) * 100;
    return Math.max(0, Math.min(100, Math.round(percentage)));
  };

  const progress = calculateProgress();
  const weightDiff = (parseFloat(weight || 0) - targetWeight).toFixed(1);

  const handleWeightChange = (e) => {
    const value = e.target.value;
    if (/^\d*\.?\d{0,1}$/.test(value)) {
      setWeight(value);
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
          <button onClick={onClose} className="rounded-full p-2 hover:bg-slate-100 transition-colors">
            <X className="h-7 w-7 text-slate-400" />
          </button>
        </div>

        <div className="flex-1 flex flex-col justify-between">
          {/* Date Selector */}
          <div className="relative">
            <input
              type="date"
              ref={dateInputRef}
              className="absolute opacity-0 pointer-events-none"
              onChange={(e) => setSelectedDate(e.target.value)}
            />
            <button 
              onClick={() => dateInputRef.current.showPicker()}
              className="flex items-center gap-2 rounded-xl bg-slate-50 px-5 py-2.5 text-[14px] font-semibold text-slate-600 border border-slate-100 shadow-sm"
            >
              <Calendar className="h-4 w-4 text-blue-500" />
              {selectedDate} (오늘) <span className="ml-1 text-[10px] text-slate-300">▼</span>
            </button>
          </div>

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
                <p className="text-2xl font-extrabold text-slate-800">{targetWeight.toFixed(1)} kg</p>
              </div>
              <div className="text-right">
                <p className="text-[13px] text-slate-400 font-bold mb-1 uppercase tracking-wider">현재와의 차이</p>
                <p className={`text-2xl font-extrabold ${parseFloat(weightDiff) <= 0 ? 'text-green-500' : 'text-blue-600'}`}>
                   {parseFloat(weightDiff) > 0 ? `+ ${weightDiff}` : `${weightDiff}`} kg
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
              {progress >= 100 
                ? "축하합니다! 목표 체중에 도달했습니다. 유지 관리에 집중해보세요." 
                : `목표까지 ${weightDiff}kg 남았습니다. 조금만 더 힘내세요!`}
            </p>
          </div>

          {/* Footer Button */}
          <div className="pt-4">
            <button className="w-full rounded-[24px] bg-[#1a1a2e] py-5 text-xl font-bold text-white transition-all active:scale-[0.98] hover:bg-[#25253d] shadow-xl">
              기록 저장 및 확인
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default WeightRecordModal;