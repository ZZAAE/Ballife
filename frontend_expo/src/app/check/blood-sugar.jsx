import { useCallback, useEffect, useState } from "react";
import { View, Text, Pressable, ScrollView, TextInput } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import Svg, { Polyline, Circle, Line as SvgLine } from "react-native-svg";
import { useAuth } from "../../context/AuthContext";
import bioValueRecordApi from "../../api/bioValueRecordApi";
import BloodsugarModal from "../../components/modals/BloodsugarModal";
import DateField from "../../components/DateField";

// context 우선 (web localStorage 폴백은 RN 미지원이라 제거)
const resolveUserId = (user) => user?.userId ?? user?.id ?? user?.memberId ?? null;

function MetricCard({ children, className = "" }) {
  return (
    <View className={`flex flex-col rounded-[18px] border border-[#E5E7EB] bg-white p-5 shadow-sm ${className}`}>
      {children}
    </View>
  );
}

// 두 시리즈 라인 차트 (recharts AreaChart 대체 — react-native-svg)
function DualLineChart({ data, keys }) {
  const W = 320;
  const H = 200;
  const pad = 24;
  if (!data.length) return null;
  const xFor = (i) =>
    data.length === 1 ? W / 2 : pad + (i / (data.length - 1)) * (W - pad * 2);
  // 혈당 도메인: 0~250 (web과 동일)
  const yFor = (v) => pad + (1 - v / 250) * (H - pad * 2);
  return (
    <Svg width="100%" height={H} viewBox={`0 0 ${W} ${H}`}>
      {[0, 50, 100, 150, 200, 250].map((t) => (
        <SvgLine
          key={t}
          x1={pad}
          x2={W - pad}
          y1={yFor(t)}
          y2={yFor(t)}
          stroke="#f0f0f0"
          strokeWidth={1}
        />
      ))}
      {keys.map((k) => {
        const pts = data
          .map((d, i) => (d[k.key] != null ? `${xFor(i)},${yFor(d[k.key])}` : null))
          .filter(Boolean)
          .join(" ");
        return (
          <Polyline key={k.key} points={pts} fill="none" stroke={k.color} strokeWidth={2.5} />
        );
      })}
      {keys.map((k) =>
        data.map((d, i) =>
          d[k.key] != null ? (
            <Circle
              key={`${k.key}${i}`}
              cx={xFor(i)}
              cy={yFor(d[k.key])}
              r={4}
              fill="#fff"
              stroke={k.color}
              strokeWidth={2}
            />
          ) : null,
        ),
      )}
    </Svg>
  );
}

