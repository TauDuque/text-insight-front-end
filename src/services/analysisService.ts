import api from "@/lib/api";
import { Analysis } from "@/types/analysis";

export class AnalysisService {
  async analyzeText(text: string): Promise<Analysis> {
    const response = await api.post(
      "/analyze",
      { text },
      {
        headers: {
          "X-API-Key": localStorage.getItem("apiKey"),
        },
      }
    );
    return response.data.data;
  }

  // Para verificar status da fila (usando API Key - sem login)
  async getAnalysisByApiKey(analysisId: string): Promise<Analysis> {
    const response = await api.get(`/analyze/${analysisId}`, {
      headers: {
        "X-API-Key": localStorage.getItem("apiKey"),
      },
    });
    return response.data.data;
  }

  // Para buscar resultado final (usando JWT - usuário logado)
  async getAnalysisByJWT(analysisId: string): Promise<Analysis> {
    const response = await api.get(`/analyze/${analysisId}`);
    return response.data.data;
  }

  // Mantém compatibilidade com código existente (polling)
  async getAnalysis(analysisId: string): Promise<Analysis> {
    return this.getAnalysisByApiKey(analysisId);
  }

  async getAnalysisHistory(page: number = 1, limit: number = 10) {
    // Esta rota requer JWT Token, não API Key
    const response = await api.get(
      `/analyze/history?page=${page}&limit=${limit}`
    );
    return response.data.data;
  }

  async deleteAnalysis(analysisId: string): Promise<void> {
    // Deletar análise requer JWT Token (usuário logado)
    // Usuário só pode deletar suas próprias análises
    await api.delete(`/analyze/${analysisId}`);
  }

  async getQueueStats() {
    // Esta rota requer JWT Token, não API Key
    const response = await api.get("/analyze/stats/queue");
    return response.data.data;
  }

  async retryAnalysis(analysisId: string): Promise<Analysis> {
    const response = await api.post(
      `/analyze/${analysisId}/retry`,
      {},
      {
        headers: {
          "X-API-Key": localStorage.getItem("apiKey"),
        },
      }
    );
    return response.data.data;
  }

  async getUserStats() {
    // Esta rota requer JWT Token, não API Key
    const response = await api.get("/analyze/stats/user");
    return response.data.data;
  }
}

export const analysisService = new AnalysisService();
