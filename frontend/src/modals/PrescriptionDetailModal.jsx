import { useState } from "react";
import { Check, Pencil, Trash2, X } from "lucide-react";

function MedicineThumb({ type }) {
  if (type === "yellow") {
    return (
      <div className="w-[92px] h-[52px] rounded-xl bg-[#B9CEF8] relative overflow-hidden">
        <div className="absolute left-3 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-[#F2C36A]" />
        <div className="absolute right-3 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-[#F2C36A]" />
      </div>
    );
  }

  if (type === "green") {
    return (
      <div className="w-[92px] h-[52px] rounded-xl bg-[#B9CEF8] relative overflow-hidden">
        <div className="absolute left-3 top-1/2 -translate-y-1/2 w-8 h-4 rounded-full bg-[#9DB37A] rotate-[-10deg]" />
        <div className="absolute right-3 top-1/2 -translate-y-1/2 w-8 h-4 rounded-full bg-[#9DB37A] rotate-[10deg]" />
      </div>
    );
  }

  if (type === "whiteBlue") {
    return (
      <div className="w-[92px] h-[52px] rounded-xl bg-[#B9CEF8] relative overflow-hidden">
        <div className="absolute left-3 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-[#F3F4F6] border border-gray-200" />
        <div className="absolute right-3 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-[#EAF2FF] border border-blue-100" />
      </div>
    );
  }

  if (type === "pink") {
    return (
      <div className="w-[92px] h-[52px] rounded-xl bg-[#B9CEF8] relative overflow-hidden">
        <div className="absolute left-3 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-[#F8D7DA] border border-pink-200" />
        <div className="absolute right-3 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-white border border-gray-200" />
      </div>
    );
  }

  return (
    <div className="w-[92px] h-[52px] rounded-xl bg-[#B9CEF8] relative overflow-hidden">
      <div className="absolute left-3 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-white border border-gray-200" />
      <div className="absolute right-3 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-white border border-gray-200" />
    </div>
  );
}

const EDIT_INPUT_CLASS =
  "w-full rounded-[10px] border border-[#E5E7EB] bg-white px-3 py-2 text-[14px] text-gray-800 outline-none focus:border-[#94A3B8] focus:ring-2 focus:ring-slate-100";

// 약 목록은 부모(MedicationPage)의 처방 그룹 상태를 그대로 반영(group.medicines).
// 삭제/수정은 콜백으로 부모 상태를 갱신 → 약 페이지 전체에 즉시 반영된다.
export default function PrescriptionDetailModal({
  open,
  group,
  onClose,
  onDeleteMedicine,
  onUpdateMedicine,
}) {
  const [editingId, setEditingId] = useState(null);
  const [draft, setDraft] = useState({ name: "", purpose: "", dosageText: "" });

  if (!open || !group) return null;

  const medicines = group.medicines ?? [];

  const startEdit = (medicine) => {
    setEditingId(medicine.id);
    setDraft({
      name: medicine.name,
      purpose: medicine.purpose,
      dosageText: medicine.dosageText,
    });
  };

  const cancelEdit = () => setEditingId(null);

  const saveEdit = (id) => {
    const patch = { purpose: draft.purpose, dosageText: draft.dosageText };
    const trimmedName = draft.name.trim();
    if (trimmedName) patch.name = trimmedName;
    onUpdateMedicine?.(group.id, id, patch);
    setEditingId(null);
  };

  const handleDelete = (id) => {
    onDeleteMedicine?.(group.id, id);
    if (editingId === id) setEditingId(null);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/30 flex items-center justify-center px-4 py-6">
      <div className="flex w-full max-w-[900px] max-h-[90vh] flex-col overflow-hidden rounded-2xl bg-[#F3F4F6] shadow-2xl">
        <div className="flex shrink-0 items-start justify-between px-5 md:px-8 pt-8 pb-6">
          <div>
            <h2 className="text-[30px] font-semibold text-gray-700 leading-tight">
              나의 [{group.groupName}] 처방 목록
            </h2>
            <p className="mt-2 text-[14px] text-gray-400">
              총 {medicines.length}개의 약이 처방되어 있습니다.
            </p>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center hover:bg-gray-300 transition"
          >
            <X className="w-5 h-5 text-gray-600" />
          </button>
        </div>

        <div className="space-y-5 overflow-y-auto px-5 md:px-8 pb-8 max-h-[min(540px,calc(90vh-160px))]">
          {medicines.length === 0 ? (
            <div className="bg-white rounded-2xl px-5 py-12 text-center text-[15px] text-gray-400 shadow-sm">
              처방된 약이 없습니다. 약을 모두 삭제하면 이 그룹은 복용 일정·이행률에서도 사라집니다.
            </div>
          ) : (
            medicines.map((medicine) => {
              const isEditing = editingId === medicine.id;
              return (
                <div
                  key={medicine.id}
                  className="bg-white rounded-2xl px-5 py-5 shadow-sm flex flex-col sm:flex-row sm:items-center gap-5"
                >
                  <MedicineThumb type={medicine.imageType} />

                  <div className="flex-1 min-w-0 grid grid-cols-1 md:grid-cols-3 gap-6">
                    {isEditing ? (
                      <>
                        <input
                          value={draft.name}
                          onChange={(e) =>
                            setDraft((d) => ({ ...d, name: e.target.value }))
                          }
                          placeholder="약 이름"
                          className={EDIT_INPUT_CLASS}
                        />
                        <input
                          value={draft.purpose}
                          onChange={(e) =>
                            setDraft((d) => ({ ...d, purpose: e.target.value }))
                          }
                          placeholder="효능"
                          className={EDIT_INPUT_CLASS}
                        />
                        <input
                          value={draft.dosageText}
                          onChange={(e) =>
                            setDraft((d) => ({
                              ...d,
                              dosageText: e.target.value,
                            }))
                          }
                          placeholder="복용법"
                          className={EDIT_INPUT_CLASS}
                        />
                      </>
                    ) : (
                      <>
                        <div>
                          <p className="text-[18px] font-semibold text-gray-800">
                            {medicine.name}
                          </p>
                        </div>

                        <div>
                          <p className="text-[15px] text-gray-700">
                            {medicine.purpose}
                          </p>
                        </div>

                        <div>
                          <p className="text-[15px] text-gray-700 whitespace-pre-line">
                            {medicine.dosageText}
                          </p>
                        </div>
                      </>
                    )}
                  </div>

                  <div className="flex items-center gap-3">
                    {isEditing ? (
                      <>
                        <button
                          type="button"
                          onClick={() => saveEdit(medicine.id)}
                          className="text-[#2563EB] hover:text-blue-700"
                          aria-label="저장"
                        >
                          <Check className="w-4 h-4" />
                        </button>
                        <button
                          type="button"
                          onClick={cancelEdit}
                          className="text-gray-400 hover:text-gray-600"
                          aria-label="취소"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </>
                    ) : (
                      <>
                        <button
                          type="button"
                          onClick={() => startEdit(medicine)}
                          className="text-gray-500 hover:text-gray-700"
                          aria-label="수정"
                        >
                          <Pencil className="w-4 h-4" />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDelete(medicine.id)}
                          className="text-red-400 hover:text-red-500"
                          aria-label="삭제"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </>
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}
