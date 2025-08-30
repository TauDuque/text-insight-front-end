"use client";

import { useState } from "react";
import { useLanguage } from "@/contexts/LanguageContext";
import { useToastContext } from "@/contexts/ToastContext";
import { documentService } from "@/services/documentService";
import { Document, QueueResponse } from "@/types/document";
import { usePolling } from "@/hooks/usePolling";

import FileUpload from "./FileUpload";
import {
  Clock,
  CheckCircle,
  XCircle,
  Play,
  Download,
  RotateCcw,
  AlertCircle,
} from "lucide-react";

export default function DocumentProcessor() {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [queueResponse, setQueueResponse] = useState<QueueResponse | null>(
    null
  );
  const [document, setDocument] = useState<Document | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const { t } = useLanguage();
  const { showSuccess, showError } = useToastContext();

  // Polling para documentos assíncronos
  const { startPolling, stopPolling } = usePolling();

  const handleFileSelect = (file: File) => {
    setSelectedFile(file);
    setError("");
    setDocument(null);
    setQueueResponse(null);
  };

  const handleFileRemove = () => {
    setSelectedFile(null);
    setError("");
    setDocument(null);
    setQueueResponse(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedFile) return;

    setLoading(true);
    setError("");
    setDocument(null);
    setQueueResponse(null);

    try {
      // Upload do documento para processamento
      const queueResult = await documentService.uploadDocument(selectedFile);
      setQueueResponse(queueResult);

      // Iniciar polling para acompanhar o status
      startPolling(
        () => documentService.getDocumentByQueueId(queueResult.queueId),
        (updatedDocument: unknown) => {
          if (typeof updatedDocument === "object" && updatedDocument !== null) {
            const documentData = updatedDocument as Document;
            setDocument(documentData);

            // Atualizar estado da fila quando concluído
            if (
              documentData.status === "COMPLETED" ||
              documentData.status === "FAILED"
            ) {
              stopPolling();
              showSuccess("Documento processado com sucesso!");
            }
          }
        },
        2000 // Polling a cada 2 segundos
      );

      showSuccess("Documento enviado para processamento em fila!");
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
    if (!document) return;

    try {
      setLoading(true);
      const result = await documentService.retryDocument(document.id);
      setDocument(result);
      setError("");
      showSuccess("Documento enviado para reprocessamento!");
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : t("messages.error");
      showError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleDownload = async () => {
    if (!document || document.status !== "COMPLETED") return;

    try {
      await documentService.downloadDocument(document.id);
      // TODO: Implementar download real do arquivo
      showSuccess("Download iniciado!");
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : t("messages.error");
      showError(errorMessage);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    showSuccess("Copiado para a área de transferência!");
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "PENDING":
        return <Clock className="h-5 w-5 text-yellow-500" />;
      case "PROCESSING":
        return <Play className="h-5 w-5 text-blue-500 animate-pulse" />;
      case "COMPLETED":
        return <CheckCircle className="h-5 w-5 text-green-500" />;
      case "FAILED":
        return <XCircle className="h-5 w-5 text-red-500" />;
      default:
        return <Clock className="h-5 w-5 text-gray-500" />;
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case "PENDING":
        return "Aguardando";
      case "PROCESSING":
        return "Processando";
      case "COMPLETED":
        return "Concluído";
      case "FAILED":
        return "Falhou";
      default:
        return "Desconhecido";
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      <div className="text-center">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          Processador de Documentos
        </h1>
        <p className="text-gray-600">
          Envie documentos para processamento em fila e obtenha metadados e
          análises
        </p>
      </div>

      {/* Upload de Arquivo */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">
          Selecionar Documento
        </h2>
        <FileUpload
          onFileSelect={handleFileSelect}
          onFileRemove={handleFileRemove}
          selectedFile={selectedFile}
          loading={loading}
          error={error}
        />

        {selectedFile && (
          <button
            onClick={handleSubmit}
            disabled={loading}
            className="mt-4 w-full bg-blue-600 text-white py-3 px-6 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed font-medium"
          >
            {loading ? "Enviando..." : "Processar Documento"}
          </button>
        )}
      </div>

      {/* Status da Fila */}
      {queueResponse && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
          <div className="flex items-center space-x-3 mb-4">
            <Clock className="h-6 w-6 text-blue-600" />
            <h3 className="text-lg font-semibold text-blue-800">
              Documento na Fila
            </h3>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
            <div>
              <span className="font-medium text-blue-700">Arquivo:</span>
              <p className="text-blue-600">{queueResponse.filename}</p>
            </div>
            <div>
              <span className="font-medium text-blue-700">Tamanho:</span>
              <p className="text-blue-600">
                {formatFileSize(queueResponse.fileSize)}
              </p>
            </div>
            <div>
              <span className="font-medium text-blue-700">Tempo Estimado:</span>
              <p className="text-blue-600">{queueResponse.estimatedTime}s</p>
            </div>
          </div>
          <p className="text-blue-700 mt-3">{queueResponse.message}</p>
        </div>
      )}

      {/* Resultados do Processamento */}
      {document && (
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center space-x-3">
              {getStatusIcon(document.status)}
              <div>
                <h3 className="text-xl font-semibold text-gray-900">
                  {document.originalName}
                </h3>
                <p className="text-sm text-gray-500">
                  Status: {getStatusText(document.status)}
                </p>
              </div>
            </div>
            <div className="flex space-x-2">
              {document.status === "FAILED" && (
                <button
                  onClick={handleRetry}
                  disabled={loading}
                  className="p-2 bg-yellow-100 text-yellow-700 rounded-md hover:bg-yellow-200 disabled:opacity-50"
                >
                  <RotateCcw className="h-4 w-4" />
                </button>
              )}
              {document.status === "COMPLETED" && (
                <button
                  onClick={handleDownload}
                  className="p-2 bg-green-100 text-green-700 rounded-md hover:bg-green-200"
                >
                  <Download className="h-4 w-4" />
                </button>
              )}
            </div>
          </div>

          {/* Metadados do Documento */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            <div>
              <h4 className="font-medium text-gray-900 mb-3">
                Informações do Arquivo
              </h4>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">Tipo:</span>
                  <span className="font-medium">{document.type}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Tamanho:</span>
                  <span className="font-medium">
                    {formatFileSize(document.size)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">MIME Type:</span>
                  <span className="font-medium">{document.mimeType}</span>
                </div>
                {document.processingTime && (
                  <div className="flex justify-between">
                    <span className="text-gray-600">
                      Tempo de Processamento:
                    </span>
                    <span className="font-medium">
                      {document.processingTime}ms
                    </span>
                  </div>
                )}
              </div>
            </div>

            {/* Resultados do Processamento */}
            {document.results && (
              <div>
                <h4 className="font-medium text-gray-900 mb-3">Resultados</h4>
                <div className="space-y-2 text-sm">
                  {document.results.dimensions && (
                    <div className="flex justify-between">
                      <span className="text-gray-600">Dimensões:</span>
                      <span className="font-medium">
                        {document.results.dimensions.width} x{" "}
                        {document.results.dimensions.height}
                      </span>
                    </div>
                  )}
                  {document.results.pageCount && (
                    <div className="flex justify-between">
                      <span className="text-gray-600">Páginas:</span>
                      <span className="font-medium">
                        {document.results.pageCount}
                      </span>
                    </div>
                  )}
                  {document.results.textContent && (
                    <div>
                      <span className="text-gray-600">Conteúdo Extraído:</span>
                      <div className="mt-1 p-2 bg-gray-50 rounded text-xs max-h-20 overflow-y-auto">
                        {document.results.textContent}
                      </div>
                      <button
                        onClick={() =>
                          copyToClipboard(document.results!.textContent!)
                        }
                        className="mt-1 text-xs text-blue-600 hover:text-blue-800"
                      >
                        Copiar conteúdo
                      </button>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Erro se houver */}
          {document.error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <div className="flex items-center space-x-2 text-red-800">
                <AlertCircle className="h-5 w-5" />
                <span className="font-medium">Erro no Processamento:</span>
              </div>
              <p className="text-red-700 mt-2">{document.error}</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
