import { useCallback, useEffect, useMemo, useState } from "react";
import { View, Text, Pressable, ScrollView, TextInput, AppState } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import Svg, { Polyline, Circle, Line as SvgLine } from "react-native-svg";
import bioValueRecordApi from "../../api/bioValueRecordApi";
import { useAuth } from "../../context/AuthContext";
import BloodPressureRecordModal from "../../components/modals/BloodPressureRecordModal";
import DateField from "../../components/DateField";

// context 우선 (web localStorage 폴백은 RN 미지원이라 제거)
const resolveUserId = (user) => user?.userId ?? user?.id ?? user?.memberId ?? null;

const isBloodPressureRecord = (r) =>
  r &&
  r.systolicBP != null &&
  (typeof r.category !== "string" || r.category.startsWith("BloodPressure"));

const pad2 = (n) => String(n).padStart(2, "0");

const formatDateLabel = (dateStr) => {
  if (!dateStr) return "";
  const d = new Date(dateStr);
  if (Number.isNaN(d.getTime())) return dateStr;
  return `${pad2(d.getMonth() + 1)}-${pad2(d.getDate())}`;
};

function MetricCard({ children, className = "" }) {
  return (
    <View className={`flex flex-col rounded-[18px] border border-[#E5E7EB] bg-white p-5 shadow-sm ${className}`}>
      {children}
    </View>
  );
}

// 두 시리즈 라인 차트 (recharts AreaChart 대체 — react-native-svg)
function DualLineChart({ data }) {
  const W = 320;
  const H = 200;
  const pad = 24;
  if (!data.length) return null;
  const all = data.flatMap((d) => [d.systolic, d.diastolic]).filter((v) => v != null);
  const min = Math.min(...all) - 10;
  const max = Math.max(...all) + 10;
  const range = max - min || 1;
  const xFor = (i) =>
    data.length === 1 ? W / 2 : pad + (i / (data.length - 1)) * (W - pad * 2);
  const yFor = (v) => pad + (1 - (v - min) / range) * (H - pad * 2);
  const series = (key) => data.map((d, i) => `${xFor(i)},${yFor(d[key])}`).join(" ");
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
        <>
          <Polyline points={series("systolic")} fill="none" stroke="#2563eb" strokeWidth={2.5} />
          <Polyline points={series("diastolic")} fill="none" stroke="#06b6d4" strokeWidth={2.5} />
        </>
      )}
      {data.map((d, i) => (
        <Circle key={`s${i}`} cx={xFor(i)} cy={yFor(d.systolic)} r={4} fill="#2563eb" stroke="#fff" strokeWidth={2} />
      ))}
      {data.map((d, i) => (
        <Circle key={`d${i}`} cx={xFor(i)} cy={yFor(d.diastolic)} r={4} fill="#06b6d4" stroke="#fff" strokeWidth={2} />
      ))}
    </Svg>
  );
}

