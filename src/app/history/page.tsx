"use client";

import { useState, useEffect, useCallback } from "react";
import { useLanguage } from "@/contexts/LanguageContext";
import { analysisService } from "@/services/analysisService";
import { AnalysisHistory } from "@/types/analysis";
import { useAuthGuard } from "@/hooks/useAuthGuard";
import Layout from "@/components/Layout";
import Loading from "@/components/Loading";
import {
  Clock,
  CheckCircle,
  XCircle,
  Eye,
  Trash2,
  Search,
  Filter,
  RefreshCw,
} from "lucide-react";
import { useToastContext } from "@/contexts/ToastContext";
import Link from "next/link";

export default function HistoryPage() {
  const [analyses, setAnalyses] = useState<AnalysisHistory[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [refreshing, setRefreshing] = useState(false);

  const { isAuthenticated } = useAuthGuard();
  const { showSuccess, showError } = useToastContext();
  const { t } = useLanguage();

  const loadHistory = useCallback(async () => {
    try {
      setLoading(true);
      const result = await analysisService.getAnalysisHistory(page, 10);
      setAnalyses(result.analyses);
      setTotalPages(result.pagination.pages);
    } catch (error) {
      console.error("Erro ao carregar histórico:", error);
      showError(t("history.loadError"));
    } finally {
      setLoading(false);
    }
  }, [page, showError, t]);

  useEffect(() => {
    if (isAuthenticated) {
      loadHistory();
    }
  }, [isAuthenticated, page, loadHistory]);

  const handleRefresh = async () => {
    setRefreshing(true);
    await loadHistory();
    setRefreshing(false);
    showSuccess(t("history.refreshSuccess"));
  };

  const handleDelete = async (id: string) => {
    if (confirm(t("history.deleteMessage"))) {
      try {
        await analysisService.deleteAnalysis(id);
        await loadHistory();
        showSuccess(t("history.deleteSuccess"));
      } catch (error) {
        console.error("Erro ao excluir análise:", error);
        showError(t("history.deleteError"));
      }
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "COMPLETED":
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case "FAILED":
        return <XCircle className="h-4 w-4 text-red-500" />;
      case "PENDING":
      case "PROCESSING":
        return <Clock className="h-4 w-4 text-yellow-500" />;
      default:
        return <Clock className="h-4 w-4 text-gray-500" />;
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case "COMPLETED":
        return t("status.completed");
      case "FAILED":
        return t("status.failed");
      case "PENDING":
        return t("status.pending");
      case "PROCESSING":
        return t("status.processing");
      default:
        return status;
    }
  };

  const filteredAnalyses = analyses.filter((analysis) => {
    const matchesSearch = analysis.textPreview
      .toLowerCase()
      .includes(searchTerm.toLowerCase());
    const matchesStatus =
      statusFilter === "all" || analysis.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  if (!isAuthenticated) return null;

  return (
    <Layout>
      <div className="py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Header */}
          <div className="flex justify-between items-center mb-6">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                {t("history.title")}
              </h1>
              <p className="text-gray-600">{t("history.subtitle")}</p>
            </div>
            <button
              onClick={handleRefresh}
              disabled={refreshing}
              className="flex items-center px-4 py-2 text-sm font-medium text-indigo-600 bg-indigo-50 rounded-md hover:bg-indigo-100 disabled:opacity-50"
            >
              <RefreshCw
                className={`h-4 w-4 mr-2 ${refreshing ? "animate-spin" : ""}`}
              />
              {t("global.refresh")}
            </button>
          </div>

          {/* Filters */}
          <div className="bg-white rounded-lg shadow-sm p-4 mb-6">
            <div className="flex flex-col sm:flex-row gap-4">
              {/* Search */}
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <input
                    type="text"
                    placeholder={t("history.searchPlaceholder")}
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                  />
                </div>
              </div>

              {/* Status Filter */}
              <div className="sm:w-48">
                <div className="relative">
                  <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <select
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                  >
                    <option value="all">{t("history.allStatuses")}</option>
                    <option value="COMPLETED">{t("status.completed")}</option>
                    <option value="PENDING">{t("status.pending")}</option>
                    <option value="PROCESSING">{t("status.processing")}</option>
                    <option value="FAILED">{t("status.failed")}</option>
                  </select>
                </div>
              </div>
            </div>
          </div>

          {/* Content */}
          {loading ? (
            <Loading />
          ) : filteredAnalyses.length === 0 ? (
            <div className="bg-white rounded-lg shadow-sm p-8 text-center">
              <div className="text-gray-500">
                {analyses.length === 0 ? (
                  <>
                    <Clock className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                    <h3 className="text-lg font-medium mb-2">
                      {t("history.noAnalyses")}
                    </h3>
                    <p>{t("history.startAnalyzing")}</p>
                    <Link
                      href="/dashboard"
                      className="inline-flex items-center mt-4 px-4 py-2 text-sm font-medium text-white bg-indigo-600 rounded-md hover:bg-indigo-700"
                    >
                      {t("dashboard.startAnalyzing")}
                    </Link>
                  </>
                ) : (
                  <>
                    <Search className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                    <h3 className="text-lg font-medium mb-2">
                      {t("global.noResults")}
                    </h3>
                    <p>{t("history.adjustFilters")}</p>
                  </>
                )}
              </div>
            </div>
          ) : (
            <div className="bg-white shadow-sm rounded-lg overflow-hidden">
              {/* Table Header */}
              <div className="bg-gray-50 px-6 py-3 border-b border-gray-200">
                <div className="grid grid-cols-12 gap-4 text-xs font-medium text-gray-500 uppercase tracking-wider">
                  <div className="col-span-5">{t("history.content")}</div>
                  <div className="col-span-2">{t("history.status")}</div>
                  <div className="col-span-2">{t("history.date")}</div>
                  <div className="col-span-2">
                    {t("history.processingTime")}
                  </div>
                  <div className="col-span-1">{t("history.actions")}</div>
                </div>
              </div>

              {/* Table Body */}
              <div className="divide-y divide-gray-200">
                {filteredAnalyses.map((analysis) => (
                  <div key={analysis.id} className="px-6 py-4 hover:bg-gray-50">
                    <div className="grid grid-cols-12 gap-4 items-center">
                      {/* Content */}
                      <div className="col-span-5">
                        <p className="text-sm text-gray-900 truncate">
                          {analysis.textPreview}
                        </p>
                      </div>

                      {/* Status */}
                      <div className="col-span-2">
                        <div className="flex items-center">
                          {getStatusIcon(analysis.status)}
                          <span className="ml-2 text-sm text-gray-900">
                            {getStatusText(analysis.status)}
                          </span>
                        </div>
                        {analysis.error && (
                          <p className="text-xs text-red-600 mt-1 truncate">
                            {analysis.error}
                          </p>
                        )}
                      </div>

                      {/* Date */}
                      <div className="col-span-2">
                        <div className="text-sm text-gray-900">
                          {new Date(analysis.createdAt).toLocaleDateString(
                            "pt-BR"
                          )}
                        </div>
                        <div className="text-xs text-gray-500">
                          {new Date(analysis.createdAt).toLocaleTimeString(
                            "pt-BR"
                          )}
                        </div>
                      </div>

                      {/* Processing Time */}
                      <div className="col-span-2">
                        {analysis.processingTime ? (
                          <span className="text-sm text-gray-900">
                            {analysis.processingTime}ms
                          </span>
                        ) : (
                          <span className="text-sm text-gray-500">-</span>
                        )}
                      </div>

                      {/* Actions */}
                      <div className="col-span-1">
                        <div className="flex items-center space-x-2">
                          {analysis.status === "COMPLETED" && (
                            <Link
                              href={`/analysis/${analysis.id}`}
                              className="text-indigo-600 hover:text-indigo-900"
                              title={t("history.view")}
                            >
                              <Eye className="h-4 w-4" />
                            </Link>
                          )}
                          <button
                            onClick={() => handleDelete(analysis.id)}
                            className="text-red-600 hover:text-red-900"
                            title={t("history.delete")}
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Pagination */}
              <div className="bg-white px-4 py-3 border-t border-gray-200 sm:px-6">
                <div className="flex items-center justify-between">
                  <div className="flex-1 flex justify-between sm:hidden">
                    <button
                      onClick={() => setPage((p) => Math.max(1, p - 1))}
                      disabled={page === 1}
                      className="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {t("global.previous")}
                    </button>
                    <button
                      onClick={() =>
                        setPage((p) => Math.min(totalPages, p + 1))
                      }
                      disabled={page === totalPages}
                      className="ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:cursor-not-allowed"
                    >
                      {t("global.next")}
                    </button>
                  </div>
                  <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
                    <div>
                      <p className="text-sm text-gray-700">
                        {t("global.page")}{" "}
                        <span className="font-medium">{page}</span>{" "}
                        {t("global.of")}{" "}
                        <span className="font-medium">{totalPages}</span>
                      </p>
                    </div>
                    <div>
                      <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px">
                        <button
                          onClick={() => setPage((p) => Math.max(1, p - 1))}
                          disabled={page === 1}
                          className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          {t("global.previous")}
                        </button>
                        <button
                          onClick={() =>
                            setPage((p) => Math.min(totalPages, p + 1))
                          }
                          disabled={page === totalPages}
                          className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:cursor-not-allowed"
                        >
                          {t("global.next")}
                        </button>
                      </nav>
                    </div>
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
