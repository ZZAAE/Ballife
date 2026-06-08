import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
} from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { hydrateToken, setToken, clearToken } from "../lib/tokenStore";
import { setUnauthorizedHandler } from "../api/api";

const USER_KEY = "loginUser";
const AuthContext = createContext(null);

/**
 * 로그인 사용자 상태.
 * - 토큰: SecureStore(tokenStore)
 * - 프로필(loginUser): AsyncStorage  ({ id: userId, username, role, ... })
 * 백엔드 role 문자열은 ROLE_USER / ROLE_ADMIN.
 */
export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const logout = useCallback(async () => {
    setUser(null);
    await clearToken();
    try {
      await AsyncStorage.multiRemove([USER_KEY, "user", "token"]);
    } catch {
      /* 무시 */
    }
  }, []);

  // 401 발생 시 사용자 상태도 비우도록 인터셉터에 연결
  useEffect(() => {
    setUnauthorizedHandler(() => {
      setUser(null);
      AsyncStorage.multiRemove([USER_KEY, "user", "token"]).catch(() => {});
    });
    return () => setUnauthorizedHandler(null);
  }, []);

  // 앱 시작 시 토큰/프로필 복원
  useEffect(() => {
    (async () => {
      await hydrateToken();
      try {
        const raw = await AsyncStorage.getItem(USER_KEY);
        if (raw) {
          const parsed = JSON.parse(raw);
          const id = parsed?.userId ?? parsed?.id ?? null;
          const normalized = id ? { ...parsed, id, userId: id } : parsed;
          setUser(normalized);
        }
      } catch {
        await AsyncStorage.removeItem(USER_KEY).catch(() => {});
      }
      setLoading(false);
    })();
  }, []);

  /** 로그인 API 응답 저장. 토큰은 SecureStore, 프로필은 AsyncStorage. */
  const login = useCallback(async (payload) => {
    const accessToken = payload?.accessToken ?? payload?.token;
    const userId = payload?.userId ?? payload?.id;
    const {
      accessToken: _a,
      token: _t,
      userId: _u,
      id: _i,
      ...profile
    } = payload || {};
    const userObj = { id: userId, userId, ...profile };

    setUser(userObj);
    try {
      await AsyncStorage.setItem(USER_KEY, JSON.stringify(userObj));
    } catch {
      /* 무시 */
    }
    if (accessToken != null && String(accessToken).trim() !== "") {
      await setToken(String(accessToken));
    }
  }, []);

  const isAuthenticated = !!user;
  const isAdmin = user?.role === "ROLE_ADMIN" || user?.role === "ADMIN";

  const value = { user, loading, isAuthenticated, isAdmin, login, logout };
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
