import api from "@/lib/api";
import { Document, QueueResponse } from "@/types/document";

export class DocumentService {
  /**
   * Upload de documento para processamento
   */
  async uploadDocument(file: File): Promise<QueueResponse> {
    const formData = new FormData();
    formData.append("document", file);

    const response = await api.post("/documents/upload", formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
    return response.data;
  }

  /**
   * Obter status de um documento
   */
  async getDocumentStatus(documentId: string): Promise<Document> {
    const response = await api.get(`/documents/${documentId}/status`);
    return response.data.data;
  }

  /**
   * Listar documentos do usuário
   */
  async getUserDocuments(
    page: number = 1,
    limit: number = 10,
    status?: string
  ) {
    const params = new URLSearchParams({
      page: page.toString(),
      limit: limit.toString(),
    });

    if (status) {
      params.append("status", status);
    }

    const response = await api.get(`/documents?${params.toString()}`);
    return response.data.data;
  }

  /**
   * Download de documento processado
   */
  async downloadDocument(documentId: string): Promise<void> {
    const response = await api.get(`/documents/${documentId}/download`, {
      responseType: "blob",
    });

    // Criar URL do blob e iniciar download
    const url = window.URL.createObjectURL(new Blob([response.data]));
    const link = document.createElement("a");
    link.href = url;

    // Pegar nome do arquivo do header Content-Disposition
    const contentDisposition = response.headers["content-disposition"];
    const filenameMatch = contentDisposition?.match(/filename="(.+)"/);
    const filename = filenameMatch
      ? decodeURIComponent(filenameMatch[1])
      : "document";

    link.setAttribute("download", filename);
    document.body.appendChild(link);
    link.click();
    link.remove();
    window.URL.revokeObjectURL(url);
  }

  /**
   * Buscar documento por ID da fila (para polling)
   */
  async getDocumentByQueueId(queueId: string): Promise<Document> {
    const response = await api.get(`/documents/job/${queueId}`);
    return response.data.data;
  }

  /**
   * Deletar documento
   */
  async deleteDocument(documentId: string): Promise<void> {
    await api.delete(`/documents/${documentId}`);
  }

  /**
   * Reprocessar documento
   */
  async retryDocument(documentId: string): Promise<Document> {
    const response = await api.post(`/documents/${documentId}/retry`, {});
    return response.data.data;
  }
}

export const documentService = new DocumentService();
