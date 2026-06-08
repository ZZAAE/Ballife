import { useEffect, useMemo, useState } from "react";
import { View, Text, Pressable, ScrollView } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { FileText, Lock, Droplet, HeartPulse, Scale } from "lucide-react-native";
import { useAuth } from "../../context/AuthContext";
import subscriptionApi from "../../api/subscriptionApi";
import bioValueRecordApi from "../../api/bioValueRecordApi";
import userApi from "../../api/userApi";

const contentOf = (res) =>
  Array.isArray(res?.data?.content) ? res.data.content : [];

const avg = (nums) =>
  nums.length ? Math.round(nums.reduce((s, n) => s + n, 0) / nums.length) : null;

const CHART_TABS = [
  { key: "bloodSugar", label: "혈당" },
  { key: "bloodPressure", label: "혈압" },
  { key: "weight", label: "체중" },
  { key: "bmi", label: "BMI" },
];

function SummaryCard({ icon: Icon, accent, bg, label, value, unit, sub }) {
  return (
    <View className="rounded-2xl border border-gray-100 bg-white p-5 flex-1 min-w-[45%]">
      <View className="mb-3 flex-row items-center gap-2">
        <View
          className="h-9 w-9 items-center justify-center rounded-lg"
          style={{ backgroundColor: bg }}
        >
          <Icon size={16} color={accent} />
        </View>
        <Text className="text-[13px] font-medium text-[#64748B]">{label}</Text>
      </View>
      <View className="flex-row items-end gap-1">
        <Text className="text-[28px] font-extrabold leading-none text-[#0F172A]">
          {value ?? "—"}
        </Text>
        {value != null && unit ? (
          <Text className="pb-1 text-[12px] text-[#94A3B8]">{unit}</Text>
        ) : null}
      </View>
      {sub ? (
        <Text className="mt-2 text-[11px] text-[#94A3B8]">{sub}</Text>
      ) : null}
    </View>
  );
}

// recharts 대체: 단순 막대 추이 차트 (실제 데이터 사용)
function TrendBars({ data, lines }) {
  const allValues = data.flatMap((d) => lines.map((ln) => Number(d[ln.key])));
  const finite = allValues.filter(Number.isFinite);
  const max = finite.length ? Math.max(...finite) : 0;
  const min = finite.length ? Math.min(...finite) : 0;
  const range = max - min || 1;
  const heightFor = (v) => 16 + ((Number(v) - min) / range) * 120;

  return (
    <View>
      {lines.length > 1 ? (
        <View className="mb-3 flex-row flex-wrap gap-4">
          {lines.map((ln) => (
            <View key={ln.key} className="flex-row items-center gap-1.5">
              <View
                className="h-2 w-2 rounded-full"
                style={{ backgroundColor: ln.color }}
              />
              <Text className="text-[12px] text-[#64748B]">{ln.name}</Text>
            </View>
          ))}
        </View>
      ) : null}

      <ScrollView horizontal showsHorizontalScrollIndicator={false}>
        <View className="flex-row items-end gap-3" style={{ height: 180 }}>
          {data.map((d, idx) => (
            <View key={idx} className="items-center justify-end">
              <View className="flex-row items-end gap-1" style={{ height: 150 }}>
                {lines.map((ln) => (
                  <View key={ln.key} className="items-center justify-end">
                    <Text className="mb-1 text-[10px] text-[#94A3B8]">
                      {d[ln.key]}
                    </Text>
                    <View
                      className="w-4 rounded-t-md"
                      style={{
                        height: heightFor(d[ln.key]),
                        backgroundColor: ln.color,
                      }}
                    />
                  </View>
                ))}
              </View>
              <Text className="mt-1.5 text-[10px] text-[#9ca3af]">{d.date}</Text>
            </View>
          ))}
        </View>
      </ScrollView>
    </View>
  );
}

