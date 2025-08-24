"use client";

import { useState } from "react";
import { useLanguage } from "@/contexts/LanguageContext";
import { useToastContext } from "@/contexts/ToastContext";
import { analysisService } from "@/services/analysisService";
import { Analysis } from "@/types/analysis";
import { usePolling } from "@/hooks/usePolling";
import {
  FileText,
  Clock,
  CheckCircle,
  XCircle,
  Play,
  Copy,
  Download,
  RotateCcw,
} from "lucide-react";

export default function TextAnalyzer() {
  const [text, setText] = useState("");
  const [analysis, setAnalysis] = useState<Analysis | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const { t } = useLanguage();
  const { showSuccess, showError } = useToastContext();

  // Polling para análises assíncronas
  const { startPolling, stopPolling } = usePolling();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!text.trim()) return;

    setLoading(true);
    setError("");
    setAnalysis(null);

    try {
      const result = await analysisService.analyzeText(text);
      setAnalysis(result);

      // Se for assíncrono, inicia o polling
      if (result.status === "PENDING" || result.status === "PROCESSING") {
        startPolling(
          () => analysisService.getAnalysis(result.id),
          (updatedAnalysis: unknown) => {
            if (
              typeof updatedAnalysis === "object" &&
              updatedAnalysis !== null
            ) {
              setAnalysis(updatedAnalysis as Analysis);
              if (
                (updatedAnalysis as Analysis).status === "COMPLETED" ||
                (updatedAnalysis as Analysis).status === "FAILED"
              ) {
                stopPolling();
              }
            }
          }
        );
      }
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : t("messages.error");
      setError(errorMessage);
      showError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleRetry = async () => {
    if (!analysis) return;

    try {
      setLoading(true);
      const result = await analysisService.retryAnalysis(analysis.id);
      setAnalysis(result);
      showSuccess(t("messages.success"));
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : t("button.retry");
      showError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const copyResults = () => {
    if (analysis) {
      navigator.clipboard.writeText(JSON.stringify(analysis, null, 2));
      showSuccess(t("messages.success"));
    }
  };

  const downloadResults = () => {
    if (analysis) {
      const dataStr = JSON.stringify(analysis, null, 2);
      const dataUri =
        "data:application/json;charset=utf-8," + encodeURIComponent(dataStr);
      const exportFileDefaultName = `analise-${analysis.id}.json`;

      const linkElement = document.createElement("a");
      linkElement.setAttribute("href", dataUri);
      linkElement.setAttribute("download", exportFileDefaultName);
      linkElement.click();

      showSuccess(t("messages.success"));
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "PENDING":
        return <Clock className="h-5 w-5 text-yellow-500" />;
      case "PROCESSING":
        return <Play className="h-5 w-5 text-blue-500" />;
      case "COMPLETED":
        return <CheckCircle className="h-5 w-5 text-green-500" />;
      case "FAILED":
        return <XCircle className="h-5 w-5 text-red-500" />;
      default:
        return <FileText className="h-5 w-5 text-gray-500" />;
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case "PENDING":
        return t("status.pending");
      case "PROCESSING":
        return t("status.processing");
      case "COMPLETED":
        return t("status.completed");
      case "FAILED":
        return t("status.failed");
      default:
        return status;
    }
  };

  const getSentimentText = (sentiment: string) => {
    switch (sentiment) {
      case "positive":
        return t("sentiment.positive");
      case "negative":
        return t("sentiment.negative");
      case "neutral":
        return t("sentiment.neutral");
      default:
        return sentiment;
    }
  };

  const getReadabilityText = (difficulty: string) => {
    switch (difficulty) {
      case "very easy":
        return t("readability.veryEasy");
      case "easy":
        return t("readability.easy");
      case "fairly easy":
        return t("readability.fairlyEasy");
      case "standard":
        return t("readability.standard");
      case "fairly difficult":
        return t("readability.fairlyDifficult");
      case "difficult":
        return t("readability.difficult");
      case "very difficult":
        return t("readability.veryDifficult");
      default:
        return difficulty;
    }
  };

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-6">
      <div className="text-center">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          {t("analysis.title")}
        </h1>
        <p className="text-gray-600">{t("analysis.placeholder")}</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder={t("analysis.placeholder")}
            className="w-full h-32 p-4 border border-gray-300 rounded-lg resize-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
            maxLength={50000}
          />
          <div className="mt-2 text-sm text-gray-500 text-right">
            {text.length}/50.000 {t("metrics.characters")}
          </div>
        </div>

        <button
          type="submit"
          disabled={loading || !text.trim()}
          className="w-full bg-indigo-600 text-white py-3 px-6 rounded-lg font-medium hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          {loading ? t("analysis.processing") : t("analysis.submit")}
        </button>
      </form>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg">
          {error}
        </div>
      )}

      {analysis && (
        <div className="space-y-6">
          {/* Status da análise */}
          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                {getStatusIcon(analysis.status)}
                <div>
                  <h3 className="text-lg font-medium text-gray-900">
                    {getStatusText(analysis.status)}
                  </h3>
                  {analysis.status === "PENDING" && analysis.queuePosition && (
                    <p className="text-sm text-gray-600">
                      {t("analysis.queuePosition")}: {analysis.queuePosition}
                    </p>
                  )}
                  {analysis.processingTime && (
                    <p className="text-sm text-gray-600">
                      {t("analysis.processingTime")}: {analysis.processingTime}
                      ms
                    </p>
                  )}
                </div>
              </div>

              <div className="flex space-x-2">
                {analysis.status === "FAILED" && (
                  <button
                    onClick={handleRetry}
                    disabled={loading}
                    className="flex items-center space-x-2 px-4 py-2 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-yellow-500 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <RotateCcw className="h-4 w-4" />
                    <span>{t("button.retry")}</span>
                  </button>
                )}

                {analysis.status === "COMPLETED" && (
                  <>
                    <button
                      onClick={copyResults}
                      className="flex items-center space-x-2 px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500"
                    >
                      <Copy className="h-4 w-4" />
                      <span>{t("button.copy")}</span>
                    </button>
                    <button
                      onClick={downloadResults}
                      className="flex items-center space-x-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
                    >
                      <Download className="h-4 w-4" />
                      <span>{t("button.download")}</span>
                    </button>
                  </>
                )}
              </div>
            </div>
          </div>

          {/* Resultados da análise */}
          {analysis.status === "COMPLETED" && analysis.results && (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Análise Básica */}
              <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
                <h3 className="text-lg font-medium text-gray-900 mb-4">
                  {t("results.basic.title")}
                </h3>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-gray-600">
                      {t("metrics.characters")}:
                    </span>
                    <span className="font-medium">
                      {analysis.results.basic.characterCount}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">{t("metrics.words")}:</span>
                    <span className="font-medium">
                      {analysis.results.basic.wordCount}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">
                      {t("metrics.sentences")}:
                    </span>
                    <span className="font-medium">
                      {analysis.results.basic.sentenceCount}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">
                      {t("metrics.paragraphs")}:
                    </span>
                    <span className="font-medium">
                      {analysis.results.basic.paragraphCount}
                    </span>
                  </div>
                </div>
              </div>

              {/* Análise Linguística */}
              <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
                <h3 className="text-lg font-medium text-gray-900 mb-4">
                  {t("results.linguistic.title")}
                </h3>
                <div className="space-y-3">
                  <div>
                    <span className="text-gray-600">
                      {t("metrics.sentiment")}:
                    </span>
                    <span
                      className={`ml-2 px-2 py-1 rounded-full text-xs font-medium ${
                        analysis.results.linguistic.sentiment.classification ===
                        "positive"
                          ? "bg-green-100 text-green-800"
                          : analysis.results.linguistic.sentiment
                              .classification === "negative"
                          ? "bg-red-100 text-red-800"
                          : "bg-gray-100 text-gray-800"
                      }`}
                    >
                      {getSentimentText(
                        analysis.results.linguistic.sentiment.classification
                      )}
                    </span>
                  </div>
                  <div>
                    <span className="text-gray-600">
                      {t("metrics.readability")}:
                    </span>
                    <span className="ml-2 px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                      {getReadabilityText(
                        analysis.results.linguistic.readability.difficulty
                      )}
                    </span>
                  </div>
                </div>
              </div>

              {/* Análise Avançada */}
              <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
                <h3 className="text-lg font-medium text-gray-900 mb-4">
                  {t("results.advanced.title")}
                </h3>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-gray-600">
                      {t("analysis.uniqueWords")}:
                    </span>
                    <span className="font-medium">
                      {analysis.results.advanced.uniqueWords}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">
                      {t("analysis.lexicalDiversity")}:
                    </span>
                    <span className="font-medium">
                      {(
                        analysis.results.advanced.lexicalDiversity * 100
                      ).toFixed(1)}
                      %
                    </span>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
