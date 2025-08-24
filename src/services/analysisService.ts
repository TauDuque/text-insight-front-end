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

  async getAnalysis(analysisId: string): Promise<Analysis> {
    const response = await api.get(`/analyze/${analysisId}`, {
      headers: {
        "X-API-Key": localStorage.getItem("apiKey"),
      },
    });
    return response.data.data;
  }

  async getAnalysisHistory(page: number = 1, limit: number = 10) {
    const response = await api.get(
      `/analyze/history?page=${page}&limit=${limit}`,
      {
        headers: {
          "X-API-Key": localStorage.getItem("apiKey"),
        },
      }
    );
    return response.data.data;
  }

  async deleteAnalysis(analysisId: string): Promise<void> {
    await api.delete(`/analyze/${analysisId}`, {
      headers: {
        "X-API-Key": localStorage.getItem("apiKey"),
      },
    });
  }

  async getQueueStats() {
    const response = await api.get("/analyze/stats/queue", {
      headers: {
        "X-API-Key": localStorage.getItem("apiKey"),
      },
    });
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
    const response = await api.get("/analyze/stats/user", {
      headers: {
        "X-API-Key": localStorage.getItem("apiKey"),
      },
    });
    return response.data.data;
  }
}

export const analysisService = new AnalysisService();
