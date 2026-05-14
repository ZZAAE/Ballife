import { useState } from "react";
import { Plus, Trash2, Upload, X } from "lucide-react";

/* ──────────────────────────────────────────────────────────────────────────
 * 더미 데이터 (실제로는 OCR 결과로 채워질 예정)
 * ──────────────────────────────────────────────────────────────────────── */
const initialMedicines = [
  { id: 1, name: "아스피린 100mg", category: "항혈소판제", dosage: "500mg", imageType: "white" },
  { id: 2, name: "아스피린 100mg", category: "항혈소판제", dosage: "500mg", imageType: "pink" },
  { id: 3, name: "아스피린 100mg", category: "항혈소판제", dosage: "500mg", imageType: "whiteBlue" },
  { id: 4, name: "리피토 정 10mg", category: "고지혈증 치료제", dosage: "250mg", imageType: "yellow" },
];

/* ──────────────────────────────────────────────────────────────────────────
 * 약 썸네일 (참고 코드 톤과 통일, 모달 사이즈에 맞춰 축소)
 * ──────────────────────────────────────────────────────────────────────── */
function MedicineThumb({ type }) {
  const wrap = "w-9 h-9 rounded-lg bg-[#EAF2FF] relative overflow-hidden flex items-center justify-center shrink-0";

  if (type === "yellow") {
    return (
      <div className={wrap}>
        <div className="w-4 h-4 rounded-full bg-[#F2C36A]" />
      </div>
    );
  }
  if (type === "pink") {
    return (
      <div className={wrap}>
        <div className="w-4 h-4 rounded-full bg-[#F8D7DA] border border-pink-200" />
      </div>
    );
  }
  if (type === "whiteBlue") {
    return (
      <div className={wrap}>
        <div className="w-5 h-2.5 rounded-full bg-white border border-blue-100" />
      </div>
    );
  }
  return (
    <div className={wrap}>
      <div className="w-5 h-2.5 rounded-full bg-white border border-gray-200" />
    </div>
  );
}

/* ──────────────────────────────────────────────────────────────────────────
 * 처방전 등록 모달
 *  props:
 *   - open:      모달 열림 여부
 *   - onClose:   닫기 핸들러
 *   - onSaved:   저장 성공 시 콜백 (서버 응답 전달)
 *   - title:     상단 타이틀 (기본값 "아침 복약")
 *   - submitUrl: 스프링부트 엔드포인트
 * ──────────────────────────────────────────────────────────────────────── */
