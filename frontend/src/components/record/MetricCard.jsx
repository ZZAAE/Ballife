export default function MetricCard({ children, className = "" }) {
  return <div className={`rounded-xl border border-gray-200 bg-white p-6 ${className}`}>{children}</div>;
}
// 상단 카드 컴포넌트