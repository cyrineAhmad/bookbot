import api from "@/lib/api";
import { User } from "@/types/book";

export const authService = {
  getCurrentUser: async (): Promise<User | null> => {
    try {
      const { data } = await api.get<{ id: string; email: string | null }>("/api/auth/me");
      return {
        id: data.id,
        name: "",
        email: data.email ?? "",
        role: "member",
      };
    } catch {
      return null;
    }
  },

  getProfile: async (): Promise<{
    id: string;
    email: string | null;
    full_name: string | null;
    role: string;
  } | null> => {
    try {
      const { data } = await api.get("/api/auth/profile");
      return data;
    } catch {
      return null;
    }
  },
};