export default function HealthReportPage() {
  const router = useRouter();
  const { user } = useAuth();
  const userId = user?.userId ?? user?.id;

  const [loading, setLoading] = useState(true);
  const [reportAccess, setReportAccess] = useState(false);
  const [bloodSugar, setBloodSugar] = useState([]);
  const [bloodPressure, setBloodPressure] = useState([]);
  const [weight, setWeight] = useState([]);
  const [profile, setProfile] = useState(null);
  const [chartTab, setChartTab] = useState("bloodSugar");

  useEffect(() => {
    if (!userId) return;
    let cancelled = false;
    (async () => {
      setLoading(true);
      try {
        const subRes = await subscriptionApi.getMySubscription();
        if (cancelled) return;
        const access = !!subRes?.data?.reportAccess;
        setReportAccess(access);
        if (!access) return;

        const [bs, bp, w, member] = await Promise.allSettled([
          bioValueRecordApi.getPageByCategory(userId, "BloodSugar", 0, 90),
          bioValueRecordApi.getPageByCategory(userId, "BloodPressure", 0, 90),
          bioValueRecordApi.getPageByCategory(userId, "Weight", 0, 90),
          userApi.getMember(userId),
        ]);
        if (cancelled) return;
        if (bs.status === "fulfilled") setBloodSugar(contentOf(bs.value));
        if (bp.status === "fulfilled") setBloodPressure(contentOf(bp.value));
        if (w.status === "fulfilled") setWeight(contentOf(w.value));
        if (member.status === "fulfilled")
          setProfile(member.value?.data ?? null);
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [userId]);

  const latestSugar = bloodSugar.find((r) => r.bloodSugar != null)?.bloodSugar;
  const latestBP = bloodPressure.find((r) => r.systolicBP != null);
  const profileWeight =
    profile?.weight ?? weight.find((r) => r.weight != null)?.weight ?? null;
  const heightCm = profile?.height ?? null;
  const bmi =
    profileWeight != null && heightCm
      ? Number(
          (profileWeight / ((heightCm / 100) * (heightCm / 100))).toFixed(1),
        )
      : null;

  const sugarAvg = useMemo(
    () =>
      avg(bloodSugar.map((r) => Number(r.bloodSugar)).filter(Number.isFinite)),
    [bloodSugar],
  );

  // 최근 14건 혈당 추이 (오래된→최신)
  const sugarTrend = useMemo(() => {
    return bloodSugar
      .filter((r) => r.bloodSugar != null)
      .slice(0, 14)
      .map((r) => ({
        date: String(r.recordDate || "").slice(5),
        value: Number(r.bloodSugar),
      }))
      .reverse();
  }, [bloodSugar]);

  // 최근 14건 혈압 추이 (오래된→최신)
  const bpTrend = useMemo(() => {
    return bloodPressure
      .filter((r) => r.systolicBP != null && r.diastolicBP != null)
      .slice(0, 14)
      .map((r) => ({
        date: String(r.recordDate || "").slice(5),
        systolic: Number(r.systolicBP),
        diastolic: Number(r.diastolicBP),
      }))
      .reverse();
  }, [bloodPressure]);

  // 최근 14건 체중 추이 (오래된→최신)
  const weightTrend = useMemo(() => {
    return weight
      .filter((r) => r.weight != null)
      .slice(0, 14)
      .map((r) => ({
        date: String(r.recordDate || "").slice(5),
        value: Number(r.weight),
      }))
      .reverse();
  }, [weight]);

  // 최근 14건 BMI 추이 (체중 기록 + 프로필 키 기준, 오래된→최신)
  const bmiTrend = useMemo(() => {
    if (!heightCm) return [];
    const h = heightCm / 100;
    return weight
      .filter((r) => r.weight != null)
      .slice(0, 14)
      .map((r) => ({
        date: String(r.recordDate || "").slice(5),
        value: Number((Number(r.weight) / (h * h)).toFixed(1)),
      }))
      .reverse();
  }, [weight, heightCm]);

  const chartViews = {
    bloodSugar: {
      title: "최근 혈당 추이",
      data: sugarTrend,
      empty: "혈당 기록이 없습니다.",
      lines: [{ key: "value", name: "혈당", color: "#16a34a" }],
    },
    bloodPressure: {
      title: "최근 혈압 추이",
      data: bpTrend,
      empty: "혈압 기록이 없습니다.",
      lines: [
        { key: "systolic", name: "수축기", color: "#ED5934" },
        { key: "diastolic", name: "이완기", color: "#F59874" },
      ],
    },
    weight: {
      title: "최근 체중 추이",
      data: weightTrend,
      empty: "체중 기록이 없습니다.",
      lines: [{ key: "value", name: "체중", color: "#3B82F6" }],
    },
    bmi: {
      title: "최근 BMI 추이",
      data: bmiTrend,
      empty: heightCm ? "체중 기록이 없습니다." : "키 정보가 필요합니다.",
      lines: [{ key: "value", name: "BMI", color: "#0f1c33" }],
    },
  };
  const activeView = chartViews[chartTab] ?? chartViews.bloodSugar;

  const Shell = ({ children }) => (
    <SafeAreaView className="flex-1 bg-[#F9FAFB]" edges={["top"]}>
      <ScrollView
        className="flex-1"
        contentContainerStyle={{ paddingHorizontal: 24, paddingVertical: 32 }}
      >
        <View className="mb-6 flex-row items-center gap-3">
          <View className="h-11 w-11 items-center justify-center rounded-xl bg-[#0f1c33]">
            <FileText size={20} color="#FFFFFF" />
          </View>
          <View className="flex-1">
            <Text className="text-[24px] font-extrabold text-[#0F172A]">
              건강 리포트
            </Text>
            <Text className="text-sm text-[#64748B]">
              나의 최근 건강 지표를 한눈에 확인하세요.
            </Text>
          </View>
        </View>
        {children}
      </ScrollView>
    </SafeAreaView>
  );

  if (loading) {
    return (
      <Shell>
        <View className="rounded-2xl bg-white p-16 items-center">
          <Text className="text-sm text-[#64748B]">불러오는 중...</Text>
        </View>
      </Shell>
    );
  }

  if (!reportAccess) {
    return (
      <Shell>
        <View className="rounded-2xl border border-gray-100 bg-white p-12 items-center">
          <View className="mb-4 h-14 w-14 items-center justify-center rounded-full bg-[#F1F5F9]">
            <Lock size={24} color="#94A3B8" />
          </View>
          <Text className="text-[18px] font-bold text-[#0F172A]">
            개인/가족 플랜 전용 기능입니다
          </Text>
          <Text className="mt-2 text-[13px] text-[#64748B] text-center">
            건강 리포트는 개인 플랜 또는 가족 플랜에서 이용할 수 있어요.
          </Text>
          <Pressable
            onPress={() => router.push("/member")}
            className="mt-5 h-11 justify-center rounded-xl bg-[#0f1c33] px-6"
          >
            <Text className="text-sm font-semibold text-white">
              구독하러 가기
            </Text>
          </Pressable>
        </View>
      </Shell>
    );
  }

  return (
    <Shell>
      <View className="flex-row flex-wrap gap-4">
        <SummaryCard
          icon={Droplet}
          accent="#16a34a"
          bg="#ECFDF5"
          label="최근 혈당"
          value={latestSugar ?? null}
          unit="mg/dL"
          sub={sugarAvg != null ? `평균 ${sugarAvg} mg/dL` : "기록 없음"}
        />
        <SummaryCard
          icon={HeartPulse}
          accent="#ED5934"
          bg="#FFEEE3"
          label="최근 혈압"
          value={
            latestBP ? `${latestBP.systolicBP}/${latestBP.diastolicBP}` : null
          }
          unit="mmHg"
          sub={latestBP ? "수축기 / 이완기" : "기록 없음"}
        />
        <SummaryCard
          icon={Scale}
          accent="#3B82F6"
          bg="#EFF6FF"
          label="체중"
          value={profileWeight ?? null}
          unit="kg"
          sub={heightCm ? `키 ${heightCm}cm` : null}
        />
        <SummaryCard
          icon={FileText}
          accent="#0f1c33"
          bg="#F1F5F9"
          label="BMI"
          value={bmi ?? null}
          unit=""
          sub={
            bmi == null
              ? "체중/키 필요"
              : bmi < 18.5
                ? "저체중"
                : bmi < 23
                  ? "정상"
                  : bmi < 25
                    ? "과체중"
                    : "비만"
          }
        />
      </View>

      <View className="mt-5 rounded-2xl border border-gray-100 bg-white p-6">
        <View className="mb-4 flex-row flex-wrap items-center justify-between gap-3">
          <Text className="text-[15px] font-bold text-[#0F172A]">
            {activeView.title}
          </Text>
          <View className="flex-row rounded-full bg-[#F1F5F9] p-1">
            {CHART_TABS.map((t) => (
              <Pressable
                key={t.key}
                onPress={() => setChartTab(t.key)}
                className={`rounded-full px-3.5 py-1.5 ${
                  chartTab === t.key ? "bg-white" : ""
                }`}
              >
                <Text
                  className={`text-[13px] font-semibold ${
                    chartTab === t.key ? "text-[#0F172A]" : "text-[#64748B]"
                  }`}
                >
                  {t.label}
                </Text>
              </Pressable>
            ))}
          </View>
        </View>
        {activeView.data.length === 0 ? (
          <Text className="py-10 text-center text-sm text-[#94A3B8]">
            {activeView.empty}
          </Text>
        ) : (
          <TrendBars data={activeView.data} lines={activeView.lines} />
        )}
      </View>
    </Shell>
  );
}
