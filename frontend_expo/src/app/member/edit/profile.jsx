import { useEffect, useState } from "react";
import {
  View,
  Text,
  Pressable,
  ScrollView,
  TextInput,
  Image,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import Dropdown from "../../../components/Dropdown";
import { useRouter } from "expo-router";
import toast from "../../../lib/toast";
import userApi from "../../../api/userApi";
import uploadApi from "../../../api/uploadApi";
import { pickFromGallery } from "../../../lib/pickImage";
import { useAuth } from "../../../context/AuthContext";

export default function ProfileEditPage() {
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();
  const userId = user?.userId ?? user?.id;
  const [saving, setSaving] = useState(false);
  const [memberLoaded, setMemberLoaded] = useState(false);
  // 갤러리에서 고른 프로필 이미지 미리보기 URI
  const [profileImage, setProfileImage] = useState(null);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [formData, setFormData] = useState({
    email: "",
    username: "",
    nickname: "",
    birthDate: "",
    gender: "",
    weight: "",
    height: "",
  });

  useEffect(() => {
    if (authLoading || !userId) {
      return;
    }

    const fetchMember = async () => {
      try {
        const { data } = await userApi.getMember(userId);
        setFormData({
          email: data.email ?? "",
          username: data.username ?? "",
          nickname: data.nickname ?? "",
          birthDate: data.birthDate ?? "",
          gender: data.gender ?? "",
          weight: data.weight != null ? String(data.weight) : "",
          height: data.height != null ? String(data.height) : "",
        });
      } catch {
        toast.error("회원 정보를 불러오지 못했습니다.");
      } finally {
        setMemberLoaded(true);
      }
    };

    fetchMember();
  }, [authLoading, userId]);

  const handleChange = (name, value) => {
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  // 프로필 사진 선택 → 미리보기 표시 후 웹과 동일한 uploadApi 로 업로드.
  // uploadApi.uploadImage 는 FormData 에 file/subDir 를 직접 담으므로
  // toFormFile 대신 RN 파일 객체를 그대로 넘겨 동일한 페이로드를 만든다.
  const handlePickProfileImage = async () => {
    try {
      const img = await pickFromGallery();
      if (!img) return;
      setProfileImage(img.uri); // 즉시 미리보기
      setUploadingImage(true);
      try {
        // 웹 uploadApi.uploadImage(file, "profile") 와 동일 — subDir "profile"
        const result = await uploadApi.uploadImage(
          { uri: img.uri, name: img.fileName, type: img.mimeType },
          "profile",
        );
        if (result?.url) setProfileImage(result.url);
        toast.success("프로필 사진이 업로드되었습니다.");
      } catch (err) {
        console.error("[ProfileEditPage] 프로필 사진 업로드 실패:", err);
        toast.error("프로필 사진 업로드에 실패했습니다.");
      } finally {
        setUploadingImage(false);
      }
    } catch (err) {
      toast.error(err.message || "사진을 불러오지 못했습니다.");
    }
  };

  const handleSubmit = async () => {
    try {
      setSaving(true);
      // 0 이나 빈 문자열은 backend @DecimalMin(0.1) 에 걸리므로 null 로 보냄
      const numOrNull = (v) => {
        if (v === "" || v == null) return null;
        const n = Number(v);
        return Number.isFinite(n) && n > 0 ? n : null;
      };
      const payload = {
        nickname: formData.nickname.trim(),
        weight: numOrNull(formData.weight),
        height: numOrNull(formData.height),
      };

      if (!userId) {
        toast.error("로그인이 필요합니다.");
        return;
      }

      await userApi.updateMember(userId, payload);
      toast.success("회원 정보가 수정되었습니다.");
      router.push("/member");
    } catch (error) {
      const serverMessage =
        error.response?.data?.message ||
        error.response?.data?.errors?.[0]?.defaultMessage ||
        error.response?.data?.error ||
        error.message;
      console.error(
        "[ProfileEditPage] updateMember failed:",
        error.response?.data || error,
      );
      toast.error(serverMessage || "회원 정보 수정에 실패했습니다.");
    } finally {
      setSaving(false);
    }
  };

  const loading = authLoading || (!!userId && !memberLoaded);

  const readOnlyInput =
    "h-12 rounded-xl border border-[#E2E8F0] bg-[#F8FAFC] px-4 text-sm text-[#94A3B8]";
  const editableInput =
    "h-12 rounded-xl border border-[#CBD5E1] bg-white px-4 text-sm text-[#0F172A]";

  return (
    <SafeAreaView className="flex-1 bg-[#F9FAFB]">
      <KeyboardAvoidingView
        className="flex-1"
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        <ScrollView
          contentContainerStyle={{ padding: 16, paddingBottom: 40 }}
          keyboardShouldPersistTaps="handled"
        >
        <View className="rounded-[28px] border border-[#E5E7EB] bg-white p-6 shadow-sm">
          <View className="mb-8 flex-row items-start justify-between gap-4">
            <View className="flex-1">
              <Text className="text-sm font-semibold text-[#64748B]">
                {userId ? "회원 정보 수정" : "프로필 편집 데모"}
              </Text>
              <Text className="mt-2 text-[30px] font-extrabold text-[#0F172A]">
                프로필 수정
              </Text>
              <Text className="mt-3 text-sm leading-6 text-[#64748B]">
                이름, 닉네임, 생년월일, 성별, 신체 정보를 수정할 수 있습니다.
              </Text>
            </View>
            <Pressable
              onPress={() => router.push("/member")}
              className="rounded-full border border-[#CBD5E1] px-4 py-2"
            >
              <Text className="text-sm font-semibold text-[#475569]">닫기</Text>
            </Pressable>
          </View>

          {loading ? (
            <View className="rounded-2xl bg-[#F8FAFC] px-5 py-16">
              <Text className="text-center text-sm font-medium text-[#64748B]">
                회원 정보를 불러오는 중입니다.
              </Text>
            </View>
          ) : (
            <View className="gap-6">
              {/* 프로필 사진 — 갤러리에서 선택 후 uploadApi 로 업로드 */}
              <View className="rounded-[24px] border border-[#E2E8F0] bg-[#F8FAFC] p-6">
                <View className="flex-row items-center gap-4">
                  <Pressable
                    onPress={handlePickProfileImage}
                    disabled={uploadingImage}
                    className="h-24 w-24 items-center justify-center overflow-hidden rounded-full bg-[#E2E8F0]"
                  >
                    {profileImage ? (
                      <Image
                        source={{ uri: profileImage }}
                        className="h-full w-full"
                        resizeMode="cover"
                      />
                    ) : (
                      <Text className="text-4xl text-[#64748B]">👤</Text>
                    )}
                  </Pressable>
                  <View className="flex-1">
                    <Text className="text-sm font-semibold text-[#0F172A]">
                      프로필 사진
                    </Text>
                    <Text className="mt-1 text-xs leading-5 text-[#64748B]">
                      {uploadingImage
                        ? "사진을 업로드하는 중입니다..."
                        : "사진을 눌러 갤러리에서 변경할 수 있습니다."}
                    </Text>
                  </View>
                </View>
              </View>

              <View className="gap-5">
                <View className="gap-2">
                  <Text className="text-sm font-semibold text-[#1E293B]">이메일</Text>
                  <TextInput
                    value={formData.email}
                    editable={false}
                    className={readOnlyInput}
                  />
                </View>
                <View className="gap-2">
                  <Text className="text-sm font-semibold text-[#1E293B]">이름</Text>
                  <TextInput
                    value={formData.username}
                    editable={false}
                    className={readOnlyInput}
                  />
                </View>
                <View className="gap-2">
                  <Text className="text-sm font-semibold text-[#1E293B]">닉네임</Text>
                  <TextInput
                    value={formData.nickname}
                    onChangeText={(v) => handleChange("nickname", v)}
                    className={editableInput}
                  />
                </View>
                <View className="gap-2">
                  <Text className="text-sm font-semibold text-[#1E293B]">생년월일</Text>
                  <TextInput
                    value={formData.birthDate}
                    editable={false}
                    className={readOnlyInput}
                  />
                </View>
                <View className="gap-2">
                  <Text className="text-sm font-semibold text-[#1E293B]">성별</Text>
                  <Dropdown
                    value={formData.gender}
                    onChange={(value) => handleChange("gender", value)}
                    disabled={true}
                    options={[
                      { label: "선택 안 함", value: "" },
                      { label: "남성", value: "남성" },
                      { label: "여성", value: "여성" },
                    ]}
                  />
                </View>
                <View className="gap-2">
                  <Text className="text-sm font-semibold text-[#1E293B]">몸무게(kg)</Text>
                  <TextInput
                    keyboardType="numeric"
                    value={formData.weight}
                    onChangeText={(v) => handleChange("weight", v)}
                    className={editableInput}
                  />
                </View>
                <View className="gap-2">
                  <Text className="text-sm font-semibold text-[#1E293B]">키(cm)</Text>
                  <TextInput
                    keyboardType="numeric"
                    value={formData.height}
                    onChangeText={(v) => handleChange("height", v)}
                    className={editableInput}
                  />
                </View>
              </View>

              <View className="flex-row justify-end gap-3 pt-4">
                <Pressable
                  onPress={() => router.push("/member")}
                  className="rounded-xl border border-[#CBD5E1] px-5 py-3"
                >
                  <Text className="text-sm font-semibold text-[#475569]">취소</Text>
                </Pressable>
                <Pressable
                  onPress={handleSubmit}
                  disabled={saving}
                  className={`rounded-xl bg-[#0F172A] px-5 py-3 ${saving ? "opacity-50" : ""}`}
                >
                  <Text className="text-sm font-semibold text-white">
                    {saving ? "저장 중..." : "저장하기"}
                  </Text>
                </Pressable>
              </View>
            </View>
          )}
        </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
