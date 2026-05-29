/**
 * 업로드 전 이미지 압축/리사이즈.
 *  - 긴 변이 maxDim(기본 1024px)을 넘으면 비율 유지하며 축소
 *  - JPEG 80% 품질로 재인코딩
 *  - 결과: 같은 인터페이스의 File 객체 (FormData에 그대로 사용 가능)
 *  - 효과: OpenAI Vision 토큰 비용 절감 + DB/네트워크 부담 감소
 */
export async function resizeImageFile(file, { maxDim = 1024, quality = 0.8 } = {}) {
  if (!file || !file.type?.startsWith("image/")) return file;

  const bitmap = await createImageBitmap(file);
  let { width, height } = bitmap;

  if (Math.max(width, height) <= maxDim) {
    bitmap.close?.();
    return file; // 이미 충분히 작음
  }

  const ratio = maxDim / Math.max(width, height);
  width = Math.round(width * ratio);
  height = Math.round(height * ratio);

  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext("2d");
  ctx.drawImage(bitmap, 0, 0, width, height);
  bitmap.close?.();

  const blob = await new Promise((resolve) =>
    canvas.toBlob(resolve, "image/jpeg", quality),
  );
  if (!blob) return file;

  const baseName = file.name?.replace(/\.[^.]+$/, "") || "image";
  return new File([blob], `${baseName}.jpg`, {
    type: "image/jpeg",
    lastModified: Date.now(),
  });
}
