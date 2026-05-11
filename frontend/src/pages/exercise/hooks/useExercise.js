import { useState, useCallback } from "react";

// 무산소 운동 더미 데이터
const DUMMY_ANAEROBIC_CARDS = [
  {
    id: 1,
    name: "벤치 프레스",
    iconType: "dumbbell",
    sets: "5 Sets",
    reps: "10 회",
    intensity: "중간",
    calories: "250 kcal",
  },
  {
    id: 2,
    name: "스쿼트",
    iconType: "barbell",
    sets: "5 Sets",
    reps: "12 회",
    intensity: "중간",
    calories: "300 kcal",
  },
  {
    id: 3,
    name: "스쿼트",
    iconType: "barbell",
    sets: "5 Sets",
    reps: "12 회",
    intensity: "중간",
    calories: "300 kcal",
  },
  {
    id: 4,
    name: "스쿼트",
    iconType: "barbell",
    sets: "5 Sets",
    reps: "12 회",
    intensity: "중간",
    calories: "300 kcal",
  },
  {
    id: 5,
    name: "스쿼트",
    iconType: "barbell",
    sets: "5 Sets",
    reps: "12 회",
    intensity: "중간",
    calories: "300 kcal",
  },
];

// 유산소 운동 더미 데이터
const DUMMY_AEROBIC_CARDS = [
  {
    id: 1,
    name: "사이클링",
    iconType: "cycling",
    duration: "25분",
    intensity: "중간",
    calories: "200 kcal",
  },
  {
    id: 2,
    name: "사이클링",
    iconType: "cycling",
    duration: "25분",
    intensity: "중간",
    calories: "200 kcal",
  },
  {
    id: 3,
    name: "사이클링",
    iconType: "cycling",
    duration: "25분",
    intensity: "중간",
    calories: "200 kcal",
  },
  {
    id: 4,
    name: "사이클링",
    iconType: "cycling",
    duration: "25분",
    intensity: "중간",
    calories: "200 kcal",
  },
  {
    id: 5,
    name: "사이클링",
    iconType: "cycling",
    duration: "25분",
    intensity: "중간",
    calories: "200 kcal",
  },
];

// 운동 기록 테이블 더미 데이터
const DUMMY_ANAEROBIC_LOGS = [
  {
    id: 1,
    date: "오늘 12:30",
    sets: 3,
    reps: 3,
    intensity: "보통",
    calories: "300 kcal",
  },
  {
    id: 2,
    date: "오늘 12:30",
    sets: 3,
    reps: 3,
    intensity: "보통",
    calories: "300 kcal",
  },
  {
    id: 3,
    date: "오늘 12:30",
    sets: 3,
    reps: 3,
    intensity: "보통",
    calories: "300 kcal",
  },
  {
    id: 4,
    date: "오늘 12:30",
    sets: 3,
    reps: 3,
    intensity: "보통",
    calories: "300 kcal",
  },
];

const DUMMY_AEROBIC_LOGS = [
  {
    id: 1,
    date: "오늘 14:00",
    duration: "30분",
    intensity: "보통",
    calories: "180 kcal",
  },
  {
    id: 2,
    date: "어제 09:00",
    duration: "45분",
    intensity: "강함",
    calories: "250 kcal",
  },
  {
    id: 3,
    date: "어제 09:00",
    duration: "20분",
    intensity: "약함",
    calories: "320 kcal",
  },
];

export function useExercise() {
  const today = new Date();
  const yyyy = today.getFullYear();
  const mm = String(today.getMonth() + 1).padStart(2, "0");
  const dd = String(today.getDate()).padStart(2, "0");
  const todayStr = `${yyyy}-${mm}-${dd}`;

  const [activeTab, setActiveTab] = useState("anaerobic");
  const [startDate, setStartDate] = useState(todayStr);
  const [endDate, setEndDate] = useState(todayStr);
  const [currentPage, setCurrentPage] = useState(1);
  const totalPages = 5;

  const handleTabChange = useCallback((tab) => setActiveTab(tab), []);

  const handleStartDateChange = useCallback((value) => setStartDate(value), []);
  const handleEndDateChange = useCallback((value) => setEndDate(value), []);

  const handleApplyDateRange = useCallback(() => {
    // TODO: API 연동
    console.log("날짜 범위 적용:", startDate, "~", endDate);
  }, [startDate, endDate]);

  const handlePageChange = useCallback((page) => setCurrentPage(page), []);

  const handleRegister = useCallback(() => {
    // TODO: 운동 기록 등록 페이지 이동
    console.log("운동 기록 등록");
  }, []);

  const logs =
    activeTab === "anaerobic" ? DUMMY_ANAEROBIC_LOGS : DUMMY_AEROBIC_LOGS;

  return {
    activeTab,
    startDate,
    endDate,
    currentPage,
    totalPages,
    anaerobicCards: DUMMY_ANAEROBIC_CARDS,
    aerobicCards: DUMMY_AEROBIC_CARDS,
    logs,
    handleTabChange,
    handleStartDateChange,
    handleEndDateChange,
    handleApplyDateRange,
    handlePageChange,
    handleRegister,
  };
}
