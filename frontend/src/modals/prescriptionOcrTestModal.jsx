import { useState, useRef } from "react";
import { X, ImagePlus, Loader2 } from "lucide-react";
import medicineApi from "../api/medicineApi";

/**
 * 처방전 OCR 테스트용 모달 (라이트 테마)
 * - 이미지를 선택하면 원본 파일을 그대로 multipart/form-data로 백엔드에 전송
 *   (base64 변환은 백엔드에서 수행)
 * - 백엔드는 OCR로 추출한 "약이름 문자열 목록"만 반환한다고 가정 (테스트 단계)
 */
export default function PrescriptionOcrTestModal({ isOpen, onClose }) {
  const fileInputRef = useRef(null);

  const [preview, setPreview] = useState(null);          // 이미지 미리보기 URL
  const [fileName, setFileName] = useState("");
  const [medicineNames, setMedicineNames] = useState([]); // OCR로 추출된 약이름 목록
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  if (!isOpen) return null;

  const handleSelectClick = () => fileInputRef.current?.click();

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
      setError("약이름을 가져오지 못했습니다. 다시 시도해 주세요.");
    } finally {
      setLoading(false);
    }
  };

  // 약이름 목록 상태 배지 텍스트
  const badgeText = loading
    ? "추출 중"
    : medicineNames.length > 0
    ? `${medicineNames.length}개 추출`
    : "대기 중";

  return (
    <div
      className="fixed inset-0 flex items-center justify-center"
      style={{ backgroundColor: "rgba(15, 23, 42, 0.45)", zIndex: 1000, padding: 16 }}
      onClick={onClose}
    >
      {/* 모달 본체 */}
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          width: 520,
          maxWidth: "100%",
          backgroundColor: "#FFFFFF",
          borderRadius: 24,
          padding: 28,
          boxShadow: "0 24px 64px rgba(15, 23, 42, 0.18)",
          display: "flex",
          flexDirection: "column",
          gap: 20,
        }}
      >
        {/* 헤더 */}
        <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between" }}>
          <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
            <span style={{ color: "#1B1F2A", fontSize: 22, fontWeight: 700 }}>
              처방전 등록
            </span>
            <span style={{ color: "#94A3B8", fontSize: 14 }}>
              처방전 이미지를 올리면 약 이름을 자동으로 추출해드려요.
            </span>
          </div>
          <button
            onClick={onClose}
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
            height: 220,
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
              alt="처방전 미리보기"
              style={{ width: "100%", height: "100%", objectFit: "contain" }}
            />
          ) : (
            <>
              <ImagePlus size={40} style={{ color: "#94A3B8", marginBottom: 10 }} />
              <span style={{ color: "#64748B", fontSize: 15, fontWeight: 500 }}>
                이미지 넣는 곳
              </span>
              <span style={{ color: "#A5B0C0", fontSize: 13, marginTop: 4 }}>
                클릭해서 처방전 이미지를 선택하세요
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

        {/* 약이름 목록 */}
        <div
          style={{
            minHeight: 200,
            borderRadius: 20,
            border: "1px solid #E8ECF1",
            backgroundColor: "#F6F8FB",
            padding: 20,
            display: "flex",
            flexDirection: "column",
            gap: 14,
          }}
        >
          {/* 라벨 + 상태 배지 */}
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <span style={{ color: "#1B1F2A", fontSize: 15, fontWeight: 600 }}>약이름 목록</span>
            <span
              style={{
                padding: "5px 12px",
                borderRadius: 999,
                backgroundColor: "#EFF6FF",
                color: "#2563EB",
                fontSize: 12,
                fontWeight: 600,
              }}
            >
              {badgeText}
            </span>
          </div>

          {loading ? (
            <div
              className="flex items-center justify-center"
              style={{ flex: 1, gap: 8, color: "#94A3B8", fontSize: 14 }}
            >
              <Loader2 size={18} className="animate-spin" style={{ color: "#2563EB" }} />
              약이름 추출 중...
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
                display: "flex",
                flexDirection: "column",
                gap: 8,
                maxHeight: 240,
                overflowY: "auto",
                paddingRight: 4,
              }}
            >
              {medicineNames.map((name, idx) => (
                <div
                  key={idx}
                  style={{
                    padding: "12px 14px",
                    borderRadius: 12,
                    backgroundColor: "#FFFFFF",
                    border: "1px solid #ECEFF3",
                    color: "#1B1F2A",
                    fontSize: 14,
                    fontWeight: 500,
                  }}
                >
                  {name}
                </div>
              ))}
            </div>
          ) : (
            <div
              className="flex items-center justify-center"
              style={{ flex: 1, color: "#A5B0C0", fontSize: 14 }}
            >
              이미지를 넣으면 약이름이 표시됩니다.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
