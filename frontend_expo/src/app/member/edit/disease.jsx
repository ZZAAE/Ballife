import { useEffect, useState } from "react";
import {
  View,
  Text,
  Pressable,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import Dropdown from "../../../components/Dropdown";
import { useRouter } from "expo-router";
import toast from "../../../lib/toast";
import userApi from "../../../api/userApi";
import { useAuth } from "../../../context/AuthContext";

// ── userProfile 유틸 인라인 (웹 utils 는 localStorage 의존이라 미포팅) ──
const DISEASE_FIELDS = [
  {
    name: "hyperlipidemia",
    label: "고지혈증 보유 여부",
    options: [
      { value: "NONE", label: "해당 없음" },
      { value: "type1", label: "고콜레스테롤혈증" },
      { value: "type2", label: "고LDL콜레스테롤혈증" },
      { value: "type3", label: "고중성지방혈증" },
      { value: "type4", label: "저HDL콜레스테롤혈증" },
    ],
  },
  {
    name: "hypertension",
    label: "고혈압 보유 여부",
    options: [
      { value: "NONE", label: "해당 없음" },
      { value: "type1", label: "고혈압 전단계" },
      { value: "type2", label: "1기" },
      { value: "type3", label: "2기" },
    ],
  },
  {
    name: "osteoporosis",
    label: "골다공증 보유 여부",
    options: [
      { value: "NONE", label: "해당 없음" },
      { value: "osteopenia", label: "골감소증" },
      { value: "osteoporosis", label: "골다공증" },
    ],
  },
  {
    name: "diabetes",
    label: "당뇨 보유 여부",
    options: [
      { value: "NONE", label: "해당 없음" },
      { value: "type1", label: "1형" },
      { value: "type2", label: "2형" },
      { value: "GESTATIONAL", label: "임신성" },
    ],
  },
  {
    name: "gout",
    label: "통풍 보유 여부",
    options: [
      { value: "NONE", label: "해당 없음" },
      { value: "ASYMPTOMATIC", label: "고요산혈증" },
      { value: "ACUTE", label: "급성" },
      { value: "INTERMITTENT", label: "간헐기" },
      { value: "CHRONIC", label: "만성" },
    ],
  },
];

function createEmptyDiseaseForm() {
  return DISEASE_FIELDS.reduce((acc, field) => {
    acc[field.name] = "NONE";
    return acc;
  }, {});
}

function parseDiseaseIndex(diseaseIndex) {
  const next = createEmptyDiseaseForm();
  if (!diseaseIndex) return next;
  for (const entry of String(diseaseIndex).split(",")) {
    const [rawKey, rawValue] = entry.split(":");
    const key = rawKey?.trim();
    const value = rawValue?.trim();
    if (!key || !value || !(key in next)) continue;
    next[key] = value;
  }
  return next;
}

function serializeDiseaseForm(formData) {
  return Object.entries(formData)
    .filter(([, value]) => value && value !== "NONE")
    .map(([key, value]) => `${key}:${value}`)
    .join(",");
}

export default function DiseaseEditPage() {
  const router = useRouter();
  const { user } = useAuth();
  const userId = user?.userId ?? user?.id;
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState(createEmptyDiseaseForm);

  useEffect(() => {
    if (!userId) {
      setFormData(createEmptyDiseaseForm());
      setLoading(false);
      return;
    }

    const fetchMember = async () => {
      try {
        const { data } = await userApi.getMember(userId);
        setFormData(parseDiseaseIndex(data.diseaseIndex));
      } catch (error) {
        toast.error("질환 정보를 불러오지 못했습니다.");
      } finally {
        setLoading(false);
      }
    };

    fetchMember();
  }, [userId]);

  const handleChange = (name, value) => {
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async () => {
    if (!userId) {
      toast.error("로그인이 필요합니다.");
      return;
    }

    try {
      setSaving(true);
      const { data } = await userApi.updateDisease(userId, {
        diseaseIndex: serializeDiseaseForm(formData),
      });
      void data;
      toast.success("보유 질환 정보가 수정되었습니다.");
      router.push("/member");
    } catch (error) {
      toast.error(
        error.response?.data?.message || "질환 정보 수정에 실패했습니다.",
      );
    } finally {
      setSaving(false);
    }
  };

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
                {userId ? "보유 질환 수정" : "질환 편집 데모"}
              </Text>
              <Text className="mt-2 text-[30px] font-extrabold text-[#0F172A]">
                질환 정보 편집
              </Text>
              <Text className="mt-3 text-sm leading-6 text-[#64748B]">
                현재 보유 중인 만성 질환 상태를 선택해 업데이트하세요.
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
                질환 정보를 불러오는 중입니다.
              </Text>
            </View>
          ) : (
            <View className="gap-6">
              <View className="gap-5">
                {DISEASE_FIELDS.map((field) => (
                  <View key={field.name} className="gap-2">
                    <Text className="text-sm font-semibold text-[#1E293B]">
                      {field.label}
                    </Text>
                    <Dropdown
                      value={formData[field.name]}
                      onChange={(value) => handleChange(field.name, value)}
                      options={field.options.map((option) => ({
                        label: option.label,
                        value: option.value,
                      }))}
                    />
                  </View>
                ))}
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
