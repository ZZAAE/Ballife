export default function MetricCard({ children, className = "" }) {
  return (
    <div
      className={`flex min-h-[160px] flex-col rounded-[18px] border border-[#E5E7EB] bg-white p-5 shadow-[0_4px_16px_rgba(15,23,42,0.04)] ${className}`}
    >
      {children}
    </div>
  );
}
// 상단 카드 컴포넌트