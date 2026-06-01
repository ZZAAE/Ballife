import { useState, useEffect } from "react";
import { Search, X, Pill, PlusSquare } from "lucide-react";
import medicineApi from "../api/medicineApi";

// 용법용량(dosage)에 섞여 오는 HTML/표 마크업을 제거하고 공백 정리
function stripHtml(text) {
  if (!text) return "";
  return text
    .replace(/<[^>]*>/g, " ") // 태그 제거
    .replace(/&[a-z]+;/gi, " ") // &nbsp; 등 엔티티 제거
    .replace(/\s+/g, " ")
    .trim();
}

// 식약처 의약품 API 응답(Medicine)을 모달 리스트 형태로 변환
function toMedicineItem(m) {
  const isOtc = m.etcOtcCode?.includes("일반"); // 일반의약품 = 상비약
  const cleanDosage = stripHtml(m.dosage);
  return {
    id: m.itemSeq,
    name: m.itemName,
    subText: m.etcOtcCode || m.efficacy?.slice(0, 20) || "",
    // 표 형태 용법용량은 너무 길어서 앞부분만 노출
    dosage: cleanDosage ? cleanDosage.slice(0, 40) : "-",
    type: isOtc ? "blue" : "orange",
  };
}

function MedicineIcon({ type }) {
  if (type === "blue") {
    return (
      <div className="w-10 h-10 rounded-xl bg-[#EEF4FF] flex items-center justify-center">
        <Pill className="w-4 h-4 text-[#2563EB]" />
      </div>
    );
  }

  return (
    <div className="w-10 h-10 rounded-xl bg-[#FFF3E8] flex items-center justify-center">
      <PlusSquare className="w-4 h-4 text-[#C2410C]" />
    </div>
  );
}

export default function SearchMedicineModal({
  open,
  onClose,
  onSelectMedicine,
}) {
  const [keyword, setKeyword] = useState("");
  const [medicineList, setMedicineList] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // 모달이 닫히면 검색 결과를 초기 상태로 되돌린다
  useEffect(() => {
    if (!open) {
      setKeyword("");
      setMedicineList([]);
      setError("");
      setLoading(false);
    }
  }, [open]);

  const handleSearch = async () => {
    if (!keyword.trim()) return;
    setLoading(true);
    setError("");
    try {
      const { data } = await medicineApi.search(keyword.trim());
      // 백엔드가 단건을 반환하므로 배열로 감싼다
      const list = Array.isArray(data) ? data : [data];
      setMedicineList(list.map(toMedicineItem));
    } catch (e) {
      setError(
        e.response?.status === 404
          ? "해당 의약품을 찾을 수 없습니다."
          : "조회 중 오류가 발생했습니다."
      );
      setMedicineList([]);
    } finally {
      setLoading(false);
    }
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/30 flex items-center justify-center px-4">
      <div className="w-full max-w-[760px] rounded-2xl bg-white shadow-2xl overflow-hidden">
        {/* 상단 */}
        <div className="flex items-center justify-between px-8 py-6 border-b border-gray-100">
          <div className="flex items-center gap-3">
            <Search className="w-5 h-5 text-[#2563EB]" />
            <h2 className="text-[28px] font-semibold text-gray-800">검색</h2>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="w-9 h-9 rounded-full flex items-center justify-center hover:bg-gray-100 transition"
          >
            <X className="w-5 h-5 text-gray-600" />
          </button>
        </div>

        <div className="px-8 py-8">
          {/* 검색 영역 */}
          <div className="mb-8">
            <label className="block text-[14px] font-semibold text-gray-600 mb-3">
              약물 이름 검색
            </label>

            <div className="flex gap-2">
              <div className="relative flex-1">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  value={keyword}
                  onChange={(e) => setKeyword(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleSearch()}
                  placeholder="약물 이름을 입력하거나 선택하세요"
                  className="w-full h-[52px] rounded-xl bg-[#F6F7FB] border border-transparent focus:border-[#2563EB] outline-none pl-11 pr-4 text-[14px] text-gray-700 placeholder:text-gray-400"
                />
              </div>
              <button
                type="button"
                onClick={handleSearch}
                disabled={loading}
                className="h-[52px] px-6 rounded-xl bg-[#2563EB] text-white text-[14px] font-semibold hover:bg-blue-700 transition disabled:opacity-50"
              >
                {loading ? "조회중..." : "검색"}
              </button>
            </div>

            {error && <p className="mt-3 text-[13px] text-red-500">{error}</p>}
          </div>

          {/* 복용 상세 정보 */}
          <div>
            <p className="text-[14px] font-semibold text-gray-600 mb-3">
              복용 상세 정보
            </p>

            <div className="rounded-2xl border border-gray-200 overflow-hidden">
              {/* 헤더 */}
              <div className="grid grid-cols-[1.6fr_0.8fr] bg-[#F8FAFC] px-6 py-4 border-b border-gray-200">
                <span className="text-[12px] font-semibold text-gray-400">
                  이름
                </span>
                <span className="text-[12px] font-semibold text-gray-400 text-right">
                  용량 (MG/PILL)
                </span>
              </div>

              {/* 리스트 */}
              {medicineList.length === 0 && (
                <div className="px-6 py-10 text-center text-[14px] text-gray-400">
                  약물 이름을 검색해 주세요.
                </div>
              )}

              {medicineList.map((medicine, index) => (
                <button
                  key={medicine.id}
                  type="button"
                  onClick={() => onSelectMedicine?.(medicine)}
                  className={`w-full grid grid-cols-[1.6fr_0.8fr] items-center px-6 py-5 text-left hover:bg-gray-50 transition ${
                    index !== medicineList.length - 1
                      ? "border-b border-gray-100"
                      : ""
                  }`}
                >
                  <div className="flex items-center gap-4 min-w-0">
                    <MedicineIcon type={medicine.type} />

                    <div className="min-w-0">
                      <p className="text-[16px] font-semibold text-gray-900 truncate">
                        {medicine.name}
                      </p>
                      <p className="text-[13px] text-gray-500 mt-1">
                        {medicine.subText}
                      </p>
                    </div>
                  </div>

                  <div className="text-right text-[13px] font-semibold text-gray-700 break-words">
                    {medicine.dosage}
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}