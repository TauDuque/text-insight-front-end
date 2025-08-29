import api from "@/lib/api";
import { Analysis, QueueResponse } from "@/types/analysis";

export class AnalysisService {
  // ✅ NOVO: Análise de texto SEMPRE retorna QueueResponse
  async analyzeText(text: string): Promise<QueueResponse> {
    const response = await api.post("/analyze", { text });
    return response.data.data;
  }

  // ✅ NOVO: Buscar análise por ID da fila
  async getAnalysisByQueueId(queueId: string): Promise<Analysis> {
    const response = await api.get(`/analyze/${queueId}`);
    return response.data.data;
  }

  // ✅ REMOVIDO: getAnalysisByApiKey (não mais necessário)
  // async getAnalysisByApiKey(analysisId: string): Promise<Analysis> { ... }

  // ✅ ATUALIZADO: Para buscar resultado final (usuário logado)
  async getAnalysisByJWT(analysisId: string): Promise<Analysis> {
    const response = await api.get(`/analyze/${analysisId}`);
    return response.data.data;
  }

  // ✅ MANTIDO: Compatibilidade com código existente
  async getAnalysis(analysisId: string): Promise<Analysis> {
    return this.getAnalysisByJWT(analysisId);
  }

  // ✅ MANTIDO: Histórico do usuário (usuário logado)
  async getAnalysisHistory(page: number = 1, limit: number = 10) {
    const response = await api.get(
      `/analyze/history?page=${page}&limit=${limit}`
    );
    return response.data.data;
  }

  // ✅ MANTIDO: Deletar análise (usuário logado)
  async deleteAnalysis(analysisId: string): Promise<void> {
    await api.delete(`/analyze/${analysisId}`);
  }

  // ✅ MANTIDO: Estatísticas da fila (usuário logado)
  async getQueueStats() {
    const response = await api.get("/analyze/stats/queue");
    return response.data.data;
  }

  // ✅ MANTIDO: Reprocessar análise (usuário logado)
  async retryAnalysis(analysisId: string): Promise<Analysis> {
    const response = await api.post(`/analyze/${analysisId}/retry`, {});
    return response.data.data;
  }

  // ✅ MANTIDO: Estatísticas do usuário (usuário logado)
  async getUserStats() {
    const response = await api.get("/analyze/stats/user");
    return response.data.data;
  }
}

export const analysisService = new AnalysisService();
