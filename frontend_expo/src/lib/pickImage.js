// 이미지 선택/촬영 헬퍼 (expo-image-picker).
// 카메라/갤러리에서 이미지를 받아 { uri, base64, mimeType, fileName } 반환. 취소 시 null.
import * as ImagePicker from "expo-image-picker";

async function launch(useCamera, { base64 = false } = {}) {
  if (useCamera) {
    const perm = await ImagePicker.requestCameraPermissionsAsync();
    if (!perm.granted) throw new Error("카메라 권한이 필요합니다.");
  } else {
    const perm = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!perm.granted) throw new Error("사진 접근 권한이 필요합니다.");
  }

  const opts = {
    mediaTypes: ImagePicker.MediaTypeOptions.Images,
    quality: 0.7,
    base64,
  };
  const result = useCamera
    ? await ImagePicker.launchCameraAsync(opts)
    : await ImagePicker.launchImageLibraryAsync(opts);

  if (result.canceled) return null;
  const a = result.assets?.[0];
  if (!a) return null;
  return {
    uri: a.uri,
    base64: a.base64 || null,
    mimeType: a.mimeType || "image/jpeg",
    fileName: a.fileName || `upload_${a.uri.split("/").pop()}`,
  };
}

export const pickFromGallery = (opts) => launch(false, opts);
export const takePhoto = (opts) => launch(true, opts);

/** RN 에서 FormData 에 넣을 파일 객체 형태로 변환 */
export function toFormFile(img, field = "image") {
  const fd = new FormData();
  fd.append(field, {
    uri: img.uri,
    name: img.fileName,
    type: img.mimeType,
  });
  return fd;
}
