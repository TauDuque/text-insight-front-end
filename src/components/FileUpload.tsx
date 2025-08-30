"use client";

import { useState, useCallback } from "react";
import { useLanguage } from "@/contexts/LanguageContext";
import { Upload, File, X, AlertCircle, CheckCircle } from "lucide-react";

interface FileUploadProps {
  onFileSelect: (file: File) => void;
  onFileRemove: () => void;
  selectedFile: File | null;
  loading?: boolean;
  error?: string;
}

const ALLOWED_TYPES = [
  "image/jpeg",
  "image/png",
  "image/gif",
  "image/webp",
  "application/pdf",
  "text/plain",
  "application/msword",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
];

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB

export default function FileUpload({
  onFileSelect,
  onFileRemove,
  selectedFile,
  loading = false,
  error,
}: FileUploadProps) {
  const [isDragOver, setIsDragOver] = useState(false);
  const { t } = useLanguage();

  const validateFile = (file: File): string | null => {
    if (!ALLOWED_TYPES.includes(file.type)) {
      return "Tipo de arquivo não suportado. Formatos aceitos: JPG, PNG, GIF, WEBP, PDF, TXT, DOC, DOCX";
    }

    if (file.size > MAX_FILE_SIZE) {
      return `Arquivo muito grande. Máximo permitido: ${
        MAX_FILE_SIZE / (1024 * 1024)
      }MB`;
    }

    return null;
  };

  const handleFileSelect = useCallback(
    (file: File) => {
      const validationError = validateFile(file);
      if (validationError) {
        return;
      }
      onFileSelect(file);
    },
    [onFileSelect]
  );

  const handleDrop = useCallback(
    (e: React.DragEvent<HTMLDivElement>) => {
      e.preventDefault();
      setIsDragOver(false);

      const files = Array.from(e.dataTransfer.files);
      if (files.length > 0) {
        handleFileSelect(files[0]);
      }
    },
    [handleFileSelect]
  );

  const handleDragOver = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragOver(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragOver(false);
  }, []);

  const handleFileInput = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const files = Array.from(e.target.files || []);
      if (files.length > 0) {
        handleFileSelect(files[0]);
      }
    },
    [handleFileSelect]
  );

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  };

  const getFileIcon = (type: string) => {
    if (type.startsWith("image/")) return "🖼️";
    if (type === "application/pdf") return "📄";
    if (type.includes("word")) return "📝";
    if (type === "text/plain") return "📃";
    return "📁";
  };

  return (
    <div className="w-full">
      {!selectedFile ? (
        <div
          className={`relative border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
            isDragOver
              ? "border-blue-500 bg-blue-50"
              : "border-gray-300 hover:border-gray-400"
          }`}
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
        >
          <input
            type="file"
            accept={ALLOWED_TYPES.join(",")}
            onChange={handleFileInput}
            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
            disabled={loading}
          />

          <Upload className="mx-auto h-12 w-12 text-gray-400 mb-4" />
          <div className="text-lg font-medium text-gray-900 mb-2">
            {isDragOver
              ? "Solte o arquivo aqui"
              : "Clique ou arraste um arquivo"}
          </div>
          <p className="text-sm text-gray-500">
            Formatos aceitos: JPG, PNG, GIF, WEBP, PDF, TXT, DOC, DOCX
          </p>
          <p className="text-xs text-gray-400 mt-2">
            Máximo: {MAX_FILE_SIZE / (1024 * 1024)}MB
          </p>
        </div>
      ) : (
        <div className="border border-gray-200 rounded-lg p-4 bg-gray-50">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="text-2xl">{getFileIcon(selectedFile.type)}</div>
              <div>
                <div className="font-medium text-gray-900">
                  {selectedFile.name}
                </div>
                <div className="text-sm text-gray-500">
                  {formatFileSize(selectedFile.size)} • {selectedFile.type}
                </div>
              </div>
            </div>
            <button
              onClick={onFileRemove}
              disabled={loading}
              className="p-2 text-gray-400 hover:text-gray-600 disabled:opacity-50"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>
      )}

      {error && (
        <div className="mt-3 flex items-center space-x-2 text-red-600 text-sm">
          <AlertCircle className="h-4 w-4" />
          <span>{error}</span>
        </div>
      )}

      {selectedFile && !error && (
        <div className="mt-3 flex items-center space-x-2 text-green-600 text-sm">
          <CheckCircle className="h-4 w-4" />
          <span>Arquivo selecionado com sucesso</span>
        </div>
      )}
    </div>
  );
}
