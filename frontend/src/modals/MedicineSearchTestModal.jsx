// src/components/MedicineSearchModal.jsx
import { useState } from "react";
import medicineApi from "../api/medicineApi";

export default function MedicineSearchTestModal({ isOpen, onClose, onSaved }) {
  const [keyword, setKeyword] = useState("");
  const [medicine, setMedicine] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSearch = async () => {
    if (!keyword.trim()) return;
    setLoading(true);
    setError("");
    setMedicine(null);
    try {
      const { data } = await medicineApi.search(keyword.trim());
      setMedicine(data);
      onSaved?.(data);
    } catch (e) {
      setError(
        e.response?.status === 404
          ? "해당 의약품을 찾을 수 없습니다."
          : "조회 중 오류가 발생했습니다."
      );
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setKeyword("");
    setMedicine(null);
    setError("");
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4"
      onClick={handleClose}
    >
      <div
        className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-gray-900">의약품 검색</h2>
          <button
            onClick={handleClose}
            className="text-gray-400 hover:text-gray-600"
          >
            ✕
          </button>
        </div>

        {/* Search */}
        <div className="flex gap-2">
          <input
            type="text"
            value={keyword}
            onChange={(e) => setKeyword(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSearch()}
            placeholder="예: 모티리톤정"
            className="flex-1 rounded-lg bg-gray-100 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-[#2563EB]"
          />
          <button
            onClick={handleSearch}
            disabled={loading}
            className="rounded-lg bg-[#2563EB] px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50"
          >
            {loading ? "조회중..." : "조회"}
          </button>
        </div>

        {/* Error */}
        {error && <p className="mt-3 text-sm text-red-500">{error}</p>}

        {/* Result */}
        {medicine && (
          <div className="mt-4 rounded-xl bg-[#EAF2FF] p-4 text-sm">
            <dl className="grid grid-cols-[100px_1fr] gap-y-2">
              <dt className="text-gray-500">품목기준코드</dt>
              <dd className="text-gray-800">{medicine.itemSeq || "-"}</dd>

              <dt className="text-gray-500">성상</dt>
              <dd className="text-gray-800">{medicine.chart || "-"}</dd>

              <dt className="text-gray-500">저장방법</dt>
              <dd className="text-gray-800">{medicine.storageMethod || "-"}</dd>
            </dl>
          </div>
        )}
      </div>
    </div>
  );
}