"use client";

import { useAuth } from "@/contexts/AuthContext";
import { useAuthGuard } from "@/hooks/useAuthGuard";
import { useLanguage } from "@/contexts/LanguageContext";
import DocumentProcessor from "@/components/DocumentProcessor";
import Layout from "@/components/Layout";
import Loading from "@/components/Loading";

export default function DashboardPage() {
  const { user } = useAuth();
  const { isAuthenticated, loading } = useAuthGuard();
  const { t } = useLanguage();

  if (loading) return <Loading />;
  if (!isAuthenticated) return null;

  return (
    <Layout>
      <div className="py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900">
              {t("dashboard.welcome")}, {user?.name}!
            </h1>
            <p className="mt-2 text-gray-600">{t("app.subtitle")}</p>
          </div>

          {/* Main Document Processing Section */}
          <DocumentProcessor />
        </div>
      </div>
    </Layout>
  );
}
