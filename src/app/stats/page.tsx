"use client";

import { useState, useEffect, useCallback } from "react";
import { useLanguage } from "@/contexts/LanguageContext";
import { useAuthGuard } from "@/hooks/useAuthGuard";
import Layout from "@/components/Layout";
import Loading from "@/components/Loading";
import {
  BarChart3,
  TrendingUp,
  Clock,
  CheckCircle,
  XCircle,
  Activity,
  Calendar,
  Users,
  Zap,
} from "lucide-react";
import { useToastContext } from "@/contexts/ToastContext";
import { analysisService } from "@/services/analysisService";

interface UserStats {
  total: number;
  completed: number;
  failed: number;
  pending: number;
  successRate: number;
  averageProcessingTime: number;
}

interface QueueStats {
  waiting: number;
  active: number;
  completed: number;
  failed: number;
  total: number;
}

export default function StatsPage() {
  const [userStats, setUserStats] = useState<UserStats | null>(null);
  const [queueStats, setQueueStats] = useState<QueueStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [timeRange, setTimeRange] = useState("7d");

  const { isAuthenticated } = useAuthGuard();
  const { showError } = useToastContext();
  const { t } = useLanguage();

  const loadStats = useCallback(async () => {
    try {
      setLoading(true);
      const [userStatsData, queueStatsData] = await Promise.all([
        analysisService.getUserStats(),
        analysisService.getQueueStats(),
      ]);
      setUserStats(userStatsData);
      setQueueStats(queueStatsData);
    } catch (error) {
      console.error("Erro ao carregar estatísticas:", error);
      showError(t("stats.loadError"));
    } finally {
      setLoading(false);
    }
  }, [showError, t]);

  const loadQueueStats = useCallback(async () => {
    try {
      const queueStatsData = await analysisService.getQueueStats();
      setQueueStats(queueStatsData);
    } catch (error) {
      console.error("Erro ao carregar estatísticas da fila:", error);
    }
  }, []);

  useEffect(() => {
    if (isAuthenticated) {
      loadStats();
      const interval = setInterval(loadQueueStats, 30000); // Atualiza a cada 30s
      return () => clearInterval(interval);
    }
  }, [isAuthenticated, timeRange, loadStats, loadQueueStats]);

  const formatTime = (ms: number) => {
    if (ms < 1000) return `${ms}ms`;
    if (ms < 60000) return `${(ms / 1000).toFixed(1)}s`;
    return `${(ms / 60000).toFixed(1)}min`;
  };

  const getSuccessRateColor = (rate: number) => {
    if (rate >= 90) return "text-green-600";
    if (rate >= 70) return "text-yellow-600";
    return "text-red-600";
  };

  if (!isAuthenticated) return null;

  return (
    <Layout>
      <div className="py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900">
              {t("stats.title")} {t("global.and")} {t("stats.metrics")}
            </h1>
            <p className="mt-2 text-gray-600">{t("stats.subtitle")}</p>
          </div>

          {/* Time Range Selector */}
          <div className="mb-6">
            <div className="flex items-center space-x-4">
              <label className="text-sm font-medium text-gray-700">
                {t("stats.period")}:
              </label>
              <select
                value={timeRange}
                onChange={(e) => setTimeRange(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              >
                <option value="7d">{t("stats.last7Days")}</option>
                <option value="30d">{t("stats.last30Days")}</option>
                <option value="90d">{t("stats.last90Days")}</option>
                <option value="1y">{t("stats.lastYear")}</option>
              </select>
            </div>
          </div>

          {loading ? (
            <Loading />
          ) : (
            <div className="space-y-6">
              {/* User Statistics */}
              {userStats && (
                <div className="bg-white rounded-lg shadow-sm p-6">
                  <div className="flex items-center mb-6">
                    <Users className="h-6 w-6 text-indigo-600 mr-3" />
                    <h2 className="text-xl font-semibold text-gray-900">
                      {t("stats.yourStats")}
                    </h2>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    {/* Total Analyses */}
                    <div className="bg-blue-50 rounded-lg p-4">
                      <div className="flex items-center">
                        <BarChart3 className="h-8 w-8 text-blue-600" />
                        <div className="ml-3">
                          <p className="text-sm font-medium text-blue-600">
                            {t("dashboard.totalAnalyses")}
                          </p>
                          <p className="text-2xl font-bold text-blue-900">
                            {userStats.total}
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Success Rate */}
                    <div className="bg-green-50 rounded-lg p-4">
                      <div className="flex items-center">
                        <CheckCircle className="h-8 w-8 text-green-600" />
                        <div className="ml-3">
                          <p className="text-sm font-medium text-green-600">
                            {t("stats.successRate")}
                          </p>
                          <p
                            className={`text-2xl font-bold ${getSuccessRateColor(
                              userStats.successRate
                            )}`}
                          >
                            {userStats.successRate.toFixed(1)}%
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Average Processing Time */}
                    <div className="bg-purple-50 rounded-lg p-4">
                      <div className="flex items-center">
                        <Zap className="h-8 w-8 text-purple-600" />
                        <div className="ml-3">
                          <p className="text-sm font-medium text-purple-600">
                            {t("stats.averageProcessingTime")}
                          </p>
                          <p className="text-2xl font-bold text-purple-900">
                            {formatTime(userStats.averageProcessingTime)}
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Pending Analyses */}
                    <div className="bg-yellow-50 rounded-lg p-4">
                      <div className="flex items-center">
                        <Clock className="h-8 w-8 text-yellow-600" />
                        <div className="ml-3">
                          <p className="text-sm font-medium text-yellow-600">
                            {t("stats.inProcessing")}
                          </p>
                          <p className="text-2xl font-bold text-yellow-900">
                            {userStats.pending}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Detailed Breakdown */}
                  <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="text-center">
                      <div className="text-3xl font-bold text-green-600">
                        {userStats.completed}
                      </div>
                      <div className="text-sm text-gray-600">
                        {t("dashboard.completed")}
                      </div>
                    </div>
                    <div className="text-center">
                      <div className="text-3xl font-bold text-red-600">
                        {userStats.failed}
                      </div>
                      <div className="text-sm text-gray-600">
                        {t("dashboard.failed")}
                      </div>
                    </div>
                    <div className="text-center">
                      <div className="text-3xl font-bold text-yellow-600">
                        {userStats.pending}
                      </div>
                      <div className="text-sm text-gray-600">
                        {t("dashboard.pending")}
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Queue Statistics */}
              {queueStats && (
                <div className="bg-white rounded-lg shadow-sm p-6">
                  <div className="flex items-center mb-6">
                    <Activity className="h-6 w-6 text-indigo-600 mr-3" />
                    <h2 className="text-xl font-semibold text-gray-900">
                      {t("stats.queueStatus")}
                    </h2>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    {/* Waiting */}
                    <div className="bg-yellow-50 rounded-lg p-4">
                      <div className="flex items-center">
                        <Clock className="h-8 w-8 text-yellow-600" />
                        <div className="ml-3">
                          <p className="text-sm font-medium text-yellow-600">
                            {t("stats.inQueue")}
                          </p>
                          <p className="text-2xl font-bold text-yellow-900">
                            {queueStats.waiting}
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Active */}
                    <div className="bg-blue-50 rounded-lg p-4">
                      <div className="flex items-center">
                        <TrendingUp className="h-8 w-8 text-blue-600" />
                        <div className="ml-3">
                          <p className="text-sm font-medium text-blue-600">
                            {t("status.processing")}
                          </p>
                          <p className="text-2xl font-bold text-blue-900">
                            {queueStats.active}
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Completed */}
                    <div className="bg-green-50 rounded-lg p-4">
                      <div className="flex items-center">
                        <CheckCircle className="h-8 w-8 text-green-600" />
                        <div className="ml-3">
                          <p className="text-sm font-medium text-green-600">
                            {t("status.completed")}
                          </p>
                          <p className="text-2xl font-bold text-green-900">
                            {queueStats.completed}
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Failed */}
                    <div className="bg-red-50 rounded-lg p-4">
                      <div className="flex items-center">
                        <XCircle className="h-8 w-8 text-red-600" />
                        <div className="ml-3">
                          <p className="text-sm font-medium text-red-600">
                            {t("status.failed")}
                          </p>
                          <p className="text-2xl font-bold text-red-900">
                            {queueStats.failed}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Queue Summary */}
                  <div className="mt-8 bg-gray-50 rounded-lg p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center">
                        <Calendar className="h-5 w-5 text-gray-500 mr-2" />
                        <span className="text-sm font-medium text-gray-700">
                          {t("stats.totalInQueue")}: {queueStats.total}
                        </span>
                      </div>
                      <div className="text-sm text-gray-500">
                        {t("stats.updatedAt")}{" "}
                        {new Date().toLocaleTimeString("pt-BR")}
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Performance Insights */}
              <div className="bg-white rounded-lg shadow-sm p-6">
                <h2 className="text-xl font-semibold text-gray-900 mb-6">
                  {t("stats.performanceInsights")}
                </h2>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg p-6">
                    <h3 className="text-lg font-medium text-gray-900 mb-3">
                      {t("stats.recommendations")}
                    </h3>
                    <ul className="space-y-2 text-sm text-gray-700">
                      <li className="flex items-start">
                        <CheckCircle className="h-4 w-4 text-green-500 mr-2 mt-0.5 flex-shrink-0" />
                        {t("stats.recommendation1")}
                      </li>
                      <li className="flex items-start">
                        <CheckCircle className="h-4 w-4 text-green-500 mr-2 mt-0.5 flex-shrink-0" />
                        {t("stats.recommendation2")}
                      </li>
                      <li className="flex items-start">
                        <CheckCircle className="h-4 w-4 text-green-500 mr-2 mt-0.5 flex-shrink-0" />
                        {t("stats.recommendation3")}
                      </li>
                    </ul>
                  </div>

                  <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-lg p-6">
                    <h3 className="text-lg font-medium text-gray-900 mb-3">
                      {t("stats.usageTips")}
                    </h3>
                    <ul className="space-y-2 text-sm text-gray-700">
                      <li className="flex items-start">
                        <Zap className="h-4 w-4 text-yellow-500 mr-2 mt-0.5 flex-shrink-0" />
                        {t("stats.tip1")}
                      </li>
                      <li className="flex items-start">
                        <Zap className="h-4 w-4 text-yellow-500 mr-2 mt-0.5 flex-shrink-0" />
                        {t("stats.tip2")}
                      </li>
                      <li className="flex items-start">
                        <Zap className="h-4 w-4 text-yellow-500 mr-2 mt-0.5 flex-shrink-0" />
                        {t("stats.tip3")}
                      </li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
}
