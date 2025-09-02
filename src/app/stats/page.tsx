"use client";

import { useAuth } from "@/contexts/AuthContext";
import { useAuthGuard } from "@/hooks/useAuthGuard";
import { useLanguage } from "@/contexts/LanguageContext";
import Layout from "@/components/Layout";
import Loading from "@/components/Loading";
import {
  BarChart3,
  TrendingUp,
  Clock,
  CheckCircle,
  XCircle,
  FileText,
} from "lucide-react";
import { useState, useEffect } from "react";
import { Document } from "@/types/document";
import { documentService } from "@/services/documentService";

interface StatsData {
  totalDocuments: number;
  completedDocuments: number;
  failedDocuments: number;
  pendingDocuments: number;
  processingDocuments: number;
  averageProcessingTime: number;
  successRate: number;
  documentsPerDay: number;
}

export default function StatsPage() {
  const { user } = useAuth();
  const { isAuthenticated, loading } = useAuthGuard();
  const { t } = useLanguage();
  const [stats, setStats] = useState<StatsData | null>(null);
  const [loadingStats, setLoadingStats] = useState(true);
  const [selectedPeriod, setSelectedPeriod] = useState("7d");

  useEffect(() => {
    const loadStats = async () => {
      try {
        setLoadingStats(true);
        // TODO: Implementar endpoint de estatísticas no backend
        // Por enquanto, vamos buscar documentos e calcular estatísticas básicas
        const response = await documentService.getUserDocuments();
        const documents = response?.documents || [];

        const stats: StatsData = {
          totalDocuments: documents.length,
          completedDocuments: documents.filter(
            (d: Document) => d.status === "COMPLETED"
          ).length,
          failedDocuments: documents.filter(
            (d: Document) => d.status === "FAILED"
          ).length,
          pendingDocuments: documents.filter(
            (d: Document) => d.status === "PENDING"
          ).length,
          processingDocuments: documents.filter(
            (d: Document) => d.status === "PROCESSING"
          ).length,
          averageProcessingTime: 0, // TODO: Calcular baseado nos documentos processados
          successRate:
            documents.length > 0
              ? Math.round(
                  (documents.filter((d: Document) => d.status === "COMPLETED")
                    .length /
                    documents.length) *
                    100
                )
              : 0,
          documentsPerDay: 0, // TODO: Calcular baseado na data de criação
        };

        setStats(stats);
      } catch (error) {
        console.error("Erro ao carregar estatísticas:", error);
        // Em caso de erro, mostrar estatísticas vazias
        setStats({
          totalDocuments: 0,
          completedDocuments: 0,
          failedDocuments: 0,
          pendingDocuments: 0,
          processingDocuments: 0,
          averageProcessingTime: 0,
          successRate: 0,
          documentsPerDay: 0,
        });
      } finally {
        setLoadingStats(false);
      }
    };

    loadStats();
  }, [selectedPeriod]);

  if (loading) return <Loading />;
  if (!isAuthenticated) return null;

  return (
    <Layout>
      <div className="py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900">
              {t("stats.title")}
            </h1>
            <p className="mt-2 text-gray-600">{t("stats.subtitle")}</p>
          </div>

          {/* Period Selector */}
          <div className="mb-6">
            <label
              htmlFor="period"
              className="block text-sm font-medium text-gray-700 mb-2"
            >
              {t("stats.period")}
            </label>
            <select
              id="period"
              value={selectedPeriod}
              onChange={(e) => setSelectedPeriod(e.target.value)}
              className="block w-48 px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 text-gray-900"
            >
              <option value="7d">{t("stats.last7Days")}</option>
              <option value="30d">{t("stats.last30Days")}</option>
              <option value="90d">{t("stats.last90Days")}</option>
              <option value="1y">{t("stats.lastYear")}</option>
            </select>
          </div>

          {/* Stats Content */}
          <div className="bg-white shadow rounded-lg">
            {loadingStats ? (
              <div className="p-8 text-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
                <p className="mt-4 text-gray-600">{t("global.loading")}</p>
              </div>
            ) : stats ? (
              <div className="p-6">
                {/* Overview Cards */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                  <div className="bg-blue-50 rounded-lg p-6">
                    <div className="flex items-center">
                      <FileText className="h-8 w-8 text-blue-600" />
                      <div className="ml-4">
                        <p className="text-sm font-medium text-blue-600">
                          {t("stats.totalDocuments")}
                        </p>
                        <p className="text-2xl font-bold text-blue-900">
                          {stats.totalDocuments}
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="bg-green-50 rounded-lg p-6">
                    <div className="flex items-center">
                      <CheckCircle className="h-8 w-8 text-green-600" />
                      <div className="ml-4">
                        <p className="text-sm font-medium text-green-600">
                          {t("stats.completedDocuments")}
                        </p>
                        <p className="text-2xl font-bold text-green-900">
                          {stats.completedDocuments}
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="bg-yellow-50 rounded-lg p-6">
                    <div className="flex items-center">
                      <Clock className="h-8 w-8 text-yellow-600" />
                      <div className="ml-4">
                        <p className="text-sm font-medium text-yellow-600">
                          {t("stats.pendingDocuments")}
                        </p>
                        <p className="text-2xl font-bold text-yellow-900">
                          {stats.pendingDocuments}
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="bg-red-50 rounded-lg p-6">
                    <div className="flex items-center">
                      <XCircle className="h-8 w-8 text-red-600" />
                      <div className="ml-4">
                        <p className="text-sm font-medium text-red-600">
                          {t("stats.failedDocuments")}
                        </p>
                        <p className="text-2xl font-bold text-red-900">
                          {stats.failedDocuments}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Performance Metrics */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                  <div className="bg-gray-50 rounded-lg p-6">
                    <h3 className="text-lg font-medium text-gray-900 mb-4">
                      {t("stats.performanceMetrics")}
                    </h3>
                    <div className="space-y-4">
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-600">
                          {t("stats.successRate")}
                        </span>
                        <span className="text-lg font-semibold text-gray-900">
                          {stats.successRate}%
                        </span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-600">
                          {t("stats.averageProcessingTime")}
                        </span>
                        <span className="text-lg font-semibold text-gray-900">
                          {stats.averageProcessingTime}s
                        </span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-600">
                          {t("stats.documentsPerDay")}
                        </span>
                        <span className="text-lg font-semibold text-gray-900">
                          {stats.documentsPerDay}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="bg-gray-50 rounded-lg p-6">
                    <h3 className="text-lg font-medium text-gray-900 mb-4">
                      {t("stats.queueStatus")}
                    </h3>
                    <div className="space-y-4">
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-600">
                          {t("stats.inQueue")}
                        </span>
                        <span className="text-lg font-semibold text-gray-900">
                          {stats.pendingDocuments}
                        </span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-600">
                          {t("stats.inProcessing")}
                        </span>
                        <span className="text-lg font-semibold text-gray-900">
                          {stats.processingDocuments}
                        </span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-600">
                          {t("stats.totalInQueue")}
                        </span>
                        <span className="text-lg font-semibold text-gray-900">
                          {stats.pendingDocuments + stats.processingDocuments}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Recommendations */}
                <div className="mt-8 bg-indigo-50 rounded-lg p-6">
                  <h3 className="text-lg font-medium text-indigo-900 mb-4">
                    {t("stats.recommendations")}
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="text-sm text-indigo-800">
                      <p className="font-medium mb-2">
                        💡 {t("stats.recommendation1")}
                      </p>
                    </div>
                    <div className="text-sm text-indigo-800">
                      <p className="font-medium mb-2">
                        📊 {t("stats.recommendation2")}
                      </p>
                    </div>
                    <div className="text-sm text-indigo-800">
                      <p className="font-medium mb-2">
                        🔍 {t("stats.recommendation3")}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Usage Tips */}
                <div className="mt-6 bg-green-50 rounded-lg p-6">
                  <h3 className="text-lg font-medium text-green-900 mb-4">
                    {t("stats.usageTips")}
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="text-sm text-green-800">
                      <p className="font-medium mb-2">⚡ {t("stats.tip1")}</p>
                    </div>
                    <div className="text-sm text-green-800">
                      <p className="font-medium mb-2">🔄 {t("stats.tip2")}</p>
                    </div>
                    <div className="text-sm text-green-800">
                      <p className="font-medium mb-2">✅ {t("stats.tip3")}</p>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="p-8 text-center">
                <BarChart3 className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  {t("stats.loadError")}
                </h3>
                <p className="text-gray-600">{t("global.tryAgain")}</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </Layout>
  );
}
