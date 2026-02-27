import api from "@/lib/api";
import { Book } from "@/types/book";

function mapBookFromApi(b: {
  id: string;
  title: string;
  author: string;
  genre?: string | null;
  description?: string | null;
  isbn?: string | null;
  cover_url?: string | null;
  available_copies: number;
  created_at: string;
}): Book {
  return {
    id: b.id,
    title: b.title,
    author: b.author,
    genre: b.genre ?? "",
    description: b.description ?? "",
    isbn: b.isbn ?? "",
    status: b.available_copies > 0 ? "available" : "borrowed",
    coverUrl: b.cover_url ?? undefined,
    addedAt: b.created_at,
  };
}

interface CreateBookPayload {
  title: string;
  author: string;
  genre?: string | null;
  isbn?: string | null;
  description?: string | null;
  published_year?: number | null;
  total_copies?: number;
  cover_url?: string | null;
}

export const bookService = {
  getAll: async (): Promise<Book[]> => {
    const { data } = await api.get<unknown[]>("/api/books");
    return (data ?? []).map((b) => mapBookFromApi(b as Parameters<typeof mapBookFromApi>[0]));
  },

  getById: async (id: string): Promise<Book> => {
    const { data } = await api.get(`/api/books/${id}`);
    return mapBookFromApi(data as Parameters<typeof mapBookFromApi>[0]);
  },

  create: async (book: CreateBookPayload): Promise<Book> => {
    const { data } = await api.post("/api/books/", {
      title: book.title,
      author: book.author,
      genre: book.genre || null,
      description: book.description || null,
      isbn: book.isbn || null,
      cover_url: book.cover_url || null,
      published_year: book.published_year || null,
      total_copies: book.total_copies || 1,
    });
    return mapBookFromApi(data as Parameters<typeof mapBookFromApi>[0]);
  },

  update: async (id: string, data: Partial<Book>): Promise<Book> => {
    const payload: Record<string, unknown> = {};
    if (data.title != null) payload.title = data.title;
    if (data.author != null) payload.author = data.author;
    if (data.genre != null) payload.genre = data.genre;
    if (data.description != null) payload.description = data.description;
    if (data.isbn != null) payload.isbn = data.isbn;
    if (data.coverUrl != null) payload.cover_url = data.coverUrl;
    const { data: res } = await api.put(`/api/books/${id}`, payload);
    return mapBookFromApi(res as Parameters<typeof mapBookFromApi>[0]);
  },

  delete: async (id: string): Promise<void> => {
    await api.delete(`/api/books/${id}`);
  },

  borrow: async (id: string, userId: string, _dueDate: string): Promise<unknown> => {
    const { data } = await api.post("/api/borrowings/borrow", {
      book_id: id,
      user_id: userId,
    });
    return data;
  },

  returnBook: async (_bookId: string, borrowingId: string): Promise<unknown> => {
    const { data } = await api.put(`/api/borrowings/return/${borrowingId}`);
    return data;
  },
};