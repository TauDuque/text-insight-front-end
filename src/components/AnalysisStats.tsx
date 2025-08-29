"use client";

import { useState, useEffect, useCallback } from "react";
import { useLanguage } from "@/contexts/LanguageContext";
import { analysisService } from "@/services/analysisService";
import { BarChart3, Users, AlertCircle } from "lucide-react";

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

// Contexto para notificar atualizações
const updateStatsEvent = new EventTarget();

export const notifyStatsUpdate = () => {
  updateStatsEvent.dispatchEvent(new Event("statsUpdated"));
};

export default function AnalysisStats() {
  const [userStats, setUserStats] = useState<UserStats | null>(null);
  const [queueStats, setQueueStats] = useState<QueueStats | null>(null);
  const [loading, setLoading] = useState(true);
  const { t } = useLanguage();

  const loadStats = useCallback(async () => {
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
  }, []);

  const loadQueueStats = useCallback(async () => {
    try {
      const queueStatsData = await analysisService.getQueueStats();
      setQueueStats(queueStatsData);
    } catch (error) {
      console.error("Erro ao carregar estatísticas da fila:", error);
    }
  }, []);

  useEffect(() => {
    loadStats();

    // Atualizar estatísticas da fila a cada 30 segundos
    const interval = setInterval(loadQueueStats, 30000);

    // Listener para atualizações em tempo real
    const handleStatsUpdate = () => {
      loadStats();
    };

    updateStatsEvent.addEventListener("statsUpdated", handleStatsUpdate);

    return () => {
      clearInterval(interval);
      updateStatsEvent.removeEventListener("statsUpdated", handleStatsUpdate);
    };
  }, [loadStats, loadQueueStats]);

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
      {/* ✅ NOVO: Informações sobre o sistema de fila */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <div className="flex items-center text-blue-800">
          <AlertCircle className="w-5 h-5 mr-2" />
          <div>
            <h3 className="font-semibold">Visão Geral do Sistema</h3>
            <p className="text-sm">
              Todas as análises são processadas em fila para otimizar custos e
              performance. Limite máximo: 2KB por análise.
            </p>
          </div>
        </div>
      </div>

      {/* Estatísticas do Usuário */}
      {userStats && (
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center mb-6">
            <Users className="h-6 w-6 text-indigo-600 mr-2" />
            <h2 className="text-2xl font-bold text-gray-900">
              Suas Estatísticas
            </h2>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            <div className="bg-indigo-50 p-4 rounded-lg border border-indigo-200">
              <div className="text-center">
                <div className="text-2xl font-bold text-indigo-600">
                  {userStats.total}
                </div>
                <div className="text-sm text-indigo-800">Total</div>
              </div>
            </div>

            <div className="bg-green-50 p-4 rounded-lg border border-green-200">
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600">
                  {userStats.completed}
                </div>
                <div className="text-sm text-green-800">Concluídas</div>
              </div>
            </div>

            <div className="bg-yellow-50 p-4 rounded-lg border border-yellow-200">
              <div className="text-center">
                <div className="text-2xl font-bold text-yellow-600">
                  {userStats.pending}
                </div>
                <div className="text-sm text-yellow-800">Pendentes</div>
              </div>
            </div>

            <div className="bg-red-50 p-4 rounded-lg border border-red-200">
              <div className="text-center">
                <div className="text-2xl font-bold text-red-600">
                  {userStats.failed}
                </div>
                <div className="text-sm text-red-800">Falharam</div>
              </div>
            </div>
          </div>

          {/* ✅ NOVO: Métricas adicionais do usuário */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
            <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
              <div className="text-center">
                <div className="text-2xl font-bold text-gray-700">
                  {userStats.successRate.toFixed(1)}%
                </div>
                <div className="text-sm text-gray-600">Taxa de Sucesso</div>
              </div>
            </div>

            <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
              <div className="text-center">
                <div className="text-2xl font-bold text-gray-700">
                  {userStats.averageProcessingTime < 1000
                    ? `${userStats.averageProcessingTime}ms`
                    : `${(userStats.averageProcessingTime / 1000).toFixed(1)}s`}
                </div>
                <div className="text-sm text-gray-600">Tempo Médio</div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Estatísticas da Fila */}
      {queueStats && (
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center mb-6">
            <BarChart3 className="h-6 w-6 text-green-600 mr-2" />
            <h2 className="text-2xl font-bold text-gray-900">
              Estatísticas da Fila
            </h2>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600">
                  {queueStats.total}
                </div>
                <div className="text-sm text-blue-800">Total</div>
              </div>
            </div>

            <div className="bg-yellow-50 p-4 rounded-lg border border-yellow-200">
              <div className="text-center">
                <div className="text-2xl font-bold text-yellow-600">
                  {queueStats.waiting}
                </div>
                <div className="text-sm text-yellow-800">Aguardando</div>
              </div>
            </div>

            <div className="bg-indigo-50 p-4 rounded-lg border border-indigo-200">
              <div className="text-center">
                <div className="text-2xl font-bold text-indigo-600">
                  {queueStats.active}
                </div>
                <div className="text-sm text-indigo-800">Ativos</div>
              </div>
            </div>

            <div className="bg-green-50 p-4 rounded-lg border border-green-200">
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600">
                  {queueStats.completed}
                </div>
                <div className="text-sm text-green-800">Concluídos</div>
              </div>
            </div>
          </div>

          {/* ✅ NOVO: Barra de progresso da fila */}
          {queueStats.total > 0 && (
            <div className="mt-6">
              <div className="flex justify-between text-sm text-gray-600 mb-2">
                <span>Progresso da Fila</span>
                <span>
                  {queueStats.completed + queueStats.failed} /{" "}
                  {queueStats.total} jobs
                </span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-3">
                <div
                  className="bg-green-500 h-3 rounded-full transition-all duration-300"
                  style={{
                    width: `${
                      ((queueStats.completed + queueStats.failed) /
                        queueStats.total) *
                      100
                    }%`,
                  }}
                ></div>
              </div>
              <div className="flex justify-between text-xs text-gray-500 mt-1">
                <span>Concluído: {queueStats.completed}</span>
                <span>Falhou: {queueStats.failed}</span>
                <span>Aguardando: {queueStats.waiting}</span>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
