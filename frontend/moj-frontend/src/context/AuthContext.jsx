import { createContext, useContext, useState } from "react";

const AuthContext = createContext(null);

export const useAuth = () => useContext(AuthContext);

const normalizeUser = (u) => {
  if (!u) return null;
  return { ...u, id: u.id || u.idUser };
};

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    try {
      const stored = JSON.parse(localStorage.getItem("poolpro_user"));
      return normalizeUser(stored);
    } catch {
      return null;
    }
  });
  const [previewRole, setPreviewRoleState] = useState(null);

  const effectiveUser =
    user && user.role === "SUPERVISOR" && previewRole
      ? { ...user, role: previewRole, actualRole: "SUPERVISOR" }
      : user;

  const login = (u) => {
    const normalized = normalizeUser(u);
    setUser(normalized);
    setPreviewRoleState(null);
    localStorage.setItem("poolpro_user", JSON.stringify(normalized));
  };

  const logout = () => {
    setUser(null);
    setPreviewRoleState(null);
    localStorage.removeItem("poolpro_user");
  };

  const setPreviewRole = (role) => {
    if (user?.role !== "SUPERVISOR") return;
    setPreviewRoleState(role === "SUPERVISOR" ? null : role);
  };

  return (
    <AuthContext.Provider
      value={{
        user: effectiveUser,
        realUser: user,
        actualRole: user?.role || null,
        effectiveRole: effectiveUser?.role || null,
        previewRole,
        setPreviewRole,
        login,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}
