import api from "@/lib/api";
import { DashboardStats } from "@/types/book";

const defaultStats: DashboardStats = {
  totalBooks: 0,
  available: 0,
  borrowed: 0,
  reserved: 0,
  lost: 0,
  maintenance: 0,
  aiInsights: 0,
};

export const statsService = {
  getDashboardStats: async (): Promise<DashboardStats> => {
    try {
      const { data } = await api.get<DashboardStats>("/api/dashboard");
      return data ?? defaultStats;
    } catch {
      return defaultStats;
    }
  },
};