export default function BloodPressureRecord() {
  const { user } = useAuth();
  const userId = resolveUserId(user);

  const [bpRecords, setBpRecords] = useState([]);
  const [loading, setLoading] = useState(false);

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
      .getAllBioValueRecords(userId)
      .then((res) => {
        const list = Array.isArray(res.data) ? res.data : [];
        const filtered = list.filter(isBloodPressureRecord);
        filtered.sort((a, b) => {
          const ka = `${a.recordDate} ${a.recordTime || "00:00:00"}`;
          const kb = `${b.recordDate} ${b.recordTime || "00:00:00"}`;
          return ka.localeCompare(kb);
        });
        setBpRecords(filtered);
      })
      .catch((err) => {
        console.error("혈압 기록 조회 실패:", err);
      })
      .finally(() => setLoading(false));
  }, [userId]);

  // 마운트 시 1회
  useEffect(() => {
    fetchRecords();
  }, [fetchRecords]);

  // 앱 포그라운드 복귀 시 자동 재조회 (web: focus/visibilitychange)
  useEffect(() => {
    const sub = AppState.addEventListener("change", (state) => {
      if (state === "active") fetchRecords();
    });
    return () => sub.remove();
  }, [fetchRecords]);

  // 앱이 활성 상태일 때 5초마다 폴링
  useEffect(() => {
    const id = setInterval(() => {
      if (AppState.currentState === "active") fetchRecords();
    }, 5000);
    return () => clearInterval(id);
  }, [fetchRecords]);

  const bpData = useMemo(() => {
    return bpRecords
      .filter((r) => {
        const d = String(r.recordDate ?? "").slice(0, 10);
        return d >= filterStart && d <= filterEnd;
      })
      .map((r) => ({
        date: formatDateLabel(r.recordDate),
        systolic: r.systolicBP,
        diastolic: r.diastolicBP,
      }));
  }, [bpRecords, filterStart, filterEnd]);

  const metrics = useMemo(() => {
    const now = new Date();
    const todayKey = `${now.getFullYear()}-${pad2(now.getMonth() + 1)}-${pad2(now.getDate())}`;

    const fmt = (dateStr) => {
      const d = new Date(dateStr);
      if (Number.isNaN(d.getTime())) return dateStr;
      return `${d.getFullYear()}.${pad2(d.getMonth() + 1)}.${pad2(d.getDate())}`;
    };

    const startDateLabel = bpRecords.length > 0 ? fmt(bpRecords[0].recordDate) : "";
    const endDateLabel =
      bpRecords.length > 0 ? fmt(bpRecords[bpRecords.length - 1].recordDate) : "";

    const todayRecords = bpRecords.filter((r) => {
      if (!r.recordDate) return false;
      const dateStr = String(r.recordDate).slice(0, 10);
      return dateStr === todayKey;
    });

    if (todayRecords.length === 0) {
      return {
        avgSystolic: null,
        avgDiastolic: null,
        maxSystolicRecord: null,
        minDiastolicRecord: null,
        startDateLabel,
        endDateLabel,
      };
    }

    const sysSum = todayRecords.reduce((acc, r) => acc + (r.systolicBP || 0), 0);
    const diaSum = todayRecords.reduce((acc, r) => acc + (r.diastolicBP || 0), 0);
    const avgSystolic = Math.round(sysSum / todayRecords.length);
    const avgDiastolic = Math.round(diaSum / todayRecords.length);

    const maxSystolicRecord = todayRecords.reduce(
      (best, r) => (r.systolicBP > (best?.systolicBP ?? -Infinity) ? r : best),
      null,
    );
    const minDiastolicRecord = todayRecords.reduce(
      (best, r) => (r.diastolicBP < (best?.diastolicBP ?? Infinity) ? r : best),
      null,
    );

    return {
      avgSystolic,
      avgDiastolic,
      maxSystolicRecord,
      minDiastolicRecord,
      startDateLabel,
      endDateLabel,
    };
  }, [bpRecords]);

  const avgStatus = useMemo(() => {
    const s = metrics.avgSystolic;
    const d = metrics.avgDiastolic;
    if (s == null || d == null) {
      return { label: "기록 없음", color: "text-gray-500", dot: "#9ca3af" };
    }
    if (s >= 140 || d >= 90) return { label: "고혈압 범위", color: "text-rose-700", dot: "#f43f5e" };
    if (s >= 120 || d >= 80) return { label: "주의 범위", color: "text-amber-700", dot: "#f59e0b" };
    if (s <= 90 || d <= 60) return { label: "저혈압 범위", color: "text-blue-700", dot: "#3b82f6" };
    return { label: "정상 혈압 범위", color: "text-emerald-700", dot: "#10b981" };
  }, [metrics.avgSystolic, metrics.avgDiastolic]);

  const formatRecordWhen = (r) => {
    if (!r) return "기록 없음";
    const d = new Date(r.recordDate);
    if (Number.isNaN(d.getTime())) return r.recordDate;
    const month = d.getMonth() + 1;
    const day = d.getDate();
    const time = (r.recordTime || "00:00:00").slice(0, 5);
    const [hhStr, mm] = time.split(":");
    const hh = parseInt(hhStr, 10);
    const ampm = hh < 12 ? "오전" : "오후";
    const h12 = hh % 12 === 0 ? 12 : hh % 12;
    return `${month}월 ${day}일 ${ampm} ${h12}:${mm}`;
  };

  return (
    <SafeAreaView className="flex-1 bg-[#F9FAFB]">
      <ScrollView contentContainerStyle={{ padding: 16, paddingBottom: 40 }}>
        <View className="flex-row items-center justify-between">
          <Text className="text-[26px] font-extrabold text-[#0F172A]">혈압 기록 확인</Text>
          <Pressable
            onPress={() => setModalOpen(true)}
            className="rounded-lg bg-[#0F172A] px-3 py-1.5"
          >
            <Text className="text-[12px] font-semibold text-white">+ 기록</Text>
          </Pressable>
        </View>
        <Text className="mt-1 mb-6 text-[14px] text-[#64748B]">
          지난 혈압 변화를 분석한 결과입니다.
        </Text>

        <View className="gap-4">
          {/* 평균 혈압 */}
          <MetricCard className="bg-blue-50/40">
            <Text className="text-[14px] font-semibold text-blue-600">평균 혈압</Text>
            <View className="mt-3 flex-row items-end gap-2">
              <Text className="text-[40px] font-extrabold leading-none text-[#0F172A]">
                {metrics.avgSystolic ?? "-"}
              </Text>
              <Text className="pb-1 text-[20px] text-[#94A3B8]">/</Text>
              <Text className="text-[40px] font-extrabold leading-none text-cyan-600">
                {metrics.avgDiastolic ?? "-"}
              </Text>
              <Text className="pb-1 text-[14px] font-semibold text-[#64748B]">mmHg</Text>
            </View>
            <View className="mt-3 flex-row items-center gap-2 self-start rounded-full bg-[#F1F5F9] px-3 py-1.5">
              <View style={{ backgroundColor: avgStatus.dot }} className="h-2 w-2 rounded-full" />
              <Text className={`text-[12px] font-semibold ${avgStatus.color}`}>
                {avgStatus.label}
              </Text>
            </View>
          </MetricCard>

          {/* 최고 수축기 */}
          <MetricCard>
            <Text className="text-[12px] font-medium text-[#64748B]">최고 수축기</Text>
            <View className="mt-3 flex-row items-end gap-2">
              <Text className="text-[32px] font-bold leading-none text-[#0F172A]">
                {metrics.maxSystolicRecord?.systolicBP ?? "-"}
              </Text>
              <Text className="pb-1 text-[14px] text-[#64748B]">mmHg</Text>
            </View>
            <Text className="mt-3 text-[12px] font-semibold text-blue-600">
              {formatRecordWhen(metrics.maxSystolicRecord)}
            </Text>
          </MetricCard>

          {/* 최저 이완기 */}
          <MetricCard>
            <Text className="text-[12px] font-medium text-[#64748B]">최저 이완기</Text>
            <View className="mt-3 flex-row items-end gap-2">
              <Text className="text-[32px] font-bold leading-none text-[#0F172A]">
                {metrics.minDiastolicRecord?.diastolicBP ?? "-"}
              </Text>
              <Text className="pb-1 text-[14px] text-[#64748B]">mmHg</Text>
            </View>
            <Text className="mt-3 text-[12px] font-semibold text-cyan-600">
              {formatRecordWhen(metrics.minDiastolicRecord)}
            </Text>
          </MetricCard>
        </View>

        {/* 혈압 변화 추이 */}
        <View className="mt-6 rounded-[18px] border border-[#E5E7EB] bg-white p-5 shadow-sm">
          <Text className="text-[18px] font-bold text-[#0F172A]">혈압 변화 추이</Text>
          <View className="mt-1 flex-row gap-4">
            <Text className="text-[11px] text-[#64748B]">● 수축기</Text>
            <Text className="text-[11px] text-[#64748B]">● 이완기</Text>
          </View>

          <View className="mt-4 flex-row items-center gap-2">
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
            {bpData.length === 0 ? (
              <Text className="py-10 text-center text-[13px] text-[#94A3B8]">
                {loading ? "불러오는 중…" : "해당 기간에 혈압 기록이 없습니다."}
              </Text>
            ) : (
              <>
                <DualLineChart data={bpData} />
                <View className="mt-3 gap-1">
                  {bpData.map((d, i) => (
                    <View key={i} className="flex-row justify-between">
                      <Text className="text-[12px] text-[#64748B]">{d.date}</Text>
                      <Text className="text-[12px] font-semibold text-[#0F172A]">
                        {d.systolic} / {d.diastolic} mmHg
                      </Text>
                    </View>
                  ))}
                </View>
              </>
            )}
          </View>
        </View>
      </ScrollView>

      <BloodPressureRecordModal
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