export default function PrescriptionRegisterModal({
  open,
  onClose,
  onSaved,
  title = "아침 복약",
  submitUrl = "/api/prescriptions",
}) {
  const [file, setFile] = useState(null);
  const [groupName, setGroupName] = useState("혈압약");
  const [memo, setMemo] = useState("");
  const [medicines, setMedicines] = useState(initialMedicines);
  const [submitting, setSubmitting] = useState(false);

  if (!open) return null;

  const handleFileChange = (e) => {
    const f = e.target.files?.[0];
    if (!f) return;
    setFile(f);
    // TODO: 여기서 OCR API 호출 → 응답으로 받은 약품 목록을 setMedicines(...) 로 채우기
  };

  const handleMedicineChange = (id, key, value) => {
    setMedicines((prev) => prev.map((m) => (m.id === id ? { ...m, [key]: value } : m)));
  };

  const handleDelete = (id) => {
    setMedicines((prev) => prev.filter((m) => m.id !== id));
  };

  const handleAddRow = () => {
    setMedicines((prev) => [
      ...prev,
      { id: Date.now(), name: "", category: "", dosage: "", imageType: "white" },
    ]);
  };

  const handleSubmit = async () => {
    if (!groupName.trim()) {
      alert("처방 그룹 이름을 입력해주세요.");
      return;
    }

    setSubmitting(true);

    // 서버 전송 payload (이름, 메모, 복약 상세 정보)
    const payload = {
      groupName: groupName.trim(),
      memo: memo.trim(),
      medicines: medicines.map(({ id, imageType, ...rest }) => rest),
    };

    try {
      const res = await fetch(submitUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json().catch(() => ({}));
      onSaved?.(data);
      onClose?.();
    } catch (err) {
      console.error("처방전 저장 실패:", err);
      alert("저장 중 오류가 발생했습니다. 잠시 후 다시 시도해주세요.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/30 flex items-center justify-center px-4">
      <div className="w-full max-w-[560px] max-h-[92vh] bg-white rounded-2xl shadow-2xl overflow-hidden flex flex-col">
        {/* ───────── 헤더 ───────── */}
        <div className="px-7 pt-6 pb-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-[#2563EB]">
              <svg
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <rect x="3" y="4" width="18" height="16" rx="3" />
                <path d="M12 9v6M9 12h6" />
              </svg>
            </span>
            <h2 className="text-[17px] font-semibold text-gray-800">{title}</h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-full flex items-center justify-center hover:bg-gray-100 transition"
            aria-label="닫기"
          >
            <X className="w-4 h-4 text-gray-500" />
          </button>
        </div>

        {/* ───────── 본문 (스크롤) ───────── */}
        <div className="px-7 pb-6 overflow-y-auto flex-1 space-y-5">
          {/* 약 처방 스캔 */}
          <div>
            <label className="block text-[13px] font-medium text-gray-700 mb-2">약 처방 스캔</label>
            <div className="flex items-stretch gap-2">
              <div className="flex-1 h-11 px-4 rounded-xl bg-gray-100 flex items-center text-[13px] text-gray-500 truncate">
                {file ? file.name : <span className="text-gray-400">파일 첨부</span>}
              </div>
              <label className="h-11 px-5 rounded-xl border border-[#2563EB]/30 text-[#2563EB] text-[13px] font-medium flex items-center gap-1.5 cursor-pointer hover:bg-blue-50 transition shrink-0">
                <Upload className="w-3.5 h-3.5" />
                업로드
                <input
                  type="file"
                  accept="image/*,.pdf"
                  className="hidden"
                  onChange={handleFileChange}
                />
              </label>
            </div>
          </div>

          {/* 처방 그룹 이름 */}
          <div>
            <label className="block text-[13px] font-medium text-gray-700 mb-2">처방 그룹 이름</label>
            <input
              type="text"
              value={groupName}
              onChange={(e) => setGroupName(e.target.value)}
              placeholder="예: 혈압약"
              className="w-full h-11 px-4 rounded-xl bg-gray-100 text-[14px] font-medium text-gray-800 placeholder:text-gray-400 placeholder:font-normal outline-none focus:ring-2 focus:ring-[#2563EB]/30 transition"
            />
          </div>

          {/* 메모 */}
          <div>
            <label className="block text-[13px] font-medium text-gray-700 mb-2">메모</label>
            <input
              type="text"
              value={memo}
              onChange={(e) => setMemo(e.target.value)}
              placeholder="메모 입력..."
              className="w-full h-11 px-4 rounded-xl bg-gray-100 text-[14px] text-gray-700 placeholder:text-gray-400 outline-none focus:ring-2 focus:ring-[#2563EB]/30 transition"
            />
          </div>

          {/* 복약 상세 정보 */}
          <div>
            <label className="block text-[13px] font-medium text-gray-700 mb-2">복약 상세 정보</label>
            <div className="rounded-xl border border-gray-100 overflow-hidden">
              {/* 테이블 헤더 */}
              <div className="grid grid-cols-[1fr_110px_40px] gap-3 px-4 py-2.5 text-[11px] font-medium text-gray-400 bg-gray-50 border-b border-gray-100">
                <span>이름</span>
                <span className="text-right">용량 (MG/PILL)</span>
                <span className="text-center">관리</span>
              </div>

              {/* 약품 행 */}
              <div className="bg-white">
                {medicines.length === 0 && (
                  <div className="px-4 py-8 text-center text-[13px] text-gray-400">
                    아직 등록된 약품이 없습니다.
                  </div>
                )}

                {medicines.map((medicine, idx) => (
                  <div
                    key={medicine.id}
                    className={`grid grid-cols-[1fr_110px_40px] gap-3 items-center px-4 py-3 ${
                      idx !== medicines.length - 1 ? "border-b border-gray-100" : ""
                    }`}
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <MedicineThumb type={medicine.imageType} />
                      <div className="min-w-0 flex-1">
                        <input
                          type="text"
                          value={medicine.name}
                          onChange={(e) => handleMedicineChange(medicine.id, "name", e.target.value)}
                          placeholder="약 이름"
                          className="block w-full text-[14px] font-semibold text-gray-800 bg-transparent outline-none placeholder:font-normal placeholder:text-gray-300"
                        />
                        <input
                          type="text"
                          value={medicine.category}
                          onChange={(e) =>
                            handleMedicineChange(medicine.id, "category", e.target.value)
                          }
                          placeholder="분류"
                          className="block w-full text-[11px] text-gray-400 bg-transparent outline-none placeholder:text-gray-300"
                        />
                      </div>
                    </div>

                    <input
                      type="text"
                      value={medicine.dosage}
                      onChange={(e) => handleMedicineChange(medicine.id, "dosage", e.target.value)}
                      placeholder="500mg"
                      className="text-[13px] text-gray-700 bg-transparent outline-none text-right placeholder:text-gray-300"
                    />

                    <button
                      type="button"
                      onClick={() => handleDelete(medicine.id)}
                      className="justify-self-center text-red-400 hover:text-red-500 transition"
                      aria-label="행 삭제"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}

                {/* 행 추가하기 */}
                <button
                  type="button"
                  onClick={handleAddRow}
                  className="w-full py-3 flex items-center justify-center gap-1.5 text-[13px] text-[#2563EB] hover:bg-blue-50/50 transition border-t border-gray-100"
                >
                  <Plus className="w-3.5 h-3.5" />
                  행 추가하기
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* ───────── 푸터 ───────── */}
        <div className="px-7 py-4 flex justify-end border-t border-gray-100 bg-white">
          <button
            type="button"
            disabled={submitting}
            onClick={handleSubmit}
            className="h-10 px-6 rounded-xl bg-gray-900 text-white text-[13px] font-medium hover:bg-gray-800 transition disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {submitting ? "저장 중..." : "저장하기"}
          </button>
        </div>
      </div>
    </div>
  );
}
