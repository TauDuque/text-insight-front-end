"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import { useLanguage } from "@/contexts/LanguageContext";
import Link from "next/link";
import { Eye, EyeOff, Check, X } from "lucide-react";

export default function RegisterPage() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [passwordValidation, setPasswordValidation] = useState({
    length: false,
    lowercase: false,
    uppercase: false,
    number: false,
  });

  const { register } = useAuth();
  const { t } = useLanguage();
  const router = useRouter();

  // Validação em tempo real da senha
  useEffect(() => {
    setPasswordValidation({
      length: password.length >= 6,
      lowercase: /[a-z]/.test(password),
      uppercase: /[A-Z]/.test(password),
      number: /\d/.test(password),
    });
  }, [password]);

  const isPasswordValid = Object.values(passwordValidation).every(Boolean);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    // Validação adicional no frontend
    if (!isPasswordValid) {
      setError("Por favor, verifique os requisitos da senha abaixo.");
      setLoading(false);
      return;
    }

    try {
      await register({ name, email, password });
      router.push("/dashboard");
    } catch (err) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError("Ocorreu um erro desconhecido.");
      }
    } finally {
      setLoading(false);
    }
  };

  const getValidationIcon = (isValid: boolean) => {
    return isValid ? (
      <Check className="h-4 w-4 text-green-500" />
    ) : (
      <X className="h-4 w-4 text-red-500" />
    );
  };

  const getValidationTextColor = (isValid: boolean) => {
    return isValid ? "text-green-600" : "text-red-600";
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            {t("app.title")}
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            {t("register.title")}
          </p>
        </div>
        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          <div className="space-y-4">
            <div>
              <label
                htmlFor="name"
                className="block text-sm font-medium text-gray-700"
              >
                {t("form.name")}
              </label>
              <input
                id="name"
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 focus:border-indigo-500 text-gray-900 bg-white"
                placeholder={t("register.namePlaceholder")}
              />
            </div>
            <div>
              <label
                htmlFor="email"
                className="block text-sm font-medium text-gray-700"
              >
                {t("form.email")}
              </label>
              <input
                id="email"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 focus:border-indigo-500 text-gray-900 bg-white"
                placeholder={t("register.emailPlaceholder")}
              />
            </div>
            <div>
              <label
                htmlFor="password"
                className="block text-sm font-medium text-gray-700"
              >
                {t("form.password")}
              </label>
              <div className="mt-1 relative">
                <input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className={`block w-full px-3 py-2 pr-10 border rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-offset-2 text-gray-900 bg-white ${
                    password.length > 0
                      ? isPasswordValid
                        ? "border-green-300 focus:ring-green-500 focus:border-green-500"
                        : "border-red-300 focus:ring-red-500 focus:border-red-500"
                      : "border-gray-300 focus:ring-indigo-500 focus:border-indigo-500"
                  }`}
                  placeholder={t("register.passwordPlaceholder")}
                />
                <button
                  type="button"
                  className="absolute inset-y-0 right-0 pr-3 flex items-center"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? (
                    <EyeOff className="h-5 w-5 text-gray-400" />
                  ) : (
                    <Eye className="h-5 w-5 text-gray-400" />
                  )}
                </button>
              </div>

              {/* Validação da senha em tempo real */}
              {password.length > 0 && (
                <div className="mt-2 space-y-2">
                  <p className="text-sm font-medium text-gray-700">
                    {t("password.requirements")}
                  </p>
                  <div className="space-y-1">
                    <div className="flex items-center space-x-2">
                      {getValidationIcon(passwordValidation.length)}
                      <span
                        className={`text-sm ${getValidationTextColor(
                          passwordValidation.length
                        )}`}
                      >
                        {t("password.minLength")}
                      </span>
                    </div>
                    <div className="flex items-center space-x-2">
                      {getValidationIcon(passwordValidation.lowercase)}
                      <span
                        className={`text-sm ${getValidationTextColor(
                          passwordValidation.lowercase
                        )}`}
                      >
                        {t("password.lowercase")}
                      </span>
                    </div>
                    <div className="flex items-center space-x-2">
                      {getValidationIcon(passwordValidation.uppercase)}
                      <span
                        className={`text-sm ${getValidationTextColor(
                          passwordValidation.uppercase
                        )}`}
                      >
                        {t("password.uppercase")}
                      </span>
                    </div>
                    <div className="flex items-center space-x-2">
                      {getValidationIcon(passwordValidation.number)}
                      <span
                        className={`text-sm ${getValidationTextColor(
                          passwordValidation.number
                        )}`}
                      >
                        {t("password.number")}
                      </span>
                    </div>
                  </div>

                  {/* Exemplo de senha válida */}
                  <div className="mt-3 p-2 bg-blue-50 border border-blue-200 rounded-md">
                    <p className="text-xs text-blue-700">
                      <strong>{t("password.example")}</strong> Teste123
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-md text-sm">
              {error}
            </div>
          )}

          <div>
            <button
              type="submit"
              disabled={loading || !isPasswordValid}
              className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? t("register.submitting") : t("register.submit")}
            </button>
          </div>

          <div className="text-center">
            <Link
              href="/login"
              className="text-indigo-600 hover:text-indigo-500"
            >
              {t("register.loginLink")}
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
}
