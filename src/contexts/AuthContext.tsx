"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import api from "@/lib/api";
import { User, LoginData, RegisterData } from "@/types/auth";

interface AuthContextData {
  user: User | null;
  token: string | null;
  apiKey: string | null;
  login: (data: LoginData) => Promise<void>;
  register: (data: RegisterData) => Promise<void>;
  logout: () => void;
  loading: boolean;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextData>({} as AuthContextData);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [apiKey, setApiKey] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const initializeAuth = () => {
      try {
        const storedToken = localStorage.getItem("token");
        const storedUser = localStorage.getItem("user");
        const storedApiKey = localStorage.getItem("apiKey");

        if (storedToken && storedUser) {
          setToken(storedToken);
          setUser(JSON.parse(storedUser));
          if (storedApiKey) {
            setApiKey(storedApiKey);
          }
        }
      } catch (error) {
        console.error("Erro ao carregar dados de autenticação:", error);
        logout();
      } finally {
        setLoading(false);
      }
    };

    initializeAuth();
  }, []);

  const login = async (data: LoginData) => {
    try {
      const response = await api.post("/auth/login", data);
      const { user, token } = response.data.data;

      setUser(user);
      setToken(token);

      localStorage.setItem("token", token);
      localStorage.setItem("user", JSON.stringify(user));
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error ? error.message : "Erro ao fazer login";
      if (typeof error === "object" && error !== null && "response" in error) {
        const response = (
          error as { response?: { data?: { message?: string } } }
        ).response;
        throw new Error(response?.data?.message || errorMessage);
      } else {
        throw new Error(errorMessage);
      }
    }
  };

  const register = async (data: RegisterData) => {
    try {
      const response = await api.post("/auth/register", data);
      const { user, apiKey } = response.data.data;

      setUser(user);
      setApiKey(apiKey);

      localStorage.setItem("user", JSON.stringify(user));
      localStorage.setItem("apiKey", apiKey);
    } catch (error: unknown) {
      let errorMessage = "Erro ao criar conta";

      if (typeof error === "object" && error !== null && "response" in error) {
        const response = (
          error as {
            response?: { data?: { message?: string; errors?: unknown[] } };
          }
        ).response;

        if (response?.data?.errors && Array.isArray(response.data.errors)) {
          // Se há erros de validação específicos, use o primeiro
          errorMessage =
            (response.data.errors[0] as { message?: string })?.message ||
            response.data.message ||
            errorMessage;
        } else {
          errorMessage = response?.data?.message || errorMessage;
        }
      } else if (error instanceof Error) {
        errorMessage = error.message;
      }

      throw new Error(errorMessage);
    }
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    setApiKey(null);
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    localStorage.removeItem("apiKey");
  };

  const isAuthenticated = !!user && (!!token || !!apiKey);

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        apiKey,
        login,
        register,
        logout,
        loading,
        isAuthenticated,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth deve ser usado dentro de um AuthProvider");
  }
  return context;
};
