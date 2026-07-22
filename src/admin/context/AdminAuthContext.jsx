import { createContext, useContext, useState, useCallback } from "react";
import { AdminAuthAPI } from "../../api/services";

const AdminAuthContext = createContext(null);

export function AdminAuthProvider({ children }) {
  const [admin, setAdmin] = useState(() => {
    const raw = localStorage.getItem("jhanvika_admin_user");
    return raw ? JSON.parse(raw) : null;
  });

  const login = useCallback(async (email, password) => {
    const res = await AdminAuthAPI.login({ email, password });
    localStorage.setItem("jhanvika_admin_token", res.data.token);
    localStorage.setItem("jhanvika_admin_user", JSON.stringify(res.data.admin));
    setAdmin(res.data.admin);
    return res.data.admin;
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem("jhanvika_admin_token");
    localStorage.removeItem("jhanvika_admin_user");
    setAdmin(null);
  }, []);

  return (
    <AdminAuthContext.Provider value={{ admin, login, logout, isAuthenticated: !!admin }}>
      {children}
    </AdminAuthContext.Provider>
  );
}

export function useAdminAuth() {
  const ctx = useContext(AdminAuthContext);
  if (!ctx) throw new Error("useAdminAuth must be used within AdminAuthProvider");
  return ctx;
}
