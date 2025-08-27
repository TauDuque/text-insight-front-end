"use client";

import { useState, useEffect, useCallback } from "react";
import { useParams } from "next/navigation";
import { analysisService } from "@/services/analysisService";
import { Analysis } from "@/types/analysis";
import { useAuthGuard } from "@/hooks/useAuthGuard";
import { useLanguage } from "@/contexts/LanguageContext";
import Loading from "@/components/Loading";
import Link from "next/link";
import { ArrowLeft, Download, Copy } from "lucide-react";
import { useToastContext } from "@/contexts/ToastContext";

export default function AnalysisDetailPage() {
  const params = useParams();
  const analysisId = params.id as string;
  const [analysis, setAnalysis] = useState<Analysis | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const { isAuthenticated } = useAuthGuard();
  const { t, language } = useLanguage();
  const { showSuccess, showError } = useToastContext();

  const loadAnalysis = useCallback(async () => {
    try {
      const data = await analysisService.getAnalysisByJWT(analysisId);
      setAnalysis(data);
    } catch (err: unknown) {
      const errorMessage =
        err instanceof Error ? err.message : "Erro ao carregar análise";
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
  }, [analysisId]);

  useEffect(() => {
    if (isAuthenticated && analysisId) {
      loadAnalysis();
    }
  }, [isAuthenticated, analysisId, loadAnalysis]);

  const copyToClipboard = (text: string) => {
    navigator.clipboard
      .writeText(text)
      .then(() => {
        showSuccess(t("messages.success"));
      })
      .catch(() => {
        showError(t("messages.error"));
      });
  };

  const downloadResults = () => {
    if (!analysis?.results) return;

    try {
      const dataStr = JSON.stringify(analysis.results, null, 2);
      const dataBlob = new Blob([dataStr], { type: "application/json" });
      const url = URL.createObjectURL(dataBlob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `analise-${analysis.id}.json`;
      link.click();
      URL.revokeObjectURL(url);
      showSuccess(t("messages.success"));
    } catch {
      showError(t("messages.error"));
    }
  };

  if (!isAuthenticated) return null;
  if (loading) return <Loading />;
  if (error)
    return <div className="text-center text-red-600 py-8">{error}</div>;
  if (!analysis)
    return <div className="text-center py-8">{t("analysis.notFound")}</div>;

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-6">
          <Link
            href="/dashboard"
            className="inline-flex items-center text-indigo-600 hover:text-indigo-500 mb-4"
          >
            <ArrowLeft className="h-4 w-4 mr-1" />
            {t("button.back")}
          </Link>

          <div className="flex justify-between items-start">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                {t("analysis.details")}
              </h1>
              <p className="text-gray-600">
                {t("analysis.createdAt")}{" "}
                {new Date(analysis.createdAt).toLocaleString(
                  language === "pt"
                    ? "pt-BR"
                    : language === "es"
                    ? "es-ES"
                    : "en-US"
                )}
              </p>
            </div>

            {analysis.status === "COMPLETED" && analysis.results && (
              <div className="flex space-x-2">
                <button
                  onClick={() =>
                    copyToClipboard(JSON.stringify(analysis.results, null, 2))
                  }
                  className="flex items-center px-3 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
                >
                  <Copy className="h-4 w-4 mr-1" />
                  {t("button.copy")}
                </button>
                <button
                  onClick={downloadResults}
                  className="flex items-center px-3 py-2 text-sm font-medium text-white bg-indigo-600 rounded-md hover:bg-indigo-700"
                >
                  <Download className="h-4 w-4 mr-1" />
                  {t("button.download")}
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Conteúdo da análise */}
        {analysis.status === "COMPLETED" && analysis.results ? (
          <div className="space-y-6">
            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">
                {t("analysis.results")}
              </h2>
              <pre className="bg-gray-50 p-4 rounded-lg overflow-auto text-sm text-gray-900">
                {JSON.stringify(analysis.results, null, 2)}
              </pre>
            </div>
          </div>
        ) : (
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="text-center">
              <p className="text-gray-600">
                {t("analysis.status")}:{" "}
                {t(`status.${analysis.status.toLowerCase()}`)}
              </p>
              {analysis.error && (
                <p className="text-red-600 mt-2">
                  {t("analysis.error")}: {analysis.error}
                </p>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