export default function BloodSugarRecord() {
  const { user } = useAuth();
  const userId = resolveUserId(user);

  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(false);

  const [chartView, setChartView] = useState("mealtime"); // "mealtime" | "fasting"

  const [pendingStart, setPendingStart] = useState(
    () => new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString().split("T")[0],
  );
  const [pendingEnd, setPendingEnd] = useState(() => new Date().toISOString().split("T")[0]);
  const [filterStart, setFilterStart] = useState(pendingStart);
  const [filterEnd, setFilterEnd] = useState(pendingEnd);

  const [modalOpen, setModalOpen] = useState(false);
  const selectedDate = new Date().toISOString().split("T")[0];

  const handleApply = () => {
    setFilterStart(pendingStart);
    setFilterEnd(pendingEnd);
  };

  const fetchRecords = useCallback(() => {
    if (!userId) return;
    setLoading(true);
    bioValueRecordApi
      .getPageByCategorySugar(userId, 0, 200)
      .then((res) => {
        const content = res.data?.content ?? [];
        setRecords(content);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [userId]);

  useEffect(() => {
    fetchRecords();
  }, [fetchRecords]);

  const filteredRecords = [...records].filter(
    (r) => r.recordDate >= filterStart && r.recordDate <= filterEnd,
  );

  const toGroup = (cat) => {
    if (!cat) return null;
    const suffix = cat.includes("-") ? cat.split("-")[1] : cat;
    if (suffix === "공복" || suffix === "공복혈당") return "공복";
    if (suffix.includes("식전")) return "식전";
    if (suffix.includes("식후")) return "식후";
    if (suffix === "취침전") return "취침전";
    return null;
  };

  const chartData = [...filteredRecords].reverse().map((r) => {
    const group = toGroup(r.category);
    return {
      date: `${r.recordDate ? r.recordDate.slice(5) : ""} ${
        r.recordTime ? r.recordTime.slice(0, 5) : ""
      }`.trim(),
      공복: group === "공복" ? r.bloodSugar ?? null : null,
      식전: group === "식전" ? r.bloodSugar ?? null : null,
      식후: group === "식후" ? r.bloodSugar ?? null : null,
      취침전: group === "취침전" ? r.bloodSugar ?? null : null,
    };
  });

  const mealtimeData = chartData.filter((r) => r.식전 !== null || r.식후 !== null);
  const fastingData = chartData.filter((r) => r.공복 !== null || r.취침전 !== null);

  const avgByGroup = (group) => {
    const vals = filteredRecords
      .filter((r) => toGroup(r.category) === group)
      .map((r) => r.bloodSugar)
      .filter((v) => v != null);
    return vals.length > 0
      ? Math.round(vals.reduce((s, v) => s + v, 0) / vals.length)
      : null;
  };
  const avgMealBefore = avgByGroup("식전");
  const avgMealAfter = avgByGroup("식후");

  const latestMealBefore = filteredRecords.find((r) => toGroup(r.category) === "식전");
  const latestMealAfter = filteredRecords.find((r) => toGroup(r.category) === "식후");
  const latestFasting = filteredRecords.find((r) => toGroup(r.category) === "공복");

  const activeData = chartView === "mealtime" ? mealtimeData : fastingData;
  const activeKeys =
    chartView === "mealtime"
      ? [
          { key: "식전", label: "식전", color: "#3b82f6" },
          { key: "식후", label: "식후", color: "#22c55e" },
        ]
      : [
          { key: "공복", label: "공복", color: "#f43f5e" },
          { key: "취침전", label: "취침전", color: "#a855f7" },
        ];

  return (
    <SafeAreaView className="flex-1 bg-[#F9FAFB]">
      <ScrollView contentContainerStyle={{ padding: 16, paddingBottom: 40 }}>
        <View className="flex-row items-center justify-between">
          <Text className="text-[26px] font-extrabold text-[#0F172A]">혈당 기록 확인</Text>
          <Pressable
            onPress={() => setModalOpen(true)}
            className="rounded-lg bg-[#0F172A] px-3 py-1.5"
          >
            <Text className="text-[12px] font-semibold text-white">+ 기록</Text>
          </Pressable>
        </View>
        <Text className="mt-1 mb-6 text-[14px] text-[#64748B]">
          지난 혈당 변화를 분석한 결과입니다.
        </Text>

        <View className="gap-4">
          {/* 평균 혈당 */}
          <MetricCard className="bg-rose-50/30">
            <Text className="text-[14px] font-semibold text-rose-500">평균 혈당</Text>
            <View className="mt-3 flex-row items-end gap-2">
              <Text className="text-[40px] font-extrabold leading-none text-blue-500">
                {loading ? "…" : avgMealBefore ?? "--"}
              </Text>
              <Text className="pb-1 text-[20px] text-[#94A3B8]">/</Text>
              <Text className="text-[40px] font-extrabold leading-none text-red-500">
                {loading ? "…" : avgMealAfter ?? "--"}
              </Text>
              <Text className="pb-1 text-[14px] font-semibold text-[#64748B]">mg/dL</Text>
            </View>
            <View className="mt-3 flex-row items-center gap-2 self-start rounded-full bg-rose-50 px-3 py-1.5">
              <View className="h-2 w-2 rounded-full bg-rose-400" />
              <Text className="text-[12px] font-semibold text-rose-600">
                {filteredRecords.length > 0
                  ? `기간 내 ${filteredRecords.length}건 평균`
                  : "기록 없음"}
              </Text>
            </View>
          </MetricCard>

          {/* 최근 혈당 */}
          <MetricCard>
            <Text className="text-[12px] font-medium text-[#64748B]">최근 혈당</Text>
            <View className="mt-3 flex-row items-end gap-2">
              <Text className="text-[32px] font-bold leading-none text-blue-500">
                {loading ? "…" : latestMealBefore?.bloodSugar ?? "--"}
              </Text>
              <Text className="pb-1 text-[20px] text-[#94A3B8]">/</Text>
              <Text className="text-[32px] font-bold leading-none text-red-500">
                {loading ? "…" : latestMealAfter?.bloodSugar ?? "--"}
              </Text>
              <Text className="pb-1 text-[14px] text-[#64748B]">mg/dL</Text>
            </View>
            <Text className="mt-3 text-[12px] font-semibold text-blue-600">식전 / 식후</Text>
          </MetricCard>

          {/* 최근 공복 혈당 */}
          <MetricCard>
            <Text className="text-[12px] font-medium text-[#64748B]">최근 공복 혈당</Text>
            <View className="mt-3 flex-row items-end gap-2">
              <Text className="text-[32px] font-bold leading-none text-green-500">
                {loading ? "…" : latestFasting?.bloodSugar ?? "--"}
              </Text>
              <Text className="pb-1 text-[14px] text-[#64748B]">mg/dL</Text>
            </View>
            <Text className="mt-3 text-[12px] font-semibold text-green-500">공복</Text>
          </MetricCard>
        </View>

        {/* 혈당 변화 추이 */}
        <View className="mt-6 rounded-[18px] border border-[#E5E7EB] bg-white p-5 shadow-sm">
          <Text className="text-[18px] font-bold text-[#0F172A]">혈당 변화 추이</Text>

          {/* 뷰 토글 */}
          <View className="mt-3 flex-row self-start rounded-full bg-slate-100 p-1">
            <Pressable
              onPress={() => setChartView("mealtime")}
              className={`rounded-full px-4 py-1.5 ${
                chartView === "mealtime" ? "bg-white" : ""
              }`}
            >
              <Text
                className={`text-[12px] font-semibold ${
                  chartView === "mealtime" ? "text-slate-900" : "text-slate-500"
                }`}
              >
                식전 · 식후
              </Text>
            </Pressable>
            <Pressable
              onPress={() => setChartView("fasting")}
              className={`rounded-full px-4 py-1.5 ${
                chartView === "fasting" ? "bg-white" : ""
              }`}
            >
              <Text
                className={`text-[12px] font-semibold ${
                  chartView === "fasting" ? "text-slate-900" : "text-slate-500"
                }`}
              >
                공복 · 취침전
              </Text>
            </Pressable>
          </View>

          <View className="mt-3 flex-row items-center gap-2">
            <View className="flex-1">
              <DateField
                value={pendingStart}
                onChange={setPendingStart}
                maximumDate={new Date()}
              />
            </View>
            <Text className="text-[#94A3B8]">~</Text>
            <View className="flex-1">
              <DateField
                value={pendingEnd}
                onChange={setPendingEnd}
                maximumDate={new Date()}
              />
            </View>
            <Pressable onPress={handleApply} className="rounded-[10px] bg-[#0F172A] px-4 py-2">
              <Text className="text-[13px] font-semibold text-white">적용</Text>
            </Pressable>
          </View>

          <View className="mt-4">
            {chartData.length === 0 ? (
              <Text className="py-10 text-center text-[13px] text-[#94A3B8]">
                해당 기간에 혈당 기록이 없습니다.
              </Text>
            ) : (
              <>
                <View className="flex-row gap-4">
                  {activeKeys.map((k) => (
                    <Text key={k.key} style={{ color: k.color }} className="text-[11px]">
                      ● {k.label}
                    </Text>
                  ))}
                </View>
                <DualLineChart data={activeData} keys={activeKeys} />
                <View className="mt-3 gap-1">
                  {activeData.map((d, i) => (
                    <View key={i} className="flex-row justify-between">
                      <Text className="text-[12px] text-[#64748B]">{d.date}</Text>
                      <Text className="text-[12px] font-semibold text-[#0F172A]">
                        {activeKeys
                          .filter((k) => d[k.key] != null)
                          .map((k) => `${k.label} ${d[k.key]}`)
                          .join(" · ")}{" "}
                        mg/dL
                      </Text>
                    </View>
                  ))}
                </View>
              </>
            )}
          </View>
        </View>
      </ScrollView>

      <BloodsugarModal
        visible={modalOpen}
        onClose={() => setModalOpen(false)}
        onSaved={() => {
          setModalOpen(false);
          fetchRecords();
        }}
        date={selectedDate}
      />
    </SafeAreaView>
  );
}
