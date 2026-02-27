// src/types/book.ts

export type BookStatus = "available" | "borrowed" | "reserved" | "lost" | "maintenance";
export type UserRole = "admin" | "member";

export interface Book {
  id: string;
  title: string;
  author: string;
  genre: string;
  description: string;
  isbn: string;
  status: BookStatus;
  coverUrl?: string;
  borrowedBy?: string;    // user id
  dueDate?: string;       // ISO string
  addedAt: string;        // ISO string
  metadata?: Record<string, string>; // optional extra info (language, pages, publisher)
}

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  avatar?: string;
}

export interface ChatMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: string;
}

export interface DashboardStats {
  totalBooks: number;
  available: number;
  borrowed: number;
  reserved: number;
  lost: number;
  maintenance: number;
  aiInsights: number;
}