import axios from "axios";

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL,
  headers: {
    "Content-Type": "application/json",
  },
  timeout: 10000,
});

// Interceptor para adicionar token automaticamente
api.interceptors.request.use((config) => {
  if (typeof window !== "undefined") {
    const token = localStorage.getItem("token");
    console.log("🔍 API Interceptor - Token encontrado:", !!token);
    console.log(
      "🔍 API Interceptor - Token valor:",
      token ? token.substring(0, 20) + "..." : "null"
    );

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
      console.log(
        "🔍 API Interceptor - Header Authorization adicionado:",
        `Bearer ${token.substring(0, 20)}...`
      );
    } else {
      console.log("🔍 API Interceptor - NENHUM TOKEN ENCONTRADO!");
    }

    // Adiciona o header de idioma preferido
    const language = localStorage.getItem("language") || "pt";
    config.headers["Accept-Language"] = language;

    console.log("🔍 API Interceptor - Headers finais:", config.headers);

    // Salvar logs no localStorage para debug
    const interceptorLog = `🔍 Interceptor - URL: ${
      config.url
    } | Token: ${!!token} | Headers: ${JSON.stringify(config.headers)}`;
    localStorage.setItem("debug_interceptor_log", interceptorLog);
  }
  return config;
});

// Interceptor para tratar respostas
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Token expirado ou inválido
      if (typeof window !== "undefined") {
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        localStorage.removeItem("apiKey");
        window.location.href = "/login";
      }
    }
    return Promise.reject(error);
  }
);

export default api;
