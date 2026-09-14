import { createContext, useContext, useState, useEffect } from "react";
import { getMe } from "../api/services";

const AuthContext = createContext(null);

function clearStoredSession() {
  localStorage.removeItem("token");
  localStorage.removeItem("user");
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(() => Boolean(localStorage.getItem("token")));

  useEffect(() => {
    const storedToken = localStorage.getItem("token");
    if (!storedToken) {
      return;
    }

    let isMounted = true;

    getMe()
      .then(({ data: authenticatedUser }) => {
        if (isMounted) {
          setUser(authenticatedUser);
        }
      })
      .catch(() => {
        clearStoredSession();
      })
      .finally(() => {
        if (isMounted) {
          setLoading(false);
        }
      });

    return () => {
      isMounted = false;
    };
  }, []);

  const login = (authToken, authenticatedUser) => {
    localStorage.setItem("token", authToken);
    localStorage.setItem("user", JSON.stringify(authenticatedUser));
    setUser(authenticatedUser);
  };

  const logout = () => {
    clearStoredSession();
    setUser(null);
  };

  const authContextValue = {
    user,
    setUser,
    login,
    logout,
    loading,
  };

  return (
    <AuthContext.Provider value={authContextValue}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
