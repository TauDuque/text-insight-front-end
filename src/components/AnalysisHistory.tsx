"use client";

import { useState, useEffect } from "react";
import { analysisService } from "@/services/analysisService";
import type { AnalysisHistory as AnalysisHistoryType } from "@/types/analysis";
import { Clock, CheckCircle, XCircle, Trash2 } from "lucide-react";

export default function AnalysisHistory() {
  const [history, setHistory] = useState<AnalysisHistoryType[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);

  const loadHistory = async (pageNum: number = 1, append: boolean = false) => {
    try {
      setLoading(true);
      const response = await analysisService.getAnalysisHistory(pageNum, 10);

      if (append) {
        setHistory((prev) => [...prev, ...response.analyses]);
      } else {
        setHistory(response.analyses);
      }

      setHasMore(response.analyses.length === 10);
    } catch (err: unknown) {
      const errorMessage =
        err instanceof Error ? err.message : "Erro ao carregar histórico";
      if (typeof err === "object" && err !== null && "response" in err) {
        const response = (err as { response?: { data?: { message?: string } } })
          .response;
        setError(response?.data?.message || errorMessage);
      } else {
        setError(errorMessage);
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadHistory();
  }, []);

  const handleLoadMore = () => {
    const nextPage = page + 1;
    setPage(nextPage);
    loadHistory(nextPage, true);
  };

  const handleDelete = async (id: string) => {
    try {
      await analysisService.deleteAnalysis(id);
      setHistory((prev) => prev.filter((item) => item.id !== id));
    } catch (err: unknown) {
      const errorMessage =
        err instanceof Error ? err.message : "Erro ao deletar análise";
      console.error("Erro ao deletar análise:", errorMessage);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "COMPLETED":
        return <CheckCircle className="h-5 w-5 text-green-500" />;
      case "FAILED":
        return <XCircle className="h-5 w-5 text-red-500" />;
      default:
        return <Clock className="h-5 w-5 text-yellow-500" />;
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case "COMPLETED":
        return "Concluído";
      case "FAILED":
        return "Falhou";
      case "PENDING":
        return "Na fila";
      case "PROCESSING":
        return "Processando";
      default:
        return "Desconhecido";
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString("pt-BR");
  };

  const formatProcessingTime = (time: number) => {
    if (time < 1000) return `${time}ms`;
    return `${(time / 1000).toFixed(2)}s`;
  };

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-red-800 mb-2">Erro</h3>
        <p className="text-red-700">{error}</p>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-6">
          Histórico de Análises
        </h2>

        {history.length === 0 && !loading ? (
          <div className="text-center py-8">
            <Clock className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500">Nenhuma análise encontrada</p>
            <p className="text-sm text-gray-400">
              Realize sua primeira análise para ver o histórico aqui
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {history.map((item) => (
              <div
                key={item.id}
                className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-3 mb-2">
                      {getStatusIcon(item.status)}
                      <span className="text-sm font-medium text-gray-900">
                        {getStatusText(item.status)}
                      </span>
                      <span className="text-xs text-gray-500">
                        {formatDate(item.createdAt)}
                      </span>
                    </div>

                    <div className="text-sm text-gray-900 mb-2">
                      {item.textPreview.length > 100
                        ? `${item.textPreview.substring(0, 100)}...`
                        : item.textPreview}
                    </div>

                    <div className="flex items-center space-x-4 text-xs text-gray-600">
                      {item.processingTime && (
                        <span>
                          Tempo: {formatProcessingTime(item.processingTime)}
                        </span>
                      )}
                      {item.completedAt && (
                        <span>Concluído: {formatDate(item.completedAt)}</span>
                      )}
                    </div>

                    {item.error && (
                      <div className="mt-2 text-sm text-red-700 bg-red-50 px-3 py-2 rounded">
                        {item.error}
                      </div>
                    )}
                  </div>

                  <div className="flex items-center space-x-2 ml-4">
                    <button
                      onClick={() => handleDelete(item.id)}
                      className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-full transition-colors"
                      title="Deletar análise"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))}

            {hasMore && (
              <div className="text-center pt-4">
                <button
                  onClick={handleLoadMore}
                  disabled={loading}
                  className="px-4 py-2 bg-gray-100 text-gray-900 rounded-md hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? "Carregando..." : "Carregar mais"}
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
