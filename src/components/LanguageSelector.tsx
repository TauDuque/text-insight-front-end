"use client";

import { Language, useLanguage } from "@/contexts/LanguageContext";
import { Globe, ChevronDown } from "lucide-react";
import { useState, useRef, useEffect } from "react";

export default function LanguageSelector() {
  const { language, setLanguage, t, supportedLanguages } = useLanguage();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Fecha o dropdown quando clica fora
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const getLanguageFlag = (lang: string) => {
    switch (lang) {
      case "pt":
        return "🇧🇷";
      case "es":
        return "🇪🇸";
      case "en":
        return "🇺🇸";
      default:
        return "🌍";
    }
  };

  const getLanguageName = (lang: string) => {
    switch (lang) {
      case "pt":
        return t("language.pt");
      case "es":
        return t("language.es");
      case "en":
        return t("language.en");
      default:
        return lang;
    }
  };

  const handleLanguageChange = (newLanguage: string) => {
    setLanguage(newLanguage as Language);
    setIsOpen(false);
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center space-x-2 px-3 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors"
        aria-label={t("language.select")}
      >
        <Globe className="h-4 w-4 text-gray-500" />
        <span className="hidden sm:inline">{getLanguageFlag(language)}</span>
        <span className="hidden md:inline">{getLanguageName(language)}</span>
        <ChevronDown
          className={`h-4 w-4 text-gray-400 transition-transform ${
            isOpen ? "rotate-180" : ""
          }`}
        />
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-48 bg-white border border-gray-200 rounded-md shadow-lg z-50">
          <div className="py-1">
            {supportedLanguages.map((lang) => (
              <button
                key={lang}
                onClick={() => handleLanguageChange(lang)}
                className={`w-full text-left px-4 py-2 text-sm hover:bg-gray-100 transition-colors ${
                  language === lang
                    ? "bg-indigo-50 text-indigo-700"
                    : "text-gray-700"
                }`}
              >
                <div className="flex items-center space-x-3">
                  <span className="text-lg">{getLanguageFlag(lang)}</span>
                  <span>{getLanguageName(lang)}</span>
                  {language === lang && (
                    <div className="ml-auto w-2 h-2 bg-indigo-600 rounded-full"></div>
                  )}
                </div>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
