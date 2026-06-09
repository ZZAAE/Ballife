// src/components/MedicineSearchModal.jsx
import { useState } from "react";
import { useTranslation } from "react-i18next";
import medicineApi from "../api/medicineApi";

export default function MedicineSearchTestModal({ isOpen, onClose, onSaved }) {
  const { t } = useTranslation();
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
          ? t("medicineSearchTestModal.error.notFound")
          : t("medicineSearchTestModal.error.searchFailed")
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
          <h2 className="text-lg font-semibold text-gray-900">{t("medicineSearchTestModal.title")}</h2>
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
            placeholder={t("medicineSearchTestModal.searchPlaceholder")}
            className="flex-1 rounded-lg bg-gray-100 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-[#2563EB]"
          />
          <button
            onClick={handleSearch}
            disabled={loading}
            className="rounded-lg bg-[#2563EB] px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50"
          >
            {loading ? t("medicineSearchTestModal.searching") : t("medicineSearchTestModal.search")}
          </button>
        </div>

        {/* Error */}
        {error && <p className="mt-3 text-sm text-red-500">{error}</p>}

        {/* Result */}
        {medicine && (
          <div className="mt-4 rounded-xl bg-[#EAF2FF] p-4 text-sm">
            <dl className="grid grid-cols-[100px_1fr] gap-y-2">
              <dt className="text-gray-500">{t("medicineSearchTestModal.itemSeqLabel")}</dt>
              <dd className="text-gray-800">{medicine.itemSeq || "-"}</dd>

              <dt className="text-gray-500">{t("medicineSearchTestModal.chartLabel")}</dt>
              <dd className="text-gray-800">{medicine.chart || "-"}</dd>

              <dt className="text-gray-500">{t("medicineSearchTestModal.storageMethodLabel")}</dt>
              <dd className="text-gray-800">{medicine.storageMethod || "-"}</dd>
            </dl>
          </div>
        )}
      </div>
    </div>
  );
}