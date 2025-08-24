"use client";

import { useState, useEffect, useCallback } from "react";
import { useLanguage } from "@/contexts/LanguageContext";
import { useAuthGuard } from "@/hooks/useAuthGuard";
import Layout from "@/components/Layout";
import Loading from "@/components/Loading";
import {
  Key,
  Plus,
  Copy,
  Trash2,
  Eye,
  EyeOff,
  Calendar,
  Shield,
} from "lucide-react";
import { useToastContext } from "@/contexts/ToastContext";
import api from "@/lib/api";

interface ApiKey {
  id: string;
  key: string;
  name: string;
  isActive: boolean;
  createdAt: string;
}

export default function ApiKeysPage() {
  const [apiKeys, setApiKeys] = useState<ApiKey[]>([]);
  const [loading, setLoading] = useState(true);
  const [showNewKeyModal, setShowNewKeyModal] = useState(false);
  const [newKeyName, setNewKeyName] = useState("");
  const [creating, setCreating] = useState(false);
  const [visibleKeys, setVisibleKeys] = useState<Set<string>>(new Set());

  const { isAuthenticated } = useAuthGuard();
  const { showSuccess, showError } = useToastContext();
  const { t } = useLanguage();

  const loadApiKeys = useCallback(async () => {
    try {
      setLoading(true);
      const response = await api.get("/auth/api-keys");
      setApiKeys(response.data.data);
    } catch (error) {
      console.error("Erro ao carregar API Keys:", error);
      showError(t("apiKeys.loadError"));
    } finally {
      setLoading(false);
    }
  }, [showError, t]);

  useEffect(() => {
    if (isAuthenticated) {
      loadApiKeys();
    }
  }, [isAuthenticated, loadApiKeys]);

  const handleCreateApiKey = async () => {
    if (!newKeyName.trim()) {
      showError(t("apiKeys.nameRequired"));
      return;
    }

    setCreating(true);
    try {
      await api.post("/auth/api-keys", { name: newKeyName });
      await loadApiKeys();
      setShowNewKeyModal(false);
      setNewKeyName("");
      showSuccess(t("apiKeys.createSuccess"));
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error ? error.message : t("apiKeys.createError");
      if (typeof error === "object" && error !== null && "response" in error) {
        const response = (
          error as { response?: { data?: { message?: string } } }
        ).response;
        showError(response?.data?.message || errorMessage);
      } else {
        showError(errorMessage);
      }
    } finally {
      setCreating(false);
    }
  };

  const handleRevokeApiKey = async (keyId: string, keyName: string) => {
    if (confirm(t("apiKeys.confirmRevoke", { name: keyName }))) {
      try {
        await api.delete(`/auth/api-keys/${keyId}`);
        await loadApiKeys();
        showSuccess(t("apiKeys.revokeSuccess"));
      } catch (error: unknown) {
        const errorMessage =
          error instanceof Error ? error.message : t("apiKeys.revokeError");
        if (
          typeof error === "object" &&
          error !== null &&
          "response" in error
        ) {
          const response = (
            error as { response?: { data?: { message?: string } } }
          ).response;
          showError(response?.data?.message || errorMessage);
        } else {
          showError(errorMessage);
        }
      }
    }
  };

  const copyToClipboard = (key: string) => {
    navigator.clipboard
      .writeText(key)
      .then(() => {
        showSuccess(t("apiKeys.copySuccess"));
      })
      .catch(() => {
        showError(t("apiKeys.copyError"));
      });
  };

  const toggleKeyVisibility = (keyId: string) => {
    const newVisibleKeys = new Set(visibleKeys);
    if (newVisibleKeys.has(keyId)) {
      newVisibleKeys.delete(keyId);
    } else {
      newVisibleKeys.add(keyId);
    }
    setVisibleKeys(newVisibleKeys);
  };

  const maskKey = (key: string) => {
    return `${key.substring(0, 8)}${"*".repeat(24)}${key.substring(
      key.length - 4
    )}`;
  };

  if (!isAuthenticated) return null;

  return (
    <Layout>
      <div className="py-8">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Header */}
          <div className="flex justify-between items-center mb-6">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                {t("apiKeys.manage")}
              </h1>
              <p className="text-gray-600">{t("apiKeys.subtitle")}</p>
            </div>
            <button
              onClick={() => setShowNewKeyModal(true)}
              className="flex items-center px-4 py-2 text-sm font-medium text-white bg-indigo-600 rounded-md hover:bg-indigo-700"
            >
              <Plus className="h-4 w-4 mr-2" />
              {t("apiKeys.create")}
            </button>
          </div>

          {/* Info Card */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
            <div className="flex items-start">
              <Shield className="h-5 w-5 text-blue-600 mt-0.5 mr-3" />
              <div>
                <h3 className="text-sm font-medium text-blue-900">
                  {t("apiKeys.importantInfo")}
                </h3>
                <div className="mt-2 text-sm text-blue-700">
                  <ul className="list-disc list-inside space-y-1">
                    <li>
                      {t("apiKeys.headerInfo")}{" "}
                      <code className="bg-blue-100 px-1 rounded">
                        X-API-Key
                      </code>{" "}
                      {t("apiKeys.authenticationInfo")}
                    </li>
                    <li>{t("apiKeys.securityTip")}</li>
                    <li>{t("apiKeys.revokeTip")}</li>
                    <li>{t("apiKeys.irreversibleTip")}</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>

          {/* API Keys List */}
          {loading ? (
            <Loading />
          ) : apiKeys.length === 0 ? (
            <div className="bg-white rounded-lg shadow-sm p-8 text-center">
              <Key className="h-12 w-12 mx-auto mb-4 text-gray-300" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                {t("apiKeys.noKeys")}
              </h3>
              <p className="text-gray-600 mb-4">
                {t("apiKeys.createFirstKey")}
              </p>
              <button
                onClick={() => setShowNewKeyModal(true)}
                className="inline-flex items-center px-4 py-2 text-sm font-medium text-white bg-indigo-600 rounded-md hover:bg-indigo-700"
              >
                <Plus className="h-4 w-4 mr-2" />
                {t("apiKeys.create")}
              </button>
            </div>
          ) : (
            <div className="bg-white shadow-sm rounded-lg overflow-hidden">
              <div className="divide-y divide-gray-200">
                {apiKeys.map((apiKey) => (
                  <div key={apiKey.id} className="p-6">
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <div className="flex items-center">
                          <h3 className="text-lg font-medium text-gray-900">
                            {apiKey.name}
                          </h3>
                          <span
                            className={`ml-3 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                              apiKey.isActive
                                ? "bg-green-100 text-green-800"
                                : "bg-red-100 text-red-800"
                            }`}
                          >
                            {apiKey.isActive
                              ? t("apiKeys.active")
                              : t("apiKeys.revoked")}
                          </span>
                        </div>

                        <div className="mt-2 flex items-center text-sm text-gray-500">
                          <Calendar className="h-4 w-4 mr-1" />
                          {t("apiKeys.createdAt")}{" "}
                          {new Date(apiKey.createdAt).toLocaleDateString(
                            "pt-BR"
                          )}
                        </div>

                        <div className="mt-3">
                          <div className="flex items-center space-x-2">
                            <code className="flex-1 px-3 py-2 bg-gray-50 border border-gray-200 rounded-md text-sm font-mono">
                              {visibleKeys.has(apiKey.id)
                                ? apiKey.key
                                : maskKey(apiKey.key)}
                            </code>
                            <button
                              onClick={() => toggleKeyVisibility(apiKey.id)}
                              className="p-2 text-gray-400 hover:text-gray-600"
                              title={
                                visibleKeys.has(apiKey.id)
                                  ? t("global.hide")
                                  : t("global.show")
                              }
                            >
                              {visibleKeys.has(apiKey.id) ? (
                                <EyeOff className="h-4 w-4" />
                              ) : (
                                <Eye className="h-4 w-4" />
                              )}
                            </button>
                            <button
                              onClick={() => copyToClipboard(apiKey.key)}
                              className="p-2 text-gray-400 hover:text-gray-600"
                              title={t("apiKeys.copy")}
                            >
                              <Copy className="h-4 w-4" />
                            </button>
                          </div>
                        </div>
                      </div>

                      {apiKey.isActive && (
                        <div className="ml-6">
                          <button
                            onClick={() =>
                              handleRevokeApiKey(apiKey.id, apiKey.name)
                            }
                            className="flex items-center px-3 py-2 text-sm font-medium text-red-600 bg-red-50 rounded-md hover:bg-red-100"
                          >
                            <Trash2 className="h-4 w-4 mr-1" />
                            {t("apiKeys.revoke")}
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* New API Key Modal */}
      {showNewKeyModal && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
            <div className="mt-3">
              <h3 className="text-lg font-medium text-gray-900 mb-4">
                {t("apiKeys.createNew")}
              </h3>

              <div className="mb-4">
                <label
                  htmlFor="keyName"
                  className="block text-sm font-medium text-gray-700 mb-2"
                >
                  {t("apiKeys.name")}
                </label>
                <input
                  type="text"
                  id="keyName"
                  value={newKeyName}
                  onChange={(e) => setNewKeyName(e.target.value)}
                  placeholder={t("apiKeys.namePlaceholder")}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                />
              </div>

              <div className="flex justify-end space-x-3">
                <button
                  onClick={() => {
                    setShowNewKeyModal(false);
                    setNewKeyName("");
                  }}
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200"
                >
                  {t("global.cancel")}
                </button>
                <button
                  onClick={handleCreateApiKey}
                  disabled={creating || !newKeyName.trim()}
                  className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 rounded-md hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {creating ? t("apiKeys.creating") : t("apiKeys.create")}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </Layout>
  );
}
