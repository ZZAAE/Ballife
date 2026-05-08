// 표 안에 상태 컴포넌트 (예: 정상, 경고 등)
const styles = {
  normal: "bg-blue-50 text-blue-700 ring-1 ring-blue-100",
  warning: "bg-amber-50 text-amber-700 ring-1 ring-amber-100",
};

export default function StatusBadge({ status, type = "normal" }) {
  return (
    <span className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${styles[type] || styles.normal}`}>
      {status}
    </span>
  );
}