"use client";

import { useAuth } from "@/contexts/AuthContext";
import { useAuthGuard } from "@/hooks/useAuthGuard";
import { useLanguage } from "@/contexts/LanguageContext";
import Layout from "@/components/Layout";
import Loading from "@/components/Loading";
import { Clock, FileText, CheckCircle, XCircle, Download } from "lucide-react";
import { useState, useEffect } from "react";
import { documentService } from "@/services/documentService";
import { Document } from "@/types/document";

interface DocumentHistory {
  id: string;
  originalName: string;
  status: string;
  createdAt: string;
  completedAt?: string;
  size: number;
  type: string;
}

export default function HistoryPage() {
  const { isAuthenticated, loading } = useAuthGuard();
  const { t } = useLanguage();
  const [documents, setDocuments] = useState<DocumentHistory[]>([]);
  const [loadingHistory, setLoadingHistory] = useState(true);

  useEffect(() => {
    const loadDocuments = async () => {
      try {
        setLoadingHistory(true);
        const response = await documentService.getUserDocuments(1, 1000);
        const documents = response.documents || [];

        // Converter para o formato DocumentHistory
        const historyDocuments: DocumentHistory[] = documents.map(
          (doc: Document) => ({
            id: doc.id,
            originalName: doc.originalName,
            status: doc.status,
            createdAt: doc.createdAt,
            completedAt: doc.completedAt,
            size: doc.size,
            type: doc.mimeType,
          })
        );

        setDocuments(historyDocuments);
      } catch (error) {
        console.error("Erro ao carregar histórico:", error);
        setDocuments([]);
      } finally {
        setLoadingHistory(false);
      }
    };

    loadDocuments();
  }, []);

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "PENDING":
        return <Clock className="h-5 w-5 text-yellow-500" />;
      case "PROCESSING":
        return <Clock className="h-5 w-5 text-blue-500 animate-pulse" />;
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
        return t("document.status.pending");
      case "PROCESSING":
        return t("document.status.processing");
      case "COMPLETED":
        return t("document.status.completed");
      case "FAILED":
        return t("document.status.failed");
      default:
        return t("document.status.unknown");
    }
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  };

  const formatDate = (dateString: string): string => {
    return new Date(dateString).toLocaleDateString("pt-BR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const handleDownload = async (documentId: string) => {
    try {
      await documentService.downloadDocument(documentId);
    } catch (error) {
      console.error("Erro ao baixar documento:", error);
      // TODO: Mostrar mensagem de erro usando o ToastContext
    }
  };

  if (loading) return <Loading />;
  if (!isAuthenticated) return null;

  return (
    <Layout>
      <div className="py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900">
              {t("history.title")}
            </h1>
            <p className="mt-2 text-gray-600">{t("history.subtitle")}</p>
          </div>

          {/* History Content */}
          <div className="bg-white shadow rounded-lg">
            {loadingHistory ? (
              <div className="p-8 text-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
                <p className="mt-4 text-gray-600">{t("global.loading")}</p>
              </div>
            ) : documents.length === 0 ? (
              <div className="p-8 text-center">
                <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  {t("history.noDocuments")}
                </h3>
                <p className="text-gray-600">
                  {t("history.noDocumentsSubtitle")}
                </p>
              </div>
            ) : (
              <div className="overflow-hidden">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        {t("history.table.document")}
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        {t("history.table.status")}
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        {t("history.table.size")}
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        {t("history.table.created")}
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        {t("history.table.completed")}
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        {t("history.table.actions")}
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {documents.map((doc) => (
                      <tr key={doc.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <FileText className="h-5 w-5 text-gray-400 mr-3" />
                            <div>
                              <div className="text-sm font-medium text-gray-900">
                                {doc.originalName}
                              </div>
                              <div className="text-sm text-gray-500">
                                {doc.type}
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            {getStatusIcon(doc.status)}
                            <span className="ml-2 text-sm text-gray-900">
                              {getStatusText(doc.status)}
                            </span>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {formatFileSize(doc.size)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {formatDate(doc.createdAt)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {doc.completedAt ? formatDate(doc.completedAt) : "-"}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          {doc.status === "COMPLETED" && (
                            <button
                              onClick={() => handleDownload(doc.id)}
                              className="text-indigo-600 hover:text-indigo-900"
                              title={t("document.download")}
                            >
                              <Download className="h-4 w-4" />
                            </button>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </div>
    </Layout>
  );
}
