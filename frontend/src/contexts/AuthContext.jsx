import { createContext, useContext, useState } from "react";

// Context 객체 생성
const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
    // 시작 시 localStorage에서 사용자 정보 복원
    const [user, setUser] = useState(() => {
        const savedUser = localStorage.getItem("user");

        if (!savedUser) return null;

        try {
            return JSON.parse(savedUser);
        } catch (error) {
            console.error("사용자 정보 복원 실패:", error);
            localStorage.removeItem("user");
            localStorage.removeItem("token");
            return null;
        }
    });

    const [loading] = useState(false);

    // 로그인 성공 시 호출
    const login = (userData) => {
        setUser(userData);
        localStorage.setItem("user", JSON.stringify(userData));
        localStorage.setItem("token", userData.token);
    };

    // 로그아웃
    const logout = () => {
        setUser(null);
        localStorage.removeItem("user");
        localStorage.removeItem("token");
    };

    const isAuthenticated = !!user;
    const isAdmin = user?.role === "ADMIN";

<<<<<<< HEAD
    const value = {
        user,
        loading,
        isAuthenticated,
        isAdmin,
        login,
        logout,
    };
=======
  const value = {
    user,
    loading,
    isAuthenticated,
    isAdmin,
    login,
    logout,
  };
>>>>>>> origin/sjs/0507

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    );
};

// Custom Hook
export function useAuth() {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error("useAuth must be used within an AuthProvider");
    }
    return context;
}

export default AuthContext;
