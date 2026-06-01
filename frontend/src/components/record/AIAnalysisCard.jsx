import { useEffect, useMemo, useState } from "react";
import { Sparkles, Gift } from "lucide-react";

const AI_SERVICE = "http://localhost:8001";

export default function AIAnalysisCard({ className = "", metric, data, userId }) {
  const [rewardFloats, setRewardFloats] = useState([]);
  const [analysis, setAnalysis] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(false);

  // 데이터/지표가 바뀔 때만 재요청하도록 직렬화한 시그니처를 의존성으로 사용
  // (페이지가 매 렌더마다 새 data 객체를 만들어도 내용이 같으면 재요청하지 않음)
  const sig = useMemo(
    () =>
      JSON.stringify({
        metric: metric ?? null,
        userId: userId ?? null,
        data: data ?? null,
      }),
    [metric, userId, data],
  );

  useEffect(() => {
    const { metric: m, userId: uid, data: d } = JSON.parse(sig);
    if (!m || !uid) return;
    // 분석할 값이 하나도 없으면 호출하지 않음 (플레이스홀더 유지)
    const hasData =
      d &&
      Object.values(d).some((v) =>
        Array.isArray(v) ? v.length > 0 : v != null,
      );
    if (!hasData) return;

    let cancelled = false;
    (async () => {
      setLoading(true);
      setError(false);
      try {
        const res = await fetch(`${AI_SERVICE}/analyze`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            userId: Number(uid),
            metric: m,
            data: d,
            token: localStorage.getItem("accessToken"),
          }),
        });
        if (!res.ok) throw new Error("analyze failed");
        const json = await res.json();
        if (!cancelled) setAnalysis(json.analysis || "");
      } catch {
        if (!cancelled) setError(true);
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [sig]);

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
      <div className="flex min-h-0 flex-1 flex-col overflow-y-auto rounded-[12px] border border-dashed border-white/30 bg-white/10 px-4 py-6 backdrop-blur-sm">
        {loading ? (
          <div className="flex flex-1 flex-col items-center justify-center text-center">
            <Sparkles
              className="mb-3 h-6 w-6 animate-pulse text-white/80"
              strokeWidth={1.8}
            />
            <p className="text-sm font-semibold text-white">분석 중입니다…</p>
          </div>
        ) : analysis ? (
          <p className="whitespace-pre-wrap text-[13.5px] leading-relaxed text-white/95">
            {analysis}
          </p>
        ) : error ? (
          <div className="flex flex-1 flex-col items-center justify-center text-center">
            <p className="text-sm font-semibold text-white">
              분석을 불러오지 못했어요
            </p>
            <p className="mt-1 text-xs text-white/75">
              잠시 후 다시 시도해 주세요
            </p>
          </div>
        ) : (
          <div className="flex flex-1 flex-col items-center justify-center text-center">
            <Sparkles className="mb-3 h-6 w-6 text-white/80" strokeWidth={1.8} />
            <p className="text-sm font-semibold text-white">
              분석 결과를 준비 중입니다
            </p>
            <p className="mt-1 text-xs text-white/75">
              데이터가 누적되면 맞춤 인사이트를 제공해드려요
            </p>
          </div>
        )}
      </div>
    </aside>
  );
}
