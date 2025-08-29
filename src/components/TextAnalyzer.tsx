"use client";

import { useState } from "react";
import { useLanguage } from "@/contexts/LanguageContext";
import { useToastContext } from "@/contexts/ToastContext";
import { analysisService } from "@/services/analysisService";
import { Analysis, QueueResponse } from "@/types/analysis";
import { usePolling } from "@/hooks/usePolling";
import { notifyStatsUpdate } from "./AnalysisStats";
import {
  FileText,
  Clock,
  CheckCircle,
  XCircle,
  Play,
  Copy,
  Download,
  RotateCcw,
  AlertCircle,
} from "lucide-react";

export default function TextAnalyzer() {
  const [text, setText] = useState("");
  const [queueResponse, setQueueResponse] = useState<QueueResponse | null>(
    null
  );
  const [analysis, setAnalysis] = useState<Analysis | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const { t } = useLanguage();
  const { showSuccess, showError } = useToastContext();

  // ✅ CONSTANTES ATUALIZADAS
  const MAX_TEXT_SIZE = 2 * 1024; // 2KB máximo
  const MAX_TEXT_SIZE_KB = MAX_TEXT_SIZE / 1024;

  // Polling para análises assíncronas
  const { startPolling, stopPolling } = usePolling();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!text.trim()) return;

    // ✅ VALIDAÇÃO DE TAMANHO ATUALIZADA
    if (text.length > MAX_TEXT_SIZE) {
      const errorMessage = `Texto muito longo. Máximo permitido: ${MAX_TEXT_SIZE_KB}KB`;
      setError(errorMessage);
      showError(errorMessage);
      return;
    }

    setLoading(true);
    setError("");
    setAnalysis(null);
    setQueueResponse(null);

    try {
      // ✅ NOVO FLUXO: Sempre recebe QueueResponse primeiro
      const queueResult = await analysisService.analyzeText(text);
      setQueueResponse(queueResult);

      // ✅ INICIAR POLLING IMEDIATAMENTE (não há mais processamento direto)
      startPolling(
        () => analysisService.getAnalysisByQueueId(queueResult.queueId),
        (updatedAnalysis: unknown) => {
          if (typeof updatedAnalysis === "object" && updatedAnalysis !== null) {
            const analysisData = updatedAnalysis as Analysis;
            setAnalysis(analysisData);

            // ✅ ATUALIZAR ESTADO DA FILA
            if (
              analysisData.status === "COMPLETED" ||
              analysisData.status === "FAILED"
            ) {
              stopPolling();
              notifyStatsUpdate();
              showSuccess("Análise concluída!");
            }
          }
        },
        2000 // ✅ POLLING A CADA 2 SEGUNDOS
      );

      showSuccess("Texto enviado para processamento em fila!");
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
      showSuccess("Resultados copiados!");
    }
  };

  const downloadResults = () => {
    if (analysis) {
      const dataStr = JSON.stringify(analysis, null, 2);
      const dataBlob = new Blob([dataStr], { type: "application/json" });
      const url = URL.createObjectURL(dataBlob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `analysis-${analysis.id}.json`;
      link.click();
      URL.revokeObjectURL(url);
      showSuccess("Resultados baixados!");
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "PENDING":
        return <Clock className="w-5 h-5 text-yellow-500" />;
      case "PROCESSING":
        return <Play className="w-5 h-5 text-blue-500" />;
      case "COMPLETED":
        return <CheckCircle className="w-5 h-5 text-green-500" />;
      case "FAILED":
        return <XCircle className="w-5 h-5 text-red-500" />;
      default:
        return <Clock className="w-5 h-5 text-gray-500" />;
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case "PENDING":
        return "Aguardando processamento";
      case "PROCESSING":
        return "Processando...";
      case "COMPLETED":
        return "Concluído";
      case "FAILED":
        return "Falhou";
      default:
        return "Desconhecido";
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="bg-white rounded-lg shadow-lg p-6">
        <h2 className="text-2xl font-bold text-gray-800 mb-6 flex items-center">
          <FileText className="w-6 h-6 mr-2" />
          Análise de Texto
        </h2>

        {/* ✅ NOVO: VALIDAÇÃO DE TAMANHO VISÍVEL */}
        <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
          <div className="flex items-center text-sm text-blue-800">
            <AlertCircle className="w-4 h-4 mr-2" />
            <span>
              <strong>Limite:</strong> Máximo {MAX_TEXT_SIZE_KB}KB por análise
            </span>
          </div>
          {text.length > 0 && (
            <div className="mt-2 text-xs text-blue-600">
              Tamanho atual: {(text.length / 1024).toFixed(2)}KB
              {text.length > MAX_TEXT_SIZE && (
                <span className="text-red-600 font-semibold ml-2">
                  (Excede o limite!)
                </span>
              )}
            </div>
          )}
        </div>

        <form onSubmit={handleSubmit} className="mb-6">
          <div className="mb-4">
            <label
              htmlFor="text"
              className="block text-sm font-medium text-gray-700 mb-2"
            >
              Digite ou cole seu texto:
            </label>
            <textarea
              id="text"
              value={text}
              onChange={(e) => setText(e.target.value)}
              className="w-full h-32 px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 resize-none"
              placeholder="Digite ou cole seu texto aqui..."
              disabled={loading}
            />
          </div>

          <button
            type="submit"
            disabled={
              loading || text.length === 0 || text.length > MAX_TEXT_SIZE
            }
            className="w-full bg-indigo-600 text-white py-2 px-4 rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? "Enviando..." : "Analisar Texto"}
          </button>
        </form>

        {/* ✅ NOVO: EXIBIR INFORMAÇÕES DA FILA */}
        {queueResponse && (
          <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg">
            <div className="flex items-center text-green-800">
              <CheckCircle className="w-5 h-5 mr-2" />
              <div>
                <h3 className="font-semibold">Texto enviado para fila!</h3>
                <p className="text-sm">{queueResponse.message}</p>
                <p className="text-sm">
                  Tempo estimado: {queueResponse.estimatedTime} segundos
                </p>
                <p className="text-sm">ID da fila: {queueResponse.queueId}</p>
              </div>
            </div>
          </div>
        )}

        {/* ✅ EXIBIR ANÁLISE QUANDO PRONTA */}
        {analysis && (
          <div className="bg-gray-50 rounded-lg p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center">
                {getStatusIcon(analysis.status)}
                <span className="ml-2 font-medium text-gray-700">
                  {getStatusText(analysis.status)}
                </span>
              </div>
              <div className="flex space-x-2">
                <button
                  onClick={copyResults}
                  className="p-2 text-gray-600 hover:text-gray-800 hover:bg-gray-200 rounded-md"
                  title="Copiar resultados"
                >
                  <Copy className="w-4 h-4" />
                </button>
                <button
                  onClick={downloadResults}
                  className="p-2 text-gray-600 hover:text-gray-800 hover:bg-gray-200 rounded-md"
                  title="Baixar resultados"
                >
                  <Download className="w-4 h-4" />
                </button>
                {analysis.status === "FAILED" && (
                  <button
                    onClick={handleRetry}
                    disabled={loading}
                    className="p-2 text-gray-600 hover:text-gray-800 hover:bg-gray-200 rounded-md"
                    title="Tentar novamente"
                  >
                    <RotateCcw className="w-4 h-4" />
                  </button>
                )}
              </div>
            </div>

            {analysis.status === "COMPLETED" && analysis.results && (
              <div className="space-y-6">
                {/* Análise Básica */}
                <div>
                  <h3 className="text-lg font-semibold text-gray-800 mb-3">
                    Análise Básica
                  </h3>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="bg-white p-3 rounded-lg border">
                      <div className="text-2xl font-bold text-indigo-600">
                        {analysis.results.basic.characterCount}
                      </div>
                      <div className="text-sm text-gray-600">Caracteres</div>
                    </div>
                    <div className="bg-white p-3 rounded-lg border">
                      <div className="text-2xl font-bold text-indigo-600">
                        {analysis.results.basic.wordCount}
                      </div>
                      <div className="text-sm text-gray-600">Palavras</div>
                    </div>
                    <div className="bg-white p-3 rounded-lg border">
                      <div className="text-2xl font-bold text-indigo-600">
                        {analysis.results.basic.sentenceCount}
                      </div>
                      <div className="text-sm text-gray-600">Frases</div>
                    </div>
                    <div className="bg-white p-3 rounded-lg border">
                      <div className="text-2xl font-bold text-indigo-600">
                        {analysis.results.basic.paragraphCount}
                      </div>
                      <div className="text-sm text-gray-600">Parágrafos</div>
                    </div>
                  </div>
                </div>

                {/* Análise Linguística */}
                <div>
                  <h3 className="text-lg font-semibold text-gray-800 mb-3">
                    Análise Linguística
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="bg-white p-4 rounded-lg border">
                      <h4 className="font-medium text-gray-700 mb-2">
                        Sentimento
                      </h4>
                      <div className="text-center">
                        <div className="text-3xl font-bold text-indigo-600">
                          {analysis.results.linguistic.sentiment.classification}
                        </div>
                        <div className="text-sm text-gray-600">
                          Score: {analysis.results.linguistic.sentiment.score}
                        </div>
                      </div>
                    </div>
                    <div className="bg-white p-4 rounded-lg border">
                      <h4 className="font-medium text-gray-700 mb-2">
                        Legibilidade
                      </h4>
                      <div className="text-center">
                        <div className="text-2xl font-bold text-indigo-600">
                          {analysis.results.linguistic.readability.difficulty}
                        </div>
                        <div className="text-sm text-gray-600">
                          Flesch:{" "}
                          {analysis.results.linguistic.readability.fleschReadingEase.toFixed(
                            1
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Palavras-chave */}
                {analysis.results.linguistic.keywords.length > 0 && (
                  <div>
                    <h3 className="text-lg font-semibold text-gray-800 mb-3">
                      Palavras-chave
                    </h3>
                    <div className="flex flex-wrap gap-2">
                      {analysis.results.linguistic.keywords.map(
                        (keyword, index) => (
                          <span
                            key={index}
                            className="px-3 py-1 bg-indigo-100 text-indigo-800 rounded-full text-sm"
                          >
                            {keyword}
                          </span>
                        )
                      )}
                    </div>
                  </div>
                )}
              </div>
            )}

            {analysis.status === "FAILED" && analysis.error && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                <div className="flex items-center text-red-800">
                  <XCircle className="w-5 h-5 mr-2" />
                  <div>
                    <h3 className="font-semibold">Erro na análise</h3>
                    <p className="text-sm">{analysis.error}</p>
                  </div>
                </div>
              </div>
            )}

            {analysis.status === "PENDING" && (
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                <div className="flex items-center text-yellow-800">
                  <Clock className="w-5 h-5 mr-2" />
                  <div>
                    <h3 className="font-semibold">Aguardando processamento</h3>
                    <p className="text-sm">
                      Sua análise está na fila e será processada em breve.
                    </p>
                  </div>
                </div>
              </div>
            )}

            {analysis.status === "PROCESSING" && (
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <div className="flex items-center text-blue-800">
                  <Play className="w-5 h-5 mr-2" />
                  <div>
                    <h3 className="font-semibold">Processando...</h3>
                    <p className="text-sm">
                      Sua análise está sendo processada. Aguarde um momento.
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <div className="flex items-center text-red-800">
              <XCircle className="w-5 h-5 mr-2" />
              <span>{error}</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
