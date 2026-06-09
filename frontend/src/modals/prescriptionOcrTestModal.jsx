import { useState, useRef } from "react";
import { useTranslation } from "react-i18next";
import { X, ImagePlus, Loader2, Trash2, Plus } from "lucide-react";
import toast from "react-hot-toast";
import medicineApi from "../api/medicineApi";
import SearchMedicineModal from "./SearchMedicineModal";

// 복용 시간대 옵션 (이 순서대로 intakeIntervals 문자열을 구성)
const INTAKE_OPTIONS = ["아침", "점심", "저녁", "취침전"];
// 모달 기본 선택값 (아침·점심·저녁)
const DEFAULT_INTAKE_INTERVALS = ["아침", "점심", "저녁"];

/**
 * 처방전 OCR 테스트용 모달 (라이트 테마)
 * - 이미지를 선택하면 원본 파일을 그대로 multipart/form-data로 백엔드에 전송
 *   (base64 변환은 백엔드에서 수행)
 * - 백엔드는 OCR로 추출한 "약이름 문자열 목록"만 반환한다고 가정 (테스트 단계)
 */
export default function PrescriptionOcrTestModal({
  isOpen,
  onClose,
  onSaved,
  prescription = null,
}) {
  const { t } = useTranslation();
  const isEdit = !!prescription;
  const fileInputRef = useRef(null);

  // 복용 시간대 표시 라벨 (저장/비교값은 INTAKE_OPTIONS 그대로 유지)
  const intakeOptionLabels = {
    아침: t("prescriptionOcrTestModal.intakeOption.morning"),
    점심: t("prescriptionOcrTestModal.intakeOption.lunch"),
    저녁: t("prescriptionOcrTestModal.intakeOption.dinner"),
    취침전: t("prescriptionOcrTestModal.intakeOption.beforeSleep"),
  };

  // 수정 모드면 기존 처방전 값으로 초기화한다.
  // (수정 인스턴스는 처방전마다 key 로 remount 되므로 초기값이 매번 갱신된다)
  const [preview, setPreview] = useState(null);          // 이미지 미리보기 URL
  const [fileName, setFileName] = useState("");
  const [medicineNames, setMedicineNames] = useState(() =>
    (prescription?.medicines ?? [])
      .map((m) => (typeof m === "string" ? m : m.medicineName))
      .filter(Boolean),
  ); // OCR로 추출된 약이름 목록
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [searchOpen, setSearchOpen] = useState(false);   // 약 수동 추가용 검색 모달
  const [prescriptionName, setPrescriptionName] = useState(
    prescription?.prescriptionName ?? "",
  );  // 처방전 이름
  const [memo, setMemo] = useState(prescription?.memo ?? "");  // 처방전 메모
  const [intakeIntervals, setIntakeIntervals] = useState(() =>
    prescription?.intakeIntervals
      ? prescription.intakeIntervals.split(",").filter(Boolean)
      : DEFAULT_INTAKE_INTERVALS,
  );  // 복용 시간대 (기본: 아침/점심/저녁)

  if (!isOpen) return null;

  // 모달을 닫으면서 이전 입력 내용을 모두 초기화 (다시 열 때 깨끗한 상태)
  const handleClose = () => {
    if (preview) URL.revokeObjectURL(preview);
    setPreview(null);
    setFileName("");
    setMedicineNames([]);
    setLoading(false);
    setError("");
    setSearchOpen(false);
    setPrescriptionName("");
    setMemo("");
    setIntakeIntervals(DEFAULT_INTAKE_INTERVALS);
    if (fileInputRef.current) fileInputRef.current.value = "";
    onClose?.();
  };

  const handleSelectClick = () => fileInputRef.current?.click();

  // 약 이름 목록에서 특정 항목 삭제
  const handleRemoveMedicine = (targetIdx) => {
    setMedicineNames((prev) => prev.filter((_, idx) => idx !== targetIdx));
  };

  // 복용 시간대 체크 토글 (INTAKE_OPTIONS 순서 유지)
  const handleToggleInterval = (option) => {
    setIntakeIntervals((prev) =>
      prev.includes(option)
        ? prev.filter((o) => o !== option)
        : INTAKE_OPTIONS.filter((o) => prev.includes(o) || o === option),
    );
  };

  // 등록 버튼
  const handleRegister = async () => {
    if (!prescriptionName.trim()) {
      toast.error(t("prescriptionOcrTestModal.toast.nameRequired"));
      return;
    }
    if (medicineNames.length === 0) {
      toast.error(t("prescriptionOcrTestModal.toast.noMedicine"));
      return;
    }
    // 백엔드 Prescription.intakeIntervals 는 "아침,점심,저녁" 형태의 콤마 문자열
    const intakeIntervalsStr = intakeIntervals.join(",");

    const payload = {
      prescriptionName,
      memo,
      intakeIntervals: intakeIntervalsStr,
      medicines: medicineNames.map((name) => ({ medicineName: name })),
      pCategory: "MEDICINE",
    };

    try {
      if (isEdit) {
        await medicineApi.updateMedicine(prescription.prescriptionId, payload);
        toast.success(t("prescriptionOcrTestModal.toast.updated"));
      } else {
        await medicineApi.registerMedicine(payload);
        toast.success(t("prescriptionOcrTestModal.toast.registered"));
      }
      // 부모(회원정보)가 서버에서 최신 목록을 다시 불러오도록 알린다.
      onSaved?.();
      handleClose();
    } catch (err) {
      console.error(isEdit ? "처방전 수정 실패" : "처방전 등록 실패", err);
    }
  };

  // SearchMedicineModal에서 선택한 약을 목록에 추가 (중복은 무시)
  const handleAddMedicine = (medicine) => {
    const name = typeof medicine === "string" ? medicine : medicine?.name;
    if (!name) {
      toast.error(t("prescriptionOcrTestModal.toast.nameFetchFailed"));
      return;
    }
    const exists = medicineNames.includes(name);
    // 추가한 약은 목록 맨 앞에 넣어 바로 보이게 한다.
    setMedicineNames((prev) => (prev.includes(name) ? prev : [name, ...prev]));
    setSearchOpen(false);
    if (exists) {
      toast.error(t("prescriptionOcrTestModal.toast.alreadyAdded"));
    } else {
      toast.success(t("prescriptionOcrTestModal.toast.added", { name }));
    }
  };

  const handleFileChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // 이전 미리보기 URL 정리
    if (preview) URL.revokeObjectURL(preview);

    setPreview(URL.createObjectURL(file));
    setFileName(file.name);
    setError("");
    setMedicineNames([]);
    setLoading(true);

    // ── 핵심: 이미지 원본을 그대로 백엔드로 전송 ──
    // FormData에 파일을 담아 보내면 백엔드(@RequestParam("image") MultipartFile)에서
    // 그대로 받아 base64 변환 후 OCR API를 호출할 수 있다.
    const formData = new FormData();
    formData.append("image", file);

    try {
      const res = await medicineApi.ocrScan(formData);
      const data = res.data;
      // 백엔드 응답: [{ medicineName: "..." }, ...] (MedicineItemResponse 목록)
      const list = Array.isArray(data) ? data : data.medicines ?? [];
      const names = list.map((item) =>
        typeof item === "string" ? item : item.medicineName,
      );
      setMedicineNames(names);
    } catch (err) {
      console.error("OCR 요청 실패", err);
      setError(t("prescriptionOcrTestModal.error.ocrFailed"));
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
    <div
      className="fixed inset-0 flex items-center justify-center"
      style={{ backgroundColor: "rgba(15, 23, 42, 0.45)", zIndex: 1000, padding: 16 }}
      onClick={handleClose}
    >
      {/* 모달 본체 */}
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          width: 520,
          maxWidth: "100%",
          height: "95vh",           // 모달 상하 길이 (화면의 95%)
          maxHeight: "95vh",        // 화면 높이를 넘지 않게 제한 (위아래 잘림 방지)
          overflow: "hidden",       // 모달 전체는 스크롤하지 않음 (목록 칸만 스크롤)
          boxSizing: "border-box",
          backgroundColor: "#FFFFFF",
          borderRadius: 24,
          padding: 22,
          boxShadow: "0 24px 64px rgba(15, 23, 42, 0.18)",
          display: "flex",
          flexDirection: "column",
          gap: 14,
        }}
      >
        {/* 헤더 */}
        <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between" }}>
          <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
            <span style={{ color: "#1B1F2A", fontSize: 22, fontWeight: 700 }}>
              {isEdit
                ? t("prescriptionOcrTestModal.title.edit")
                : t("prescriptionOcrTestModal.title.register")}
            </span>
            <span style={{ color: "#94A3B8", fontSize: 14 }}>
              {t("prescriptionOcrTestModal.subtitle")}
            </span>
          </div>
          <button
            onClick={handleClose}
            className="flex items-center justify-center"
            style={{
              width: 34,
              height: 34,
              borderRadius: 10,
              backgroundColor: "transparent",
              border: "none",
              cursor: "pointer",
              color: "#94A3B8",
            }}
          >
            <X size={20} />
          </button>
        </div>

        {/* 이미지 넣는 곳 */}
        <div
          onClick={handleSelectClick}
          className="flex flex-col items-center justify-center"
          style={{
            height: 120,
            flexShrink: 0,
            borderRadius: 20,
            border: "2px dashed #D5DCE6",
            backgroundColor: "#F6F8FB",
            cursor: "pointer",
            overflow: "hidden",
          }}
        >
          {preview ? (
            <img
              src={preview}
              alt={t("prescriptionOcrTestModal.imagePreviewAlt")}
              style={{ width: "100%", height: "100%", objectFit: "contain" }}
            />
          ) : (
            <>
              <ImagePlus size={40} style={{ color: "#94A3B8", marginBottom: 10 }} />
              <span style={{ color: "#64748B", fontSize: 15, fontWeight: 500 }}>
                {t("prescriptionOcrTestModal.imageDropTitle")}
              </span>
              <span style={{ color: "#A5B0C0", fontSize: 13, marginTop: 4 }}>
                {t("prescriptionOcrTestModal.imageDropHint")}
              </span>
            </>
          )}
        </div>

        {/* 선택된 파일명 */}
        {fileName && (
          <span style={{ color: "#94A3B8", fontSize: 13, marginTop: -8 }}>{fileName}</span>
        )}

        {/* 숨겨진 파일 입력 */}
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          style={{ display: "none" }}
          onChange={handleFileChange}
        />

        {/* 처방전 이름 + 메모 입력 */}
        <div style={{ display: "flex", flexDirection: "column", gap: 12, flexShrink: 0 }}>
          <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
            <label style={{ color: "#1B1F2A", fontSize: 14, fontWeight: 600 }}>
              {t("prescriptionOcrTestModal.label.prescriptionName")}
            </label>
            <input
              type="text"
              value={prescriptionName}
              onChange={(e) => setPrescriptionName(e.target.value)}
              placeholder={t("prescriptionOcrTestModal.placeholder.prescriptionName")}
              style={{
                width: "100%",
                padding: "12px 14px",
                borderRadius: 12,
                border: "1px solid #E8ECF1",
                backgroundColor: "#F6F8FB",
                fontSize: 14,
                color: "#1B1F2A",
                outline: "none",
                boxSizing: "border-box",
              }}
            />
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
            <label style={{ color: "#1B1F2A", fontSize: 14, fontWeight: 600 }}>
              {t("prescriptionOcrTestModal.label.memo")}
            </label>
            <textarea
              value={memo}
              onChange={(e) => setMemo(e.target.value)}
              placeholder={t("prescriptionOcrTestModal.placeholder.memo")}
              rows={2}
              style={{
                width: "100%",
                padding: "12px 14px",
                borderRadius: 12,
                border: "1px solid #E8ECF1",
                backgroundColor: "#F6F8FB",
                fontSize: 14,
                color: "#1B1F2A",
                outline: "none",
                resize: "vertical",
                fontFamily: "inherit",
                boxSizing: "border-box",
              }}
            />
          </div>

          {/* 복용 시간대 (가로 배치, 다중 선택) */}
          <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
            <label style={{ color: "#1B1F2A", fontSize: 14, fontWeight: 600 }}>
              {t("prescriptionOcrTestModal.label.intakeTime")}
            </label>
            <div style={{ display: "flex", gap: 8 }}>
              {INTAKE_OPTIONS.map((option) => {
                const checked = intakeIntervals.includes(option);
                return (
                  <button
                    key={option}
                    type="button"
                    onClick={() => handleToggleInterval(option)}
                    style={{
                      flex: 1,
                      padding: "10px 0",
                      borderRadius: 12,
                      border: `1px solid ${checked ? "#2563EB" : "#E8ECF1"}`,
                      backgroundColor: checked ? "#EFF6FF" : "#F6F8FB",
                      color: checked ? "#2563EB" : "#64748B",
                      fontSize: 14,
                      fontWeight: 600,
                      cursor: "pointer",
                    }}
                  >
                    {intakeOptionLabels[option] ?? option}
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* 약이름 목록 — 남은 공간을 채우고 이 안에서만 스크롤 (모달 높이 고정) */}
        <div
          style={{
            flex: 1,
            minHeight: 0,     // 남는 공간만큼 유연하게 (등록 버튼이 잘리지 않도록)
            borderRadius: 20,
            border: "1px solid #E8ECF1",
            backgroundColor: "#F6F8FB",
            padding: 20,
            display: "flex",
            flexDirection: "column",
            gap: 14,
            overflow: "hidden",
          }}
        >
          {/* 라벨 + 약 추가 버튼 + 상태 배지 */}
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <span style={{ color: "#1B1F2A", fontSize: 15, fontWeight: 600 }}>{t("prescriptionOcrTestModal.medicineListTitle")}</span>
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <button
                type="button"
                onClick={() => setSearchOpen(true)}
                className="flex items-center"
                style={{
                  gap: 4,
                  padding: "5px 10px",
                  borderRadius: 999,
                  border: "1px solid #2563EB",
                  backgroundColor: "#FFFFFF",
                  color: "#2563EB",
                  fontSize: 12,
                  fontWeight: 600,
                  cursor: "pointer",
                }}
              >
                <Plus size={14} />{t("prescriptionOcrTestModal.addMedicine")}
              </button>
            </div>
          </div>

          {loading ? (
            <div
              className="flex items-center justify-center"
              style={{ flex: 1, gap: 8, color: "#94A3B8", fontSize: 14 }}
            >
              <Loader2 size={18} className="animate-spin" style={{ color: "#2563EB" }} />
              {t("prescriptionOcrTestModal.extracting")}
            </div>
          ) : error ? (
            <div
              className="flex items-center justify-center"
              style={{ flex: 1, color: "#EF4444", fontSize: 14 }}
            >
              {error}
            </div>
          ) : medicineNames.length > 0 ? (
            <div
              style={{
                flex: 1,
                minHeight: 0,
                display: "flex",
                flexDirection: "column",
                gap: 8,
                overflowY: "auto",
                paddingRight: 4,
              }}
            >
              {medicineNames.map((name, idx) => (
                <div
                  key={idx}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    gap: 10,
                    padding: "12px 14px",
                    borderRadius: 12,
                    backgroundColor: "#FFFFFF",
                    border: "1px solid #ECEFF3",
                    color: "#1B1F2A",
                    fontSize: 14,
                    fontWeight: 500,
                  }}
                >
                  <span style={{ minWidth: 0, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                    {name}
                  </span>
                  <button
                    type="button"
                    onClick={() => handleRemoveMedicine(idx)}
                    aria-label={t("prescriptionOcrTestModal.removeMedicineAria", { name })}
                    className="flex items-center justify-center"
                    style={{
                      flexShrink: 0,
                      width: 30,
                      height: 30,
                      borderRadius: 8,
                      border: "none",
                      backgroundColor: "transparent",
                      color: "#EF4444",
                      cursor: "pointer",
                    }}
                  >
                    <Trash2 size={18} />
                  </button>
                </div>
              ))}
            </div>
          ) : (
            <div
              className="flex items-center justify-center"
              style={{ flex: 1, color: "#A5B0C0", fontSize: 14 }}
            >
              {t("prescriptionOcrTestModal.emptyState")}
            </div>
          )}
        </div>

        {/* 등록 버튼 */}
        <button
          type="button"
          onClick={handleRegister}
          className="flex items-center justify-center"
          style={{
            width: "100%",
            flexShrink: 0,
            padding: "14px 0",
            borderRadius: 12,
            border: "none",
            backgroundColor: "#2563EB",
            color: "#FFFFFF",
            fontSize: 15,
            fontWeight: 700,
            cursor: "pointer",
          }}
        >
          {isEdit
            ? t("prescriptionOcrTestModal.submit.edit")
            : t("prescriptionOcrTestModal.submit.register")}
        </button>
      </div>
    </div>

    {/* 약 수동 추가 검색 모달 (처방전 모달 zIndex 1000 위에 뜨도록 래퍼로 stacking 상향) */}
    {searchOpen && (
      <div style={{ position: "relative", zIndex: 2000 }}>
        <SearchMedicineModal
          open={searchOpen}
          onClose={() => setSearchOpen(false)}
          onSelectMedicine={handleAddMedicine}
        />
      </div>
    )}
    </>
  );
}
