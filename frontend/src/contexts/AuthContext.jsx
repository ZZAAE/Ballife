import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  useRef,
} from "react";
import toast from "react-hot-toast";
import { ACCESS_TOKEN_KEY, USER_KEY } from "../api/api";

/** axios baseURL 과 동일하게 맞출 것 (폴링 대상: GET /api/health) */
const API_BASE =
  (typeof import.meta !== "undefined" && import.meta.env?.VITE_API_BASE_URL) ||
  "http://localhost:8080/api";

/** 서버 생존 확인 주기(ms) */
const SERVER_HEALTH_MS = 15_000;
/** 연속 이 횟수만큼 실패 시에만 로그아웃 (순간 끊김 오탐 완화) */
const HEALTH_FAIL_LOGOUT = 2; // 약 15 ~ 30초

const AuthContext = createContext(null);

/**
 * 로그인 사용자 상태. accessToken + loginUser JSON ({ id: memberId, username, role }).
 * 백엔드 role 문자열은 ROLE_USER / ROLE_ADMIN.
 */
export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null); //로그인 사요자 정보
  const [loading, setLoading] = useState(true); //복원 완료 여부

  useEffect(() => {
    // 잘못된 토큰 정리
    const badToken = localStorage.getItem(ACCESS_TOKEN_KEY);
    //undefined이거나 null이거나 문자열이 아닐경우
    if (badToken === "undefined" || badToken === "null" || !badToken?.trim()) {
      localStorage.removeItem(ACCESS_TOKEN_KEY);
    }

    let raw = localStorage.getItem(USER_KEY);
    if (!raw) {
      const legacy = localStorage.getItem("user"); //구버젼 키
      if (legacy) {
        raw = legacy;
        localStorage.setItem(USER_KEY, legacy); //새 키로 교환
        localStorage.removeItem("user"); // 구버젼 키 제거
      }
    }
    //사용자 정보 복원
    if (raw) {
      try {
        const parsedUser = JSON.parse(raw);
        const normalizedUserId = parsedUser?.userId ?? parsedUser?.id ?? null;
        const normalizedUser = normalizedUserId
          ? {
              ...parsedUser,
              id: normalizedUserId,
              userId: normalizedUserId,
            }
          : parsedUser;
        setUser(normalizedUser); //복원 완료
        localStorage.setItem(USER_KEY, JSON.stringify(normalizedUser));
      } catch (error) {
        console.error("사용자 정보 복원 실패:", error);
        localStorage.removeItem(USER_KEY);
        localStorage.removeItem(ACCESS_TOKEN_KEY);
      }
    }
    setLoading(false);
  }, []);

  /**
   * 로그인 API 응답을 받아 저장. 토큰은 accessToken 키, 프로필은 loginUser(USER_KEY).
   * id 는 항상 userId 와 동일하게 맞춤 (게시글 작성자 비교용).
   */
  const login = useCallback((payload) => {
    const accessToken = payload?.accessToken ?? payload?.token; //이중검증 역할도 함
    const userId = payload?.userId ?? payload?.id;
    const {
      accessToken: _a, // _a 제외
      token: _t,
      userId: _u,
      id: _i,
      ...profile
    } = payload || {};
    const userObj = {
      id: userId,
      userId,
      ...profile,
    };
    setUser(userObj);
    localStorage.setItem(USER_KEY, JSON.stringify(userObj)); // 새로고침시도 저장
    if (accessToken != null && String(accessToken).trim() !== "") {
      localStorage.setItem(ACCESS_TOKEN_KEY, String(accessToken)); //인터셉터가 사용
    }
  }, []);

  const logout = useCallback(() => {
    setUser(null);
    localStorage.removeItem(USER_KEY); //loginUser 키 삭제
    localStorage.removeItem(ACCESS_TOKEN_KEY); //accessToken 키 삭제
    localStorage.removeItem("user"); // 혹시 남아있을수도 있는 최초 데이터 삭제
    localStorage.removeItem("token"); // 혹시 남아있을수도 있는 최초 데이터 삭제

    // 회원 프로필 캐시도 비움 — 다른 계정 로그인 시 이전 정보가 잠깐 노출되는 것 방지
    localStorage.removeItem("ballife.memberProfileDraft");
    localStorage.removeItem("ballife.profileImage");

    // 사용자 기록 캐시 정리 — 다음 로그인 시 DB 에서 다시 불러오도록
    // (운동 기록 / 복약 기록 / 일일 복약 스케줄)
    for (let i = localStorage.length - 1; i >= 0; i -= 1) {
      const key = localStorage.key(i);
      if (!key) continue;
      if (
        key.startsWith("ballife.exerciseRecords.") ||
        key === "savedMedicineInfo" ||
        key.startsWith("savedMedicineInfo.") ||
        key === "savedMedicationRecords" ||
        key.startsWith("medicationSchedules_")
      ) {
        localStorage.removeItem(key);
      }
    }
  }, []);

  /** 로그인 중일 때만: 서버가 응답하지 않으면(다운 등) 연속 실패 후 로그아웃 */
  const logoutRef = useRef(logout);
  logoutRef.current = logout;

  // 백엔드 /api/health 엔드포인트 미구현으로 인한 강제 로그아웃 버그 회피용 임시 비활성화
  // 백엔드에 HealthController 추가 후 다시 활성화할 것
  // useEffect(() => {
  //     // 로그인 안되어 있으면 아무것도 안함
  //     if (!user) {
  //         return undefined;
  //     }
  //     //실패 회수
  //     let fails = 0;
  //
  //     //헬스 체크 함수
  //     const check = async () => {
  //         try {
  //             const res = await fetch(`${API_BASE}/health`, {
  //                 method: 'GET',
  //                 cache: 'no-store', //실제 서버에 물어봄
  //                 credentials: 'omit', //살았니? 죽었니?
  //             });
  //             if (res.ok) {
  //                 fails = 0; //살았으면 카운트 리셋
  //                 return;
  //             }
  //             fails += 1; //죽었으면 카운트 증가
  //         } catch {
  //             fails += 1; //네트워크 에러
  //         }
  //         //강제 로그아웃
  //         if (fails >= HEALTH_FAIL_LOGOUT) {
  //             logoutRef.current();
  //             toast.error('서버에 연결할 수 없어 로그아웃되었습니다.');
  //         }
  //     };
  //     const id = setInterval(check, SERVER_HEALTH_MS); //주기적 실행
  //     check(); //최초 즉시 1회 실행
  //     return () => clearInterval(id); //로그아웃시 인터벌 정리
  // }, [user]);

  const isAuthenticated = !!user;

  const isAdmin = user?.role === "ROLE_ADMIN" || user?.role === "ADMIN";

  const value = {
    user,
    loading,
    isAuthenticated,
    isAdmin,
    login,
    logout,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};

export default AuthContext;
