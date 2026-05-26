import { useState } from "react";
import { Sparkles, Gift } from "lucide-react";

export default function AIAnalysisCard({ className = "" }) {
  const [rewardFloats, setRewardFloats] = useState([]);

  const handleRewardClick = () => {
    const id = Date.now() + Math.random();
    setRewardFloats((prev) => [...prev, id]);
    setTimeout(() => {
      setRewardFloats((prev) => prev.filter((x) => x !== id));
    }, 1000);
  };

  return (
    <aside
      className={`mb-8 flex h-[calc(100vh-500px)] min-h-[280px] flex-col rounded-[18px] border border-slate-700 bg-gradient-to-br from-slate-700 via-slate-800 to-slate-950 p-5 shadow-[0_10px_26px_rgba(15,23,42,0.22)] sm:p-6 ${className}`}
    >
      <div className="mb-4 flex min-h-[38px] items-center justify-between gap-2">
        <h2 className="flex items-center gap-2 text-[18px] font-bold text-white">
          <Sparkles className="h-[18px] w-[18px] text-white" strokeWidth={2.4} />
          AI 건강 분석
        </h2>
        <div className="relative">
          <button
            type="button"
            onClick={handleRewardClick}
            className="inline-flex items-center gap-1.5 rounded-[10px] border border-white bg-white px-3 py-1.5 text-xs font-bold text-slate-900 shadow-[0_2px_8px_rgba(255,255,255,0.20)] transition hover:bg-slate-50 active:scale-95"
          >
            <Gift className="h-3.5 w-3.5 text-slate-900" strokeWidth={2.4} />
            리워드
          </button>
          {rewardFloats.map((id) => (
            <span
              key={id}
              className="reward-float pointer-events-none absolute left-1/2 -top-1 text-base font-extrabold text-amber-300 drop-shadow-[0_2px_10px_rgba(253,224,71,0.85)]"
            >
              +1
            </span>
          ))}
        </div>
      </div>
      <div className="flex min-h-0 flex-1 flex-col items-center justify-center rounded-[12px] border border-dashed border-white/30 bg-white/10 px-4 py-8 text-center backdrop-blur-sm">
        <Sparkles className="mb-3 h-6 w-6 text-white/80" strokeWidth={1.8} />
        <p className="text-sm font-semibold text-white">
          분석 결과를 준비 중입니다
        </p>
        <p className="mt-1 text-xs text-white/75">
          데이터가 누적되면 맞춤 인사이트를 제공해드려요
        </p>
      </div>
    </aside>
  );
}
