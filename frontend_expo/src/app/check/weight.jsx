import { useCallback, useEffect, useMemo, useState } from "react";
import { View, Text, Pressable, ScrollView, TextInput } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import Svg, { Polyline, Circle, Line as SvgLine } from "react-native-svg";
import { useAuth } from "../../context/AuthContext";
import bioValueRecordApi from "../../api/bioValueRecordApi";
import userConfigApi from "../../api/userConfigApi";
import userApi from "../../api/userApi";
import WeightRecordModal from "../../components/modals/WeightRecordModal";

const WEIGHT_CATEGORY = "Weight";
const pad = (n) => String(n).padStart(2, "0");
const toDateStr = (d) => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;

const todayStr = () => toDateStr(new Date());
const daysAgoStr = (n) => {
  const d = new Date();
  d.setDate(d.getDate() - n);
  return toDateStr(d);
};

// MetricCard 대체
function MetricCard({ children }) {
  return (
    <View className="flex flex-col rounded-[18px] border border-[#E5E7EB] bg-white p-5 shadow-sm">
      {children}
    </View>
  );
}

// 간단한 라인 차트 (recharts LineChart 대체 — react-native-svg)
function LineChartSvg({ data }) {
  const W = 320;
  const H = 200;
  const pad = 24;
  if (!data.length) return null;
  const xs = data.map((_, i) =>
    data.length === 1 ? W / 2 : pad + (i / (data.length - 1)) * (W - pad * 2),
  );
  const values = data.map((d) => d.weight);
  const min = Math.min(...values) - 2;
  const max = Math.max(...values) + 2;
  const range = max - min || 1;
  const ys = values.map((v) => pad + (1 - (v - min) / range) * (H - pad * 2));
  const points = xs.map((x, i) => `${x},${ys[i]}`).join(" ");
  return (
    <Svg width="100%" height={H} viewBox={`0 0 ${W} ${H}`}>
      {[0.25, 0.5, 0.75].map((g) => (
        <SvgLine
          key={g}
          x1={pad}
          x2={W - pad}
          y1={pad + g * (H - pad * 2)}
          y2={pad + g * (H - pad * 2)}
          stroke="#f0f0f0"
          strokeWidth={1}
        />
      ))}
      {data.length > 1 && (
        <Polyline points={points} fill="none" stroke="#3b82f6" strokeWidth={2} />
      )}
      {xs.map((x, i) => (
        <Circle key={i} cx={x} cy={ys[i]} r={4} fill="#3b82f6" stroke="#fff" strokeWidth={2} />
      ))}
    </Svg>
  );
}

