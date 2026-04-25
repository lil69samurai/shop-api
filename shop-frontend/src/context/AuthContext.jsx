import { createContext, useEffect, useState } from "react";
import { loginApi, registerApi, getMeApi } from "../api/authApi";

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [token, setToken] = useState(localStorage.getItem("token") || null);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchUser = async () => {
    try {
      const data = await getMeApi();
      setUser(data.data);
    } catch (error) {
      console.log("fetchUser failed:", error);
      localStorage.removeItem("token");
      setToken(null);
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (token) {
      fetchUser();
    } else {
      setLoading(false);
    }
  }, [token]);

  const login = async (formData) => {
    console.log("login() called with:", formData);

    const data = await loginApi(formData);
    console.log("loginApi response:", data);

    const newToken = data.data.token;
    console.log("token =", newToken);

    localStorage.setItem("token", newToken);
    setToken(newToken);

    return data;
  };

  const register = async (formData) => {
    const data = await registerApi(formData);
    const newToken = data.data.token;
    localStorage.setItem("token", newToken);
    setToken(newToken);
    return data;
  };

  const logout = () => {
    localStorage.removeItem("token");
    setToken(null);
    setUser(null);
  };

  return (
    <AuthContext.Provider
      value={{
        token,
        user,
        loading,
        login,
        register,
        logout,
        isAuthenticated: !!token,
        isAdmin: user?.role === "ROLE_ADMIN",
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};