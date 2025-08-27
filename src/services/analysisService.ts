import api from "@/lib/api";
import { Analysis } from "@/types/analysis";

export class AnalysisService {
  // Análise de texto (usuário logado)
  async analyzeText(text: string): Promise<Analysis> {
    const response = await api.post("/analyze", { text });
    return response.data.data;
  }

  // Para verificar status da fila (usando API Key - sem login)
  // Esta função é para casos externos, não para o frontend
  async getAnalysisByApiKey(analysisId: string): Promise<Analysis> {
    const response = await api.get(`/analyze/${analysisId}`, {
      headers: {
        "X-API-Key": localStorage.getItem("apiKey"),
      },
    });
    return response.data.data;
  }

  // Para buscar resultado final (usuário logado)
  async getAnalysisByJWT(analysisId: string): Promise<Analysis> {
    const response = await api.get(`/analyze/${analysisId}`);
    return response.data.data;
  }

  // Mantém compatibilidade com código existente (polling)
  async getAnalysis(analysisId: string): Promise<Analysis> {
    return this.getAnalysisByJWT(analysisId); // Agora usa JWT
  }

  // Histórico do usuário (usuário logado)
  async getAnalysisHistory(page: number = 1, limit: number = 10) {
    const response = await api.get(
      `/analyze/history?page=${page}&limit=${limit}`
    );
    return response.data.data;
  }

  // Deletar análise (usuário logado)
  async deleteAnalysis(analysisId: string): Promise<void> {
    await api.delete(`/analyze/${analysisId}`);
  }

  // Estatísticas da fila (usuário logado)
  async getQueueStats() {
    const response = await api.get("/analyze/stats/queue");
    return response.data.data;
  }

  // Reprocessar análise (usuário logado)
  async retryAnalysis(analysisId: string): Promise<Analysis> {
    const response = await api.post(`/analyze/${analysisId}/retry`, {});
    return response.data.data;
  }

  // Estatísticas do usuário (usuário logado)
  async getUserStats() {
    const response = await api.get("/analyze/stats/user");
    return response.data.data;
  }
}

export const analysisService = new AnalysisService();
