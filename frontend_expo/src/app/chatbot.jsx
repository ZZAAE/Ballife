import { useState, useRef, useEffect, useCallback } from "react";
import {
  View,
  Text,
  Pressable,
  TextInput,
  FlatList,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { X, Send } from "lucide-react-native";
import { useAuth } from "../context/AuthContext";
import { AI_SERVICE_BASE_URL } from "../lib/runtime";
import { getToken } from "../lib/tokenStore";

function nowTime() {
  const d = new Date();
  return `${d.getHours()}:${String(d.getMinutes()).padStart(2, "0")}`;
}

/* 봇 아바타 (web BotAvatar 대체) */
function BotAvatar() {
  return (
    <View className="w-[34px] h-[34px] rounded-full items-center justify-center bg-[#E6F0FF]">
      <Text className="text-[13px] font-bold text-[#2D6BFF]">B</Text>
    </View>
  );
}

/* 사용자 아바타 (web UserAvatar 대체) */
function UserAvatar() {
  return (
    <View className="w-[34px] h-[34px] rounded-full items-center justify-center bg-[#E2E6EC]">
      <Text className="text-[13px] font-bold text-[#4A5363]">나</Text>
    </View>
  );
}

/* 타이핑 인디케이터 (web .ball-typing 대체) */
function TypingBubble() {
  return (
    <View className="flex-row gap-[10px]">
      <BotAvatar />
      <View className="gap-[6px] max-w-[78%]">
        <Text className="text-[12px] font-semibold text-[#4A5363]">Ball</Text>
        <View className="px-[14px] py-[12px] rounded-[14px] bg-white border border-[#EEF1F5] self-start">
          <ActivityIndicator size="small" color="#8993A4" />
        </View>
      </View>
    </View>
  );
}

function MessageRow({ item }) {
  if (item.role === "user") {
    return (
      <View className="flex-row gap-[10px] justify-end">
        <View className="gap-[6px] max-w-[78%] items-end">
          <View className="px-[14px] py-[12px] rounded-[14px] bg-[#0F1A2E] border border-[#0F1A2E]">
            {!!item.content && (
              <Text className="text-[13.5px] leading-[22px] text-white">
                {item.content}
              </Text>
            )}
          </View>
          {!!item.time && (
            <Text className="text-[10.5px] text-[#8993A4] px-1">
              {item.time}
            </Text>
          )}
        </View>
        <UserAvatar />
      </View>
    );
  }
  return (
    <View className="flex-row gap-[10px]">
      <BotAvatar />
      <View className="gap-[6px] max-w-[78%]">
        <Text className="text-[12px] font-semibold text-[#4A5363]">Ball</Text>
        <View className="px-[14px] py-[12px] rounded-[14px] bg-white border border-[#EEF1F5] self-start">
          <Text className="text-[13.5px] leading-[22px] text-[#0F1A2E]">
            {item.content}
          </Text>
        </View>
        {!!item.time && (
          <Text className="text-[10.5px] text-[#8993A4] px-1">{item.time}</Text>
        )}
      </View>
    </View>
  );
}

export default function ChatbotScreen() {
  const { user } = useAuth();
  const router = useRouter();

  const [messages, setMessages] = useState([]); // {role:'user'|'assistant', content, time}
  const [input, setInput] = useState("");
  const [isWaiting, setIsWaiting] = useState(false);

  const listRef = useRef(null);
  const historyLoadedRef = useRef(null); // 이전 대화 기록을 불러온 사용자 id
  const messagesUserRef = useRef(null); // 현재 화면 메시지가 속한 사용자 id

  // 사용자 변경(로그인/로그아웃/계정 전환) 시 화면 기록 초기화 — 렌더 단계의 가드된 리셋
  const currentUserKey = user?.id ?? user?.userId ?? null;
  if (messagesUserRef.current !== currentUserKey) {
    messagesUserRef.current = currentUserKey;
    historyLoadedRef.current = null;
    setMessages([]);
  }

  /* 새 메시지마다 맨 아래로 스크롤 */
  useEffect(() => {
    if (messages.length === 0) return;
    const t = setTimeout(() => {
      listRef.current?.scrollToEnd({ animated: true });
    }, 50);
    return () => clearTimeout(t);
  }, [messages, isWaiting]);

  /* 화면 진입 시 이전 대화 기록 복원 (사용자별 1회) */
  useEffect(() => {
    const userId = Number(user?.id ?? user?.userId);
    if (!Number.isFinite(userId)) return;
    if (historyLoadedRef.current === userId) return; // 이미 이 사용자 기록을 불러옴
    historyLoadedRef.current = userId;

    (async () => {
      try {
        const res = await fetch(`${AI_SERVICE_BASE_URL}/chat/history/${userId}`);
        if (!res.ok) return;
        const data = await res.json();
        const restored = (data.messages || []).map((m) => ({
          role: m.role,
          content: m.content,
          time: "",
        }));
        // 이 사용자 기준으로 교체 (계정 전환 시 이전 사용자 메시지 제거)
        setMessages(restored);
      } catch (err) {
        console.error("대화 기록 복원 실패:", err);
      }
    })();
  }, [user]);

  /* 챗봇에 보내기 */
  const send = useCallback(async () => {
    const text = input.trim();
    if (!text || isWaiting) return;

    // userId 가 없으면 서버가 422 를 반환하므로 사전 차단
    const userId = Number(user?.id ?? user?.userId);
    if (!Number.isFinite(userId)) {
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content: "로그인 후 이용할 수 있어요. 로그인 정보를 확인해 주세요.",
          time: nowTime(),
        },
      ]);
      return;
    }

    const newUserMsg = { role: "user", content: text, time: nowTime() };
    setMessages((prev) => [...prev, newUserMsg]);
    setInput("");
    setIsWaiting(true);

    try {
      const response = await fetch(`${AI_SERVICE_BASE_URL}/chat`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: text,
          userId,
          token: getToken(),
        }),
      });
      const data = await response.json();
      const reply = data.reply || "응답을 받지 못했어요.";

      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: reply, time: nowTime() },
      ]);
    } catch (err) {
      console.error(err);
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content:
            "죄송해요, 잠시 응답을 가져올 수 없어요. 잠시 후 다시 시도해 주세요.",
          time: nowTime(),
        },
      ]);
    } finally {
      setIsWaiting(false);
    }
  }, [input, isWaiting, user]);

  const canSend = !!input.trim() && !isWaiting;

  return (
    <SafeAreaView className="flex-1 bg-[#F7F8FA]" edges={["top", "bottom"]}>
      {/* 헤더 */}
      <View className="flex-row items-center gap-3 bg-[#0F1A2E] px-[18px] py-4">
        <View className="flex-1 min-w-0">
          <Text className="text-[16px] font-bold text-white">건강 AI 비서</Text>
          <View className="flex-row items-center gap-[6px] mt-[2px]">
            <View className="w-[7px] h-[7px] rounded-full bg-[#22C55E]" />
            <Text className="text-[11px] text-white/70">실시간 상담 가능</Text>
          </View>
        </View>
        <Pressable
          onPress={() => router.back()}
          accessibilityLabel="닫기"
          hitSlop={8}
          className="p-1.5 rounded-md"
        >
          <X size={20} color="rgba(255,255,255,0.85)" />
        </Pressable>
      </View>

      <KeyboardAvoidingView
        className="flex-1"
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        keyboardVerticalOffset={0}
      >
        {/* 메시지 목록 */}
        <FlatList
          ref={listRef}
          data={messages}
          keyExtractor={(_, i) => String(i)}
          renderItem={({ item }) => <MessageRow item={item} />}
          contentContainerStyle={{
            padding: 18,
            gap: 18,
            flexGrow: 1,
          }}
          ListEmptyComponent={
            !isWaiting ? (
              <View className="flex-1 items-center justify-center px-4 py-7">
                <View className="w-16 h-16 rounded-full bg-[#E6F0FF] items-center justify-center mb-[14px]">
                  <Text className="text-[26px] font-bold text-[#2D6BFF]">B</Text>
                </View>
                <Text className="text-[15px] font-bold text-[#0F1A2E] mb-[6px]">
                  안녕하세요, Ball이에요
                </Text>
                <Text className="text-[12.5px] leading-5 text-[#8993A4] text-center max-w-[320px]">
                  혈당, 영양, 운동, 수면 등 건강과 관련된 궁금한 점을 편하게
                  물어봐 주세요.
                </Text>
              </View>
            ) : null
          }
          ListFooterComponent={isWaiting ? <TypingBubble /> : null}
          keyboardShouldPersistTaps="handled"
        />

        {/* 입력 바 */}
        <View className="border-t border-[#EEF1F5] bg-white px-[14px] pt-3 pb-2">
          <View className="flex-row items-end gap-2 bg-[#F7F8FA] border border-[#EEF1F5] rounded-[12px] pl-3 pr-2 py-2">
            <TextInput
              className="flex-1 text-[13.5px] text-[#0F1A2E] py-1.5 max-h-[120px]"
              placeholder="메시지를 입력하세요..."
              placeholderTextColor="#8993A4"
              value={input}
              onChangeText={setInput}
              multiline
              editable={!isWaiting}
              onSubmitEditing={send}
              blurOnSubmit={false}
              returnKeyType="send"
            />
            <Pressable
              onPress={send}
              disabled={!canSend}
              accessibilityLabel="전송"
              className={`w-9 h-9 rounded-[9px] items-center justify-center ${
                canSend ? "bg-[#0F1A2E]" : "bg-[#C9D0DA]"
              }`}
            >
              <Send size={16} color="#fff" />
            </Pressable>
          </View>
          <Text className="text-center text-[10.5px] text-[#8993A4] pt-2 pb-1">
            AI 비서의 조언은 참고용이며 의학적 진단을 대신할 수 없습니다.
          </Text>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