export default function WeightRecord() {
  const { user } = useAuth();
  const userId = user?.userId ?? user?.id;

  const [latestWeight, setLatestWeight] = useState(null);
  const [weeklyRecords, setWeeklyRecords] = useState([]);
  const [targetWeight, setTargetWeight] = useState(null);
  const [heightCm, setHeightCm] = useState(null);

  const defaultStart = daysAgoStr(6);
  const defaultEnd = todayStr();
  const [startInput, setStartInput] = useState(defaultStart);
  const [endInput, setEndInput] = useState(defaultEnd);
  const [chartRange, setChartRange] = useState({ start: defaultStart, end: defaultEnd });

  const [modalOpen, setModalOpen] = useState(false);
  const selectedDate = todayStr();

  const fetchWeeklyRecords = useCallback(() => {
    if (!userId) return;
    bioValueRecordApi
      .searchByDateBetween(userId, WEIGHT_CATEGORY, chartRange.start, chartRange.end)
      .then((res) => {
        const list = Array.isArray(res?.data) ? res.data : [];
        setWeeklyRecords(list);
      })
      .catch(() => {});
  }, [userId, chartRange]);

  useEffect(() => {
    if (!userId) return;
    let cancelled = false;

    Promise.allSettled([
      bioValueRecordApi.getLatestPageByCategory(userId, WEIGHT_CATEGORY),
      userConfigApi.getTargetWeight(userId),
      userApi.getMember(userId),
    ]).then(([latestRes, targetRes, memberRes]) => {
      if (cancelled) return;

      let recordWeight = null;
      if (latestRes.status === "fulfilled") {
        const content = latestRes.value?.data?.content ?? [];
        if (content[0]?.weight != null) recordWeight = Number(content[0].weight);
      }

      let profileWeight = null;
      if (memberRes.status === "fulfilled" && memberRes.value?.data) {
        const member = memberRes.value.data;
        if (member.height != null) setHeightCm(Number(member.height));
        if (member.weight != null) profileWeight = Number(member.weight);
      }

      setLatestWeight(profileWeight ?? recordWeight);

      if (targetRes.status === "fulfilled" && targetRes.value?.data != null) {
        setTargetWeight(Number(targetRes.value.data));
      }
    });

    return () => {
      cancelled = true;
    };
  }, [userId]);

  useEffect(() => {
    fetchWeeklyRecords();
  }, [fetchWeeklyRecords]);

  const chartData = useMemo(
    () =>
      weeklyRecords
        .filter((r) => r.weight != null)
        .map((r) => ({ date: r.recordDate, weight: Number(r.weight) }))
        .sort((a, b) => (a.date < b.date ? -1 : 1)),
    [weeklyRecords],
  );

  const weeklyAvg = useMemo(() => {
    if (!chartData.length) return null;
    const sum = chartData.reduce((acc, r) => acc + r.weight, 0);
    return +(sum / chartData.length).toFixed(1);
  }, [chartData]);

  const weeklyDelta = useMemo(() => {
    if (latestWeight == null || weeklyAvg == null) return null;
    return +(latestWeight - weeklyAvg).toFixed(1);
  }, [latestWeight, weeklyAvg]);

  const bmi = useMemo(() => {
    if (latestWeight == null || !heightCm) return null;
    const h = heightCm / 100;
    return +(latestWeight / (h * h)).toFixed(1);
  }, [latestWeight, heightCm]);

  const bmiPosition = useMemo(() => {
    if (bmi == null) return 0;
    return Math.max(0, Math.min(100, ((bmi - 15) / (30 - 15)) * 100));
  }, [bmi]);

  const PROGRESS_SCALE_KG = 10;
  const targetProgress = useMemo(() => {
    if (latestWeight == null || targetWeight == null) return 0;
    const diff = Math.abs(latestWeight - targetWeight);
    const progress = 100 - (diff / PROGRESS_SCALE_KG) * 100;
    return Math.max(0, Math.min(100, Math.round(progress)));
  }, [latestWeight, targetWeight]);

  const remaining = useMemo(() => {
    if (latestWeight == null || targetWeight == null) return null;
    return +(targetWeight - latestWeight).toFixed(1);
  }, [latestWeight, targetWeight]);

  const showInc = weeklyDelta != null && weeklyDelta > 0;
  const showDec = weeklyDelta != null && weeklyDelta < 0;

  return (
    <SafeAreaView className="flex-1 bg-[#F9FAFB]">
      <ScrollView contentContainerStyle={{ padding: 16, paddingBottom: 40 }}>
        <View className="flex-row items-center justify-between">
          <Text className="text-[26px] font-extrabold text-[#0F172A]">체중 기록 확인</Text>
          <Pressable
            onPress={() => setModalOpen(true)}
            className="rounded-lg bg-[#0F172A] px-3 py-1.5"
          >
            <Text className="text-[12px] font-semibold text-white">+ 기록</Text>
          </Pressable>
        </View>
        <Text className="mt-1 mb-6 text-[14px] text-[#64748B]">
          지난 신체 변화를 분석한 결과입니다.
        </Text>

        <View className="gap-4">
          {/* 현재 체중 */}
          <MetricCard>
            <Text className="text-[12px] font-medium text-blue-600">현재 체중</Text>
            <View className="mt-3 flex-row items-end gap-2">
              <Text className="text-[36px] font-bold leading-none text-[#0F172A]">
                {latestWeight ?? "—"}
              </Text>
              <Text className="pb-1 text-[14px] text-[#64748B]">kg</Text>
            </View>
            <Text
              className={`mt-3 text-[11px] font-semibold ${
                showInc ? "text-rose-500" : showDec ? "text-blue-500" : "text-[#94A3B8]"
              }`}
            >
              {weeklyDelta != null
                ? `${showInc ? "▲" : showDec ? "▼" : ""} 지난주 평균 대비 ${
                    weeklyDelta > 0 ? "+" : ""
                  }${weeklyDelta} kg`
                : "지난주 기록이 부족합니다"}
            </Text>
          </MetricCard>

          {/* BMI 지수 */}
          <MetricCard>
            <Text className="text-[12px] font-medium text-[#64748B]">BMI 지수</Text>
            <View className="mt-3 flex-row items-end gap-2">
              <Text className="text-[36px] font-bold leading-none text-[#0F172A]">
                {bmi ?? "—"}
              </Text>
              {bmi != null && (
                <Text className="pb-1 text-[12px] text-[#94A3B8]">체중 / 신장(m)²</Text>
              )}
            </View>
            <View className="mt-3">
              <View className="relative h-1.5 rounded-full bg-[#E5E7EB]">
                {bmi != null && (
                  <View
                    style={{ left: `${bmiPosition}%` }}
                    className="absolute -top-1 h-3 w-3 rounded-full border-2 border-white bg-[#0F172A]"
                  />
                )}
              </View>
              <View className="mt-2 flex-row justify-between">
                <Text className="text-[10px] text-[#94A3B8]">저체중</Text>
                <Text className="text-[10px] text-[#94A3B8]">정상</Text>
                <Text className="text-[10px] text-[#94A3B8]">과체중</Text>
              </View>
            </View>
          </MetricCard>

          {/* 목표 체중 */}
          <MetricCard>
            <Text className="text-[12px] font-medium text-red-500">목표 체중</Text>
            <View className="mt-3 flex-row items-end gap-2">
              <Text className="text-[36px] font-bold leading-none text-[#0F172A]">
                {targetWeight ?? "—"}
              </Text>
              <Text className="pb-1 text-[14px] text-[#64748B]">kg</Text>
            </View>
            <View className="mt-3">
              <View className="h-1.5 w-full rounded-full bg-[#E5E7EB]">
                <View
                  style={{ width: `${targetProgress}%` }}
                  className="h-full rounded-full bg-blue-600"
                />
              </View>
              <View className="mt-2 flex-row justify-between">
                <Text className="text-[10px] text-[#94A3B8]">
                  {latestWeight != null ? `현재 ${latestWeight}kg` : "현재 —"}
                </Text>
                <Text className="text-[10px] font-semibold text-blue-600">
                  {targetProgress}%
                </Text>
                <Text className="text-[10px] text-[#94A3B8]">
                  {remaining != null
                    ? `목표까지 ${remaining > 0 ? "+" : ""}${remaining}kg`
                    : "목표까지 —"}
                </Text>
              </View>
            </View>
          </MetricCard>
        </View>

        {/* 체중 변화 추이 */}
        <View className="mt-6 rounded-[18px] border border-[#E5E7EB] bg-white p-5 shadow-sm">
          <Text className="text-[18px] font-bold text-[#0F172A]">체중 변화 추이</Text>

          <View className="mt-4 flex-row items-center gap-2">
            <TextInput
              value={startInput}
              onChangeText={setStartInput}
              placeholder="시작 YYYY-MM-DD"
              className="flex-1 rounded-[10px] border border-[#E5E7EB] bg-white px-3 py-2 text-[12px] text-[#0F172A]"
            />
            <Text className="text-[#94A3B8]">~</Text>
            <TextInput
              value={endInput}
              onChangeText={setEndInput}
              placeholder="종료 YYYY-MM-DD"
              className="flex-1 rounded-[10px] border border-[#E5E7EB] bg-white px-3 py-2 text-[12px] text-[#0F172A]"
            />
          </View>
          <View className="mt-2 flex-row gap-2">
            <Pressable
              onPress={() => setChartRange({ start: startInput, end: endInput })}
              className="rounded-[10px] bg-[#0F172A] px-4 py-2"
            >
              <Text className="text-[13px] font-semibold text-white">적용</Text>
            </Pressable>
            {(chartRange.start !== defaultStart || chartRange.end !== defaultEnd) && (
              <Pressable
                onPress={() => {
                  setStartInput(defaultStart);
                  setEndInput(defaultEnd);
                  setChartRange({ start: defaultStart, end: defaultEnd });
                }}
                className="rounded-[10px] border border-[#E5E7EB] bg-white px-3 py-2"
              >
                <Text className="text-[13px] font-semibold text-[#64748B]">초기화</Text>
              </Pressable>
            )}
          </View>

          <View className="mt-4">
            {chartData.length === 0 ? (
              <Text className="py-10 text-center text-[13px] text-[#94A3B8]">
                해당 기간에 체중 기록이 없습니다.
              </Text>
            ) : (
              <>
                <LineChartSvg data={chartData} />
                <View className="mt-3 gap-1">
                  {chartData.map((d) => (
                    <View key={d.date} className="flex-row justify-between">
                      <Text className="text-[12px] text-[#64748B]">{d.date}</Text>
                      <Text className="text-[12px] font-semibold text-[#0F172A]">
                        {d.weight} kg
                      </Text>
                    </View>
                  ))}
                </View>
              </>
            )}
          </View>
        </View>
      </ScrollView>

      <WeightRecordModal
        visible={modalOpen}
        onClose={() => setModalOpen(false)}
        onSaved={() => {
          setModalOpen(false);
          fetchWeeklyRecords();
        }}
        date={selectedDate}
      />
    </SafeAreaView>
  );
}
