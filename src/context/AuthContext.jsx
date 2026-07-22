import { createContext, useContext, useState, useCallback, useEffect } from "react";
import { AuthAPI } from "../api/services";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem("jhanvika_token");
    if (!token) {
      setLoading(false);
      return;
    }
    AuthAPI.me()
      .then((res) => setUser(res.data))
      .catch(() => {
        localStorage.removeItem("jhanvika_token");
      })
      .finally(() => setLoading(false));
  }, []);

  const login = useCallback(async (email, password) => {
    const res = await AuthAPI.login({ email, password });
    localStorage.setItem("jhanvika_token", res.data.token);
    setUser(res.data.user);
    return res.data.user;
  }, []);

  const register = useCallback(async (name, email, password, phone) => {
    const res = await AuthAPI.register({ name, email, password, phone });
    localStorage.setItem("jhanvika_token", res.data.token);
    setUser(res.data.user);
    return res.data.user;
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem("jhanvika_token");
    setUser(null);
  }, []);

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout, isAuthenticated: !!user }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
