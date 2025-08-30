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
    return response.data.data;
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
  async downloadDocument(
    documentId: string
  ): Promise<{ filename: string; path: string }> {
    const response = await api.get(`/documents/${documentId}/download`);
    return response.data.data;
  }

  /**
   * Buscar documento por ID da fila (para polling)
   */
  async getDocumentByQueueId(queueId: string): Promise<Document> {
    // Como não temos endpoint direto por queueId, vamos buscar por status
    // e filtrar pelo jobId que contém o queueId
    const response = await api.get("/documents");
    const documents = response.data.data.documents;

    const document = documents.find((doc: Document) => doc.jobId === queueId);

    if (!document) {
      throw new Error("Documento não encontrado");
    }

    return document;
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
