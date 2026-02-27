import api from "@/lib/api";

export const aiService = {
  generateSummary: async (bookId: string): Promise<string> => {
    try {
      const { data } = await api.post<{ response: string }>("/api/ai/chat", {
        message: `Give me a brief summary of the book with id: ${bookId}`,
      });
      return data?.response ?? "";
    } catch {
      return "";
    }
  },

  askAboutBook: async (_bookId: string, question: string): Promise<string> => {
    try {
      const { data } = await api.post<{ response: string }>("/api/ai/chat", {
        message: question,
      });
      return data?.response ?? "";
    } catch {
      return "";
    }
  },

  chat: async (message: string): Promise<string> => {
    try {
      const { data } = await api.post<{ response: string }>("/api/ai/chat", { message });
      return data?.response ?? "";
    } catch {
      return "";
    }
  },

  autofill: async (title: string): Promise<{
    author?: string;
    genre?: string;
    isbn?: string;
    description?: string;
    published_year?: number;
  }> => {
    try {
      const { data } = await api.post("/api/ai/autofill", { title });
      return data ?? {};
    } catch {
      return {};
    }
  },

  getInsights: async (): Promise<string[]> => {
    try {
      const { data } = await api.get<{ insights: string | string[] }>("/api/ai/insights");
      const insights = data?.insights;

      if (Array.isArray(insights)) {
        return insights;
      }

      if (typeof insights === "string") {
        return insights
          .split(/\n+/)
          .map((line) => line.replace(/^[\s\-•]+/, "").trim())
          .filter(Boolean);
      }

      return [];
    } catch {
      return [];
    }
  },
};