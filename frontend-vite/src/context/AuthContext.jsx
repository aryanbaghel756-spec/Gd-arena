import React, { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext(null);

const DEMO_USER = {
  id: "demo-aryan-01",
  name: "Aryan Sharma",
  email: "aryan.sharma@arena.edu",
  college: "Indian Institute of Technology",
  initials: "AS",
  avatarColor: "#22D3EE"
};

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    try {
      const stored = localStorage.getItem("gd_arena_user");
      return stored ? JSON.parse(stored) : null;
    } catch {
      return null;
    }
  });

  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [authModalTab, setAuthModalTab] = useState("signin"); // "signin" | "signup"

  useEffect(() => {
    if (user) {
      localStorage.setItem("gd_arena_user", JSON.stringify(user));
    } else {
      localStorage.removeItem("gd_arena_user");
    }
  }, [user]);

  function login(email, password) {
    const newUser = {
      id: `user-${Date.now()}`,
      name: email.split("@")[0].replace(/[._]/g, " ").replace(/\b\w/g, c => c.toUpperCase()),
      email,
      initials: email.slice(0, 2).toUpperCase(),
      avatarColor: "#22D3EE"
    };
    setUser(newUser);
    setAuthModalOpen(false);
    return true;
  }

  function signup(name, email, password) {
    const initials = name.split(" ").map(n => n[0]).join("").toUpperCase().slice(0, 2) || "U";
    const newUser = {
      id: `user-${Date.now()}`,
      name,
      email,
      initials,
      avatarColor: "#8B5CF6"
    };
    setUser(newUser);
    setAuthModalOpen(false);
    return true;
  }

  function demoLogin() {
    setUser(DEMO_USER);
    setAuthModalOpen(false);
    return true;
  }

  function logout() {
    setUser(null);
  }

  function openAuthModal(tab = "signin") {
    setAuthModalTab(tab);
    setAuthModalOpen(true);
  }

  function closeAuthModal() {
    setAuthModalOpen(false);
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        login,
        signup,
        demoLogin,
        logout,
        authModalOpen,
        authModalTab,
        setAuthModalTab,
        openAuthModal,
        closeAuthModal
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used inside AuthProvider");
  return ctx;
}
