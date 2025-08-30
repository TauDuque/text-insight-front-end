import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "@/contexts/AuthContext";
import { ToastProvider } from "@/contexts/ToastContext";
import { LanguageProvider } from "@/contexts/LanguageContext";
import LanguageSelector from "@/components/LanguageSelector";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "DocumentInsight API",
  description: "Análise inteligente de texto com IA",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="pt">
      <body className={inter.className}>
        <LanguageProvider>
          <AuthProvider>
            <ToastProvider>
              <div className="min-h-screen bg-gray-50">
                {/* Header com seletor de idioma */}
                <header className="bg-white shadow-sm border-b border-gray-200">
                  <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between items-center h-16">
                      <div className="flex items-center">
                        <h1 className="text-xl font-semibold text-gray-900">
                          DocumentInsight API
                        </h1>
                      </div>
                      <LanguageSelector />
                    </div>
                  </div>
                </header>

                <main>{children}</main>
              </div>
            </ToastProvider>
          </AuthProvider>
        </LanguageProvider>
      </body>
    </html>
  );
}
