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

  const login = (u) => {
    const normalized = normalizeUser(u);
    setUser(normalized);
    localStorage.setItem("poolpro_user", JSON.stringify(normalized));
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem("poolpro_user");
  };

  return (
    <AuthContext.Provider value={{ user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}
