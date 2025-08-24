"use client";

import { useState, useEffect } from "react";
import { analysisService } from "@/services/analysisService";
import { Users, Clock, CheckCircle, XCircle, TrendingUp } from "lucide-react";

interface QueueStats {
  totalJobs: number;
  pendingJobs: number;
  processingJobs: number;
  completedJobs: number;
  failedJobs: number;
  averageProcessingTime: number;
  jobsPerMinute: number;
}

export default function QueueStats() {
  const [stats, setStats] = useState<QueueStats | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const loadStats = async () => {
    try {
      setLoading(true);
      const response = await analysisService.getQueueStats();
      setStats(response);
    } catch (err: unknown) {
      const errorMessage =
        err instanceof Error ? err.message : "Erro ao carregar estatísticas";
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadStats();

    // Atualizar estatísticas a cada 30 segundos
    const interval = setInterval(loadStats, 30000);
    return () => clearInterval(interval);
  }, []);

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-red-800 mb-2">Erro</h3>
        <p className="text-red-700">{error}</p>
      </div>
    );
  }

  if (!stats) {
    return (
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="animate-pulse">
          <div className="h-6 bg-gray-200 rounded w-1/3 mb-4"></div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-20 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  const formatTime = (ms: number) => {
    if (ms < 1000) return `${ms}ms`;
    if (ms < 60000) return `${(ms / 1000).toFixed(1)}s`;
    return `${(ms / 60000).toFixed(1)}min`;
  };

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-gray-900">
            Estatísticas da Fila
          </h2>
          <button
            onClick={loadStats}
            disabled={loading}
            className="px-4 py-2 bg-indigo-100 text-indigo-700 rounded-md hover:bg-indigo-200 disabled:opacity-50 disabled:cursor-not-allowed text-sm"
          >
            {loading ? "Atualizando..." : "Atualizar"}
          </button>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          {/* Total de Jobs */}
          <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
            <div className="flex items-center space-x-3">
              <Users className="h-8 w-8 text-blue-600" />
              <div>
                <div className="text-2xl font-bold text-blue-600">
                  {stats.totalJobs}
                </div>
                <div className="text-sm text-blue-800">Total de Jobs</div>
              </div>
            </div>
          </div>

          {/* Jobs Pendentes */}
          <div className="bg-yellow-50 p-4 rounded-lg border border-yellow-200">
            <div className="flex items-center space-x-3">
              <Clock className="h-8 w-8 text-yellow-600" />
              <div>
                <div className="text-2xl font-bold text-yellow-600">
                  {stats.pendingJobs}
                </div>
                <div className="text-sm text-yellow-800">Na Fila</div>
              </div>
            </div>
          </div>

          {/* Jobs Concluídos */}
          <div className="bg-green-50 p-4 rounded-lg border border-green-200">
            <div className="flex items-center space-x-3">
              <CheckCircle className="h-8 w-8 text-green-600" />
              <div>
                <div className="text-2xl font-bold text-green-600">
                  {stats.completedJobs}
                </div>
                <div className="text-sm text-green-800">Concluídos</div>
              </div>
            </div>
          </div>

          {/* Jobs Falharam */}
          <div className="bg-red-50 p-4 rounded-lg border border-red-200">
            <div className="flex items-center space-x-3">
              <XCircle className="h-8 w-8 text-red-600" />
              <div>
                <div className="text-2xl font-bold text-red-600">
                  {stats.failedJobs}
                </div>
                <div className="text-sm text-red-800">Falharam</div>
              </div>
            </div>
          </div>
        </div>

        {/* Estatísticas Adicionais */}
        <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-gray-50 p-4 rounded-lg border">
            <div className="flex items-center space-x-3">
              <TrendingUp className="h-6 w-6 text-gray-600" />
              <div>
                <div className="text-lg font-semibold text-gray-900">
                  {stats.jobsPerMinute.toFixed(1)}
                </div>
                <div className="text-sm text-gray-600">Jobs/min</div>
              </div>
            </div>
          </div>

          <div className="bg-gray-50 p-4 rounded-lg border">
            <div className="text-center">
              <div className="text-lg font-semibold text-gray-900">
                {formatTime(stats.averageProcessingTime)}
              </div>
              <div className="text-sm text-gray-600">Tempo Médio</div>
            </div>
          </div>

          <div className="bg-gray-50 p-4 rounded-lg border">
            <div className="text-center">
              <div className="text-lg font-semibold text-gray-900">
                {stats.processingJobs}
              </div>
              <div className="text-sm text-gray-600">Processando</div>
            </div>
          </div>
        </div>

        {/* Barra de Progresso Geral */}
        {stats.totalJobs > 0 && (
          <div className="mt-6">
            <div className="flex justify-between text-sm text-gray-600 mb-2">
              <span>Progresso Geral</span>
              <span>
                {stats.completedJobs + stats.failedJobs} / {stats.totalJobs}{" "}
                jobs
              </span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-3">
              <div
                className="bg-green-500 h-3 rounded-full transition-all duration-300"
                style={{
                  width: `${
                    ((stats.completedJobs + stats.failedJobs) /
                      stats.totalJobs) *
                    100
                  }%`,
                }}
              ></div>
            </div>
            <div className="flex justify-between text-xs text-gray-500 mt-1">
              <span>Concluído: {stats.completedJobs}</span>
              <span>Falhou: {stats.failedJobs}</span>
              <span>Pendente: {stats.pendingJobs}</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
