function CardRow({ label, value }) {
  return (
    <div className="flex items-center justify-between rounded-md bg-[#f3f6f9] px-3 py-2 text-xs">
      <span className="text-[#4b5563]">{label}</span>
      <span className="font-medium text-[#111827]">{value}</span>
    </div>
  );
}

export default CardRow;
