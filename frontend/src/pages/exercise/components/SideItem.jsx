function SideItem({ label, active = false }) {
  return (
    <button
      className={`flex w-full items-center rounded-full px-3 py-2 text-left ${
        active ? "bg-white shadow-sm" : "bg-transparent"
      }`}
    >
      <span className="text-sm text-[#111827]">{label}</span>
    </button>
  );
}

export default SideItem;
