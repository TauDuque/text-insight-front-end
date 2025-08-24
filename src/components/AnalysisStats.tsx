"use client";

import { useState, useEffect } from "react";
import { useLanguage } from "@/contexts/LanguageContext";
import { analysisService } from "@/services/analysisService";
import { BarChart3, Users } from "lucide-react";

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

export default function AnalysisStats() {
  const [userStats, setUserStats] = useState<UserStats | null>(null);
  const [queueStats, setQueueStats] = useState<QueueStats | null>(null);
  const [loading, setLoading] = useState(true);
  const { t } = useLanguage();

  useEffect(() => {
    loadStats();

    // Atualizar estatísticas da fila a cada 30 segundos
    const interval = setInterval(loadQueueStats, 30000);
    return () => clearInterval(interval);
  }, []);

  const loadStats = async () => {
    try {
      const [userStatsData, queueStatsData] = await Promise.all([
        analysisService.getUserStats(),
        analysisService.getQueueStats(),
      ]);

      setUserStats(userStatsData);
      setQueueStats(queueStatsData);
    } catch (error) {
      console.error("Erro ao carregar estatísticas:", error);
    } finally {
      setLoading(false);
    }
  };

  const loadQueueStats = async () => {
    try {
      const queueStatsData = await analysisService.getQueueStats();
      setQueueStats(queueStatsData);
    } catch (error) {
      console.error("Erro ao carregar estatísticas da fila:", error);
    }
  };

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="animate-pulse">
          <div className="h-4 bg-gray-200 rounded w-1/4 mb-4"></div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-20 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Estatísticas do Usuário */}
      {userStats && (
        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
            <BarChart3 className="h-5 w-5 mr-2 text-indigo-600" />
            {t("stats.overview")}
          </h3>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center p-4 bg-blue-50 rounded-lg">
              <div className="text-2xl font-bold text-blue-900">
                {userStats.total}
              </div>
              <div className="text-sm text-blue-700">
                {t("dashboard.totalAnalyses")}
              </div>
            </div>

            <div className="text-center p-4 bg-green-50 rounded-lg">
              <div className="text-2xl font-bold text-green-900">
                {userStats.completed}
              </div>
              <div className="text-sm text-green-700">
                {t("dashboard.completed")}
              </div>
            </div>

            <div className="text-center p-4 bg-yellow-50 rounded-lg">
              <div className="text-2xl font-bold text-yellow-900">
                {userStats.pending}
              </div>
              <div className="text-sm text-yellow-700">
                {t("dashboard.inProgress")}
              </div>
            </div>

            <div className="text-center p-4 bg-red-50 rounded-lg">
              <div className="text-2xl font-bold text-red-900">
                {userStats.failed}
              </div>
              <div className="text-sm text-red-700">
                {t("dashboard.failed")}
              </div>
            </div>
          </div>

          <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="text-center p-4 bg-gray-50 rounded-lg">
              <div className="text-xl font-bold text-gray-900">
                {userStats.successRate}%
              </div>
              <div className="text-sm text-gray-700">{t("stats.overview")}</div>
            </div>

            <div className="text-center p-4 bg-gray-50 rounded-lg">
              <div className="text-xl font-bold text-gray-900">
                {userStats.averageProcessingTime}ms
              </div>
              <div className="text-sm text-gray-700">
                {t("stats.averageProcessingTime")}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Estatísticas da Fila */}
      {queueStats && (
        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
            <Users className="h-5 w-5 mr-2 text-purple-600" />
            {t("stats.overview")} {t("global.total")}
          </h3>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center p-4 bg-yellow-50 rounded-lg">
              <div className="text-2xl font-bold text-yellow-900">
                {queueStats.waiting}
              </div>
              <div className="text-sm text-yellow-700">
                {t("status.pending")}
              </div>
            </div>

            <div className="text-center p-4 bg-blue-50 rounded-lg">
              <div className="text-2xl font-bold text-blue-900">
                {queueStats.active}
              </div>
              <div className="text-sm text-blue-700">
                {t("status.processing")}
              </div>
            </div>

            <div className="text-center p-4 bg-green-50 rounded-lg">
              <div className="text-2xl font-bold text-green-900">
                {queueStats.completed}
              </div>
              <div className="text-sm text-green-700">
                {t("status.completed")}
              </div>
            </div>

            <div className="text-center p-4 bg-red-50 rounded-lg">
              <div className="text-2xl font-bold text-red-900">
                {queueStats.failed}
              </div>
              <div className="text-sm text-red-700">{t("status.failed")}</div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
