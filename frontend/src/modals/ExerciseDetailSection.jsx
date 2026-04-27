import { useState } from "react";
import { Plus, Trash2 } from "lucide-react";
import AnaerobicFields from "./AnaerobicFields";
import AerobicFields from "./AerobicFields";

let nextId = 1;

function ExerciseDetailSection({ activeTab }) {
  const [anaerobicRows, setAnaerobicRows] = useState([]);
  const [aerobicRows, setAerobicRows] = useState([]);

  const rows = activeTab === "anaerobic" ? anaerobicRows : aerobicRows;

  const addRow = () => {
    if (activeTab === "anaerobic") {
      setAnaerobicRows((prev) => [...prev, { id: nextId++ }]);
    } else {
      setAerobicRows((prev) => [...prev, { id: nextId++ }]);
    }
  };

  const removeRow = (id) => {
    if (activeTab === "anaerobic") {
      setAnaerobicRows((prev) => prev.filter((r) => r.id !== id));
    } else {
      setAerobicRows((prev) => prev.filter((r) => r.id !== id));
    }
  };

  return (
    <div>
      <div className="mb-4 flex items-center justify-between">
        <label className="text-xs font-medium text-gray-500">
          세트별 상세 기록
        </label>

        <span className="rounded-md bg-blue-100 px-2 py-1 text-[10px] font-bold text-blue-600">
          기록 중
        </span>
      </div>

      <div className="space-y-3">
        {rows.map((row) => (
          <div
            key={row.id}
            className="rounded-2xl border border-gray-100 bg-gray-50/50 p-4"
          >
            <div className="flex items-end gap-2">
              {activeTab === "anaerobic" ? (
                <AnaerobicFields />
              ) : (
                <AerobicFields />
              )}

              <button
                onClick={() => removeRow(row.id)}
                className="mb-0.5 p-2 text-red-400 transition-colors hover:text-red-600"
              >
                <Trash2 size={20} />
              </button>
            </div>
          </div>
        ))}
      </div>

      <button
        onClick={addRow}
        className="mt-4 flex w-full items-center justify-center gap-2 rounded-2xl border-2 border-dashed border-gray-100 py-4 text-sm font-medium text-gray-500 transition-all hover:bg-gray-50"
      >
        <Plus size={18} />
        추가하기
      </button>
    </div>
  );
}

export default ExerciseDetailSection;
