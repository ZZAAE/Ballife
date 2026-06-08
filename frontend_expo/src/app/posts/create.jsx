import { useEffect, useState } from "react";
import {
  View,
  Text,
  Pressable,
  TextInput,
  ScrollView,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import Dropdown from "../../components/Dropdown";
import { useRouter } from "expo-router";
import { useAuth } from "../../context/AuthContext";
import postApi from "../../api/boardApi";
import toast from "../../lib/toast";

function createEmptyFormData() {
  return {
    category: "",
    title: "",
    content: "",
  };
}

// 웹의 isRichTextEmpty 대체: RN에서는 Quill 에디터 대신 평문/HTML TextInput을 쓰므로
// 단순히 공백 여부만 확인한다.
function isRichTextEmpty(content) {
  if (!content) return true;
  return content.replace(/<[^>]*>/g, "").trim().length === 0;
}

export default function PostCreatePage() {
  const router = useRouter();
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  // 등록을 누르지 않고 나갔다 다시 들어오면 항상 빈 폼으로 시작한다 (임시저장/복원 없음)
  const [formData, setFormData] = useState(createEmptyFormData);

  // 비로그인 사용자는 작성 페이지 진입 차단
  useEffect(() => {
    if (!user?.userId) {
      toast.error("로그인이 필요합니다.");
      router.replace("/login");
    }
  }, [user?.userId, router]);

  const categories = [
    { value: "", label: "게시판 선택" },
    { value: "GENERAL", label: "자유게시판" },
    { value: "HYPERLIPIDEMIA", label: "고지혈증" },
    { value: "HYPERTENSION", label: "고혈압" },
    { value: "OSTEOPOROSIS", label: "골다공증" },
    { value: "DIABETES", label: "당뇨" },
    { value: "OBESITY", label: "비만" },
    { value: "GOUT", label: "통풍" },
    { value: "QNA", label: "질문" },
  ];

  const handleChange = (name, value) => {
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleContentChange = (content) => {
    setFormData((prev) => ({ ...prev, content }));
  };

  const handleSubmit = async () => {
    if (!formData.category) {
      toast.error("카테고리를 선택해주세요.");
      return;
    }

    if (!formData.title.trim()) {
      toast.error("제목을 입력해주세요.");
      return;
    }

    if (isRichTextEmpty(formData.content)) {
      toast.error("내용을 입력해주세요.");
      return;
    }

    if (!user?.userId) {
      toast.error("로그인 정보에 id가 없습니다. 로그아웃 후 다시 로그인하세요.");
      return;
    }

    try {
      setLoading(true);
      const res = await postApi.createPost(user.userId, formData);
      toast.success("등록되었습니다.");
      router.push(`/posts/${res.data.id}`);
    } catch (error) {
      console.error("게시글 등록 실패:", error);
      toast.error("게시글 등록 중 오류가 발생했습니다.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-[#F9FAFB]">
      <ScrollView contentContainerClassName="px-4 py-6">
        <Text className="text-[26px] font-extrabold tracking-tight text-[#0F172A]">
          게시판 글쓰기
        </Text>
        <Text className="mb-8 mt-1 text-[14px] text-gray-500">
          건강한 삶을 위한 커뮤니티에 여러분의 이야기를 들려주세요.
        </Text>

        <View className="gap-6">
          {/* 카테고리 */}
          <View>
            <Text className="mb-2 text-[14px] font-semibold text-gray-700">
              카테고리
            </Text>
            <Dropdown
              value={formData.category}
              onChange={(value) => handleChange("category", value)}
              options={categories.map((category) => ({
                label: category.label,
                value: category.value,
              }))}
            />
          </View>

          {/* 제목 */}
          <View>
            <Text className="mb-2 text-[14px] font-semibold text-gray-700">
              제목
            </Text>
            <TextInput
              value={formData.title}
              onChangeText={(value) => handleChange("title", value)}
              placeholder="포스트의 제목을 입력하세요"
              placeholderTextColor="#d1d5db"
              maxLength={120}
              className="h-12 rounded-xl border border-[#d8dee8] bg-white px-4 text-[15px] text-gray-700"
            />
          </View>

          {/* 내용 — Quill 리치에디터 대체: multiline TextInput (평문/HTML 직접 편집) */}
          <View>
            <Text className="mb-2 text-[14px] font-semibold text-gray-700">
              내용
            </Text>
            <TextInput
              value={formData.content}
              onChangeText={handleContentChange}
              placeholder="내용을 입력하세요..."
              placeholderTextColor="#d1d5db"
              multiline
              textAlignVertical="top"
              className="min-h-[220px] rounded-xl border border-[#d8dee8] bg-white px-4 py-3 text-[15px] leading-7 text-gray-700"
            />
            <View className="mt-7 gap-3">
              <Text className="text-[14px] text-gray-400">
                리치 에디터(이미지 삽입)는 모바일에서 지원되지 않아 본문은 일반
                텍스트/HTML로 입력합니다.
              </Text>
              <View className="flex-row items-center justify-end gap-3">
                <Pressable
                  onPress={() => router.back()}
                  className="rounded-[10px] border border-gray-200 bg-white px-5 py-2.5"
                >
                  <Text className="text-[14px] font-semibold text-gray-700">
                    나가기
                  </Text>
                </Pressable>
                <Pressable
                  onPress={handleSubmit}
                  disabled={loading}
                  className="rounded-[10px] bg-[#0F172A] px-6 py-2.5"
                >
                  <Text className="text-[14px] font-semibold text-white">
                    {loading ? "등록 중..." : "등록"}
                  </Text>
                </Pressable>
              </View>
            </View>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
