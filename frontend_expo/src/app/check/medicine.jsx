import { useCallback, useEffect, useMemo, useState } from "react";
import {
  View,
  Text,
  Pressable,
  ScrollView,
  TextInput,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import AsyncStorage from "@react-native-async-storage/async-storage";
import medicineApi from "../../api/medicineApi";
import { useAuth } from "../../context/AuthContext";
import PrescriptionRegisterModal from "../../components/modals/PrescriptionRegisterModal";
import PrescriptionDetailModal from "../../components/modals/PrescriptionDetailModal";
import PrescriptionOcrModal from "../../components/modals/PrescriptionOcrModal";

// ── 처방 데이터 변환 (web prescriptionData.js 포팅) ─────────────────────────
const SCHEDULE_SLOTS = [
  { id: "morning", label: "아침", time: "08:00", keyword: "아침" },
  { id: "lunch", label: "점심", time: "13:00", keyword: "점심" },
  { id: "dinner", label: "저녁", time: "19:00", keyword: "저녁" },
  { id: "bedtime", label: "취침전", time: "22:00", keyword: "취침전" },
];

const mapPrescriptionsToGroups = (prescriptions) =>
  (prescriptions || []).map((p) => ({
    id: p.prescriptionId,
    prescriptionId: p.prescriptionId,
    groupName: p.prescriptionName || "이름 없음",
    drugId: `presc-${p.prescriptionId}`,
    dosage: p.dosage || "-",
    intakeTime: p.prescriptionDate || "",
    startDate: p.prescriptionDate || null,
    intakeIntervals: p.intakeIntervals || "",
    memo: p.memo || "",
    medicines: (p.medicines || []).map((m) => ({
      id: m.userMedicationId,
      name: m.medicineName || "이름 없음",
      purpose: "",
      dosageText: p.dosage || "",
      imageType: "white",
    })),
  }));

const buildSchedulesFromGroups = (groups, dateKey) => {
  const list = Array.isArray(groups) ? groups : [];
  return SCHEDULE_SLOTS.map((slot) => {
    const drugs = list
      .filter(
        (g) =>
          g.medicines.length > 0 &&
          (g.intakeIntervals || "").includes(slot.keyword) &&
          (!dateKey || !g.startDate || g.startDate <= dateKey)
      )
      .map((g) => ({ id: g.drugId, name: g.groupName, taken: false }));
    return {
      id: slot.id,
      label: slot.label,
      time: slot.time,
      name: `${slot.label} 복용약`,
      note: "",
      drugs,
    };
  }).filter((s) => s.drugs.length > 0);
};

// ── 날짜 유틸 ───────────────────────────────────────────────────────────────
const formatDateKey = (date) => {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
};

const formatTimeNow = () => {
  const now = new Date();
  const h = String(now.getHours()).padStart(2, "0");
  const m = String(now.getMinutes()).padStart(2, "0");
  return `${h}:${m}`;
};

// AsyncStorage 기반 키 (web localStorage 대체)
const SCHEDULE_STORAGE_PREFIX = "medicationSchedules_";
const SAVED_RECORDS_KEY = "savedMedicationRecords";

// 저장된 taken 상태를 기준 일정에 병합
const mergeTakenState = (base, saved) =>
  base.map((slot) => {
    const savedSlot = (saved || []).find((s) => s.id === slot.id);
    if (!savedSlot || !Array.isArray(savedSlot.drugs)) return slot;
    return {
      ...slot,
      drugs: slot.drugs.map((d) => {
        const sd = savedSlot.drugs.find((x) => x.id === d.id);
        return sd ? { ...d, taken: !!sd.taken } : d;
      }),
    };
  });

export default function MedicationPage() {
  const { user } = useAuth();
  const userId = user?.userId ?? user?.id ?? null;

  const todayKey = formatDateKey(new Date());

  // PRN(비정기) 복용 기록 입력
  const [drugName, setDrugName] = useState("");
  const [dosage, setDosage] = useState("");
  const [date, setDate] = useState(() => formatDateKey(new Date()));
  const [savedRecords, setSavedRecords] = useState([]);

  // PRN 기록 복원 (AsyncStorage)
  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const raw = await AsyncStorage.getItem(SAVED_RECORDS_KEY);
        if (!cancelled && raw) {
          const parsed = JSON.parse(raw);
          if (Array.isArray(parsed)) setSavedRecords(parsed);
        }
      } catch {
        /* 무시 */
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    AsyncStorage.setItem(SAVED_RECORDS_KEY, JSON.stringify(savedRecords)).catch(
      () => {}
    );
  }, [savedRecords]);

  const handleSaveRecord = () => {
    if (!drugName.trim()) return;
    const newRecord = {
      id: Date.now(),
      drugName: drugName.trim(),
      dosage: dosage.trim(),
      date,
      time: formatTimeNow(),
    };
    setSavedRecords((prev) => [newRecord, ...prev]);
    setDrugName("");
    setDosage("");
  };

  const handleDeleteRecord = (id) => {
    setSavedRecords((prev) => prev.filter((r) => r.id !== id));
  };

  // 처방 그룹 = 단일 데이터 소스
  const [prescriptionGroups, setPrescriptionGroups] = useState([]);

  // 처방전 + 약 목록을 백엔드에서 다시 불러온다 (모달 저장/삭제 후 재호출)
  const loadPrescriptions = useCallback(async () => {
    if (userId == null) {
      setPrescriptionGroups([]);
      return;
    }
    try {
      const res = await medicineApi.getPrescriptions(userId);
      const list = Array.isArray(res.data) ? res.data : [];
      const withMeds = await Promise.all(
        list.map((p) =>
          medicineApi
            .getUserMedicine(p.prescriptionId)
            .then((r) => ({ ...p, medicines: r.data || [] }))
            .catch(() => ({ ...p, medicines: [] }))
        )
      );
      setPrescriptionGroups(mapPrescriptionsToGroups(withMeds));
    } catch {
      setPrescriptionGroups([]);
    }
  }, [userId]);

  useEffect(() => {
    loadPrescriptions();
  }, [loadPrescriptions]);

  // ── 처방전 모달 상태 ────────────────────────────────────────────────────
  const [registerOpen, setRegisterOpen] = useState(false);
  const [ocrOpen, setOcrOpen] = useState(false);
  const [detailGroup, setDetailGroup] = useState(null);

  const handlePrescriptionSaved = () => {
    loadPrescriptions();
  };

  const activeGroups = prescriptionGroups.filter((g) => g.medicines.length > 0);
  const activeDrugIds = new Set(activeGroups.map((g) => g.drugId));

  // 오늘 복용 일정 (taken 상태는 AsyncStorage 에서 병합)
  const [todaySchedules, setTodaySchedules] = useState([]);

  // 처방 그룹이 로드되면 오늘 일정을 만들고 저장된 taken 상태 병합
  useEffect(() => {
    let cancelled = false;
    (async () => {
      const base = buildSchedulesFromGroups(prescriptionGroups, todayKey);
      let merged = base;
      try {
        const raw = await AsyncStorage.getItem(
          SCHEDULE_STORAGE_PREFIX + todayKey
        );
        if (raw) {
          const saved = JSON.parse(raw);
          if (Array.isArray(saved)) merged = mergeTakenState(base, saved);
        }
      } catch {
        /* 무시 */
      }
      if (!cancelled) setTodaySchedules(merged);
    })();
    return () => {
      cancelled = true;
    };
  }, [prescriptionGroups, todayKey]);

  // 오늘 복용 체크 상태 저장 (활성 약만)
  useEffect(() => {
    const filtered = todaySchedules.map((s) => ({
      ...s,
      drugs: s.drugs.filter((d) => activeDrugIds.has(d.id)),
    }));
    AsyncStorage.setItem(
      SCHEDULE_STORAGE_PREFIX + todayKey,
      JSON.stringify(filtered)
    ).catch(() => {});
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [todaySchedules]);

  // 활성 그룹의 약만 노출
  const displaySchedules = todaySchedules.map((s) => ({
    ...s,
    drugs: s.drugs.filter((d) => activeDrugIds.has(d.id)),
  }));

  const handleToggleDrug = (scheduleId, drugId) => {
    setTodaySchedules((prev) =>
      prev.map((s) =>
        s.id === scheduleId
          ? {
              ...s,
              drugs: s.drugs.map((d) =>
                d.id === drugId ? { ...d, taken: !d.taken } : d
              ),
            }
          : s
      )
    );
  };

  const handleToggleAllDrugs = (scheduleId) => {
    setTodaySchedules((prev) =>
      prev.map((s) => {
        if (s.id !== scheduleId) return s;
        const target = s.drugs.filter((d) => activeDrugIds.has(d.id));
        const allTaken = target.length > 0 && target.every((d) => d.taken);
        return {
          ...s,
          drugs: s.drugs.map((d) =>
            activeDrugIds.has(d.id) ? { ...d, taken: !allTaken } : d
          ),
        };
      })
    );
  };

  // 복용 이행률 계산 (MedicationProgressCard 대체)
  const progress = useMemo(() => {
    let total = 0;
    let taken = 0;
    displaySchedules.forEach((s) =>
      s.drugs.forEach((d) => {
        total += 1;
        if (d.taken) taken += 1;
      })
    );
    const pct = total > 0 ? Math.round((taken / total) * 100) : 0;
    return { total, taken, pct };
  }, [displaySchedules]);

  // 처방 목록 (복용일정 라벨 포함)
  const prescriptionsForList = activeGroups.map((g) => {
    const slots = displaySchedules
      .filter((slot) => slot.drugs.some((d) => d.id === g.drugId))
      .map((slot) => slot.label);
    return {
      ...g,
      scheduleLabel: slots.length > 0 ? slots.join(" · ") : "-",
    };
  });

  // 메모 = 메모가 입력된 활성 그룹
  const memoList = activeGroups
    .filter((g) => g.memo)
    .map((g) => ({ id: g.id, groupName: g.groupName, content: g.memo }));

  return (
    <SafeAreaView className="flex-1 bg-[#F9FAFB]">
      <ScrollView>
        <View className="px-4 sm:px-6 py-8">
          {/* 제목 */}
          <View className="mb-8">
            <Text className="text-[26px] font-extrabold text-[#0F172A]">
              약 복용 관리
            </Text>
            <Text className="mt-1 text-[14px] text-[#64748B]">
              지난 복용 결과를 분석한 결과입니다.
            </Text>
          </View>

          {/* 복용 이행률 */}
          <View className="bg-white rounded-2xl border border-[#E5E7EB] p-6 mb-8">
            <Text className="text-[18px] font-bold text-[#0F172A] mb-4">
              오늘의 복용 이행률
            </Text>
            <View className="flex-row items-end justify-between mb-3">
              <Text className="text-[32px] font-extrabold text-[#0F172A]">
                {progress.pct}%
              </Text>
              <Text className="text-[14px] text-[#64748B] mb-1.5">
                {progress.taken} / {progress.total} 복용
              </Text>
            </View>
            <View className="h-[8px] rounded-full bg-[#E5E7EB] overflow-hidden">
              <View
                className="h-full rounded-full bg-emerald-500"
                style={{ width: `${progress.pct}%` }}
              />
            </View>
          </View>

          {/* 오늘의 복용 일정 (TodayScheduleCard 대체) */}
          <View className="bg-white rounded-2xl border border-[#E5E7EB] p-6 mb-8">
            <View className="flex-row items-center justify-between mb-4">
              <Text className="text-[18px] font-bold text-[#0F172A]">
                오늘의 복용 일정
              </Text>
              <Text className="text-[13px] text-[#94A3B8]">{todayKey}</Text>
            </View>

            {displaySchedules.length === 0 ? (
              <View className="py-10 items-center">
                <Text className="text-[14px] text-[#94A3B8]">
                  오늘 복용할 약이 없습니다.
                </Text>
              </View>
            ) : (
              <View className="gap-4">
                {displaySchedules.map((slot) => {
                  const allTaken =
                    slot.drugs.length > 0 && slot.drugs.every((d) => d.taken);
                  return (
                    <View
                      key={slot.id}
                      className="rounded-xl border border-[#E5E7EB] p-4"
                    >
                      <View className="flex-row items-center justify-between mb-3">
                        <View className="flex-row items-center gap-2">
                          <Text className="text-[15px] font-bold text-[#0F172A]">
                            {slot.label}
                          </Text>
                          <Text className="text-[12px] text-[#94A3B8]">
                            {slot.time}
                          </Text>
                        </View>
                        <Pressable
                          onPress={() => handleToggleAllDrugs(slot.id)}
                          className={`rounded-full px-3 py-1 ${
                            allTaken ? "bg-emerald-500" : "bg-[#F1F5F9]"
                          }`}
                        >
                          <Text
                            className={`text-[12px] font-semibold ${
                              allTaken ? "text-white" : "text-[#64748B]"
                            }`}
                          >
                            {allTaken ? "전체 복용됨" : "전체 복용"}
                          </Text>
                        </Pressable>
                      </View>
                      <View className="gap-2">
                        {slot.drugs.map((d) => (
                          <Pressable
                            key={d.id}
                            onPress={() => handleToggleDrug(slot.id, d.id)}
                            className="flex-row items-center justify-between rounded-lg bg-[#F8FAFC] px-3 py-2.5"
                          >
                            <Text className="text-[14px] text-[#0F172A]">
                              {d.name}
                            </Text>
                            <View
                              className={`h-6 w-6 items-center justify-center rounded-full border-2 ${
                                d.taken
                                  ? "bg-emerald-500 border-emerald-500"
                                  : "border-[#CBD5E1]"
                              }`}
                            >
                              {d.taken && (
                                <Text className="text-[12px] font-bold text-white">
                                  ✓
                                </Text>
                              )}
                            </View>
                          </Pressable>
                        ))}
                      </View>
                    </View>
                  );
                })}
              </View>
            )}
          </View>

          {/* 메모장 (MemoCard 대체) */}
          {memoList.length > 0 && (
            <View className="bg-white rounded-2xl border border-[#E5E7EB] p-6 mb-8">
              <Text className="text-[18px] font-bold text-[#0F172A] mb-4">
                복약 메모
              </Text>
              <View className="gap-3">
                {memoList.map((m) => (
                  <View
                    key={m.id}
                    className="rounded-xl bg-[#FFFBEB] border border-[#FDE68A] p-3"
                  >
                    <Text className="text-[13px] font-semibold text-[#92400E] mb-1">
                      {m.groupName}
                    </Text>
                    <Text className="text-[13px] text-[#78350F]">
                      {m.content}
                    </Text>
                  </View>
                ))}
              </View>
            </View>
          )}

          {/* 비정기 복용 기록 (MedicationRecordCard 대체) */}
          <View className="bg-white rounded-2xl border border-[#E5E7EB] p-6 mb-8">
            <Text className="text-[18px] font-bold text-[#0F172A] mb-4">
              복용 기록 추가
            </Text>
            <View className="gap-3">
              <TextInput
                value={drugName}
                onChangeText={setDrugName}
                placeholder="약 이름"
                placeholderTextColor="#94A3B8"
                className="rounded-[10px] border border-[#E5E7EB] bg-white px-4 py-3 text-[14px] text-[#0F172A]"
              />
              <TextInput
                value={dosage}
                onChangeText={setDosage}
                placeholder="복용량 (선택)"
                placeholderTextColor="#94A3B8"
                className="rounded-[10px] border border-[#E5E7EB] bg-white px-4 py-3 text-[14px] text-[#0F172A]"
              />
              <TextInput
                value={date}
                onChangeText={setDate}
                placeholder="YYYY-MM-DD"
                placeholderTextColor="#94A3B8"
                className="rounded-[10px] border border-[#E5E7EB] bg-white px-4 py-3 text-[14px] text-[#0F172A]"
              />
              <Pressable
                onPress={handleSaveRecord}
                className="h-[44px] items-center justify-center rounded-[12px] bg-[#0F172A]"
              >
                <Text className="text-[14px] font-semibold text-white">
                  기록 저장
                </Text>
              </Pressable>
            </View>
          </View>

          {/* 저장된 복용 기록 (SavedRecordsCard 대체) */}
          <View className="bg-white rounded-2xl border border-[#E5E7EB] p-6 mb-8">
            <Text className="text-[18px] font-bold text-[#0F172A] mb-4">
              저장된 복용 기록
            </Text>
            {savedRecords.length === 0 ? (
              <Text className="text-[14px] text-[#94A3B8] py-4 text-center">
                저장된 기록이 없습니다.
              </Text>
            ) : (
              <View className="gap-2">
                {savedRecords.map((r) => (
                  <View
                    key={r.id}
                    className="flex-row items-center justify-between rounded-lg bg-[#F8FAFC] px-3 py-3"
                  >
                    <View>
                      <Text className="text-[14px] font-semibold text-[#0F172A]">
                        {r.drugName}
                        {r.dosage ? ` · ${r.dosage}` : ""}
                      </Text>
                      <Text className="text-[12px] text-[#94A3B8] mt-0.5">
                        {r.date} {r.time}
                      </Text>
                    </View>
                    <Pressable
                      onPress={() => handleDeleteRecord(r.id)}
                      hitSlop={8}
                    >
                      <Text className="text-[13px] text-[#EF4444]">삭제</Text>
                    </Pressable>
                  </View>
                ))}
              </View>
            )}
          </View>

          {/* 처방 약 목록 (PrescriptionListCard 대체) */}
          <View className="bg-white rounded-2xl border border-[#E5E7EB] p-6 mb-4">
            <View className="flex-row items-center justify-between mb-4">
              <Text className="text-[18px] font-bold text-[#0F172A]">
                처방 약 목록
              </Text>
              <View className="flex-row items-center gap-2">
                <Pressable
                  onPress={() => setOcrOpen(true)}
                  className="rounded-full border border-[#2563EB] bg-white px-4 py-2"
                >
                  <Text className="text-[13px] font-semibold text-[#2563EB]">
                    사진으로 등록(OCR)
                  </Text>
                </Pressable>
                <Pressable
                  onPress={() => setRegisterOpen(true)}
                  className="rounded-full bg-[#0F172A] px-4 py-2"
                >
                  <Text className="text-[13px] font-semibold text-white">
                    처방전 등록
                  </Text>
                </Pressable>
              </View>
            </View>
            {prescriptionsForList.length === 0 ? (
              <Text className="text-[14px] text-[#94A3B8] py-4 text-center">
                등록된 처방이 없습니다.
              </Text>
            ) : (
              <View className="gap-3">
                {prescriptionsForList.map((g) => (
                  <Pressable
                    key={g.id}
                    onPress={() => setDetailGroup(g)}
                    className="rounded-xl border border-[#E5E7EB] p-4"
                  >
                    <View className="flex-row items-center justify-between mb-1">
                      <Text className="text-[15px] font-bold text-[#0F172A]">
                        {g.groupName}
                      </Text>
                      <Text className="text-[12px] text-[#64748B]">
                        {g.scheduleLabel}
                      </Text>
                    </View>
                    <Text className="text-[13px] text-[#64748B]">
                      복용량 {g.dosage} · {g.medicines.length}종
                    </Text>
                    {g.medicines.length > 0 && (
                      <Text className="text-[12px] text-[#94A3B8] mt-1">
                        {g.medicines.map((m) => m.name).join(", ")}
                      </Text>
                    )}
                  </Pressable>
                ))}
              </View>
            )}
          </View>
        </View>
      </ScrollView>

      {/* 처방전 등록 모달 */}
      <PrescriptionRegisterModal
        visible={registerOpen}
        onClose={() => setRegisterOpen(false)}
        onSaved={handlePrescriptionSaved}
      />

      {/* 처방전 OCR 등록 모달 */}
      <PrescriptionOcrModal
        visible={ocrOpen}
        onClose={() => setOcrOpen(false)}
        onSaved={handlePrescriptionSaved}
      />

      {/* 처방전 상세 모달 */}
      <PrescriptionDetailModal
        visible={!!detailGroup}
        group={detailGroup}
        onClose={() => setDetailGroup(null)}
        onSaved={handlePrescriptionSaved}
      />
    </SafeAreaView>
  );
}
