import { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import { Search, Plus, Filter, LayoutGrid, List, Sparkles, BookOpen, Pencil, Trash2, CheckCircle, Clock, AlertCircle, Bot } from "lucide-react";
import { Button } from "@/components/ui/button";
import BookCard from "@/components/BookCard";
import StatusBadge from "@/components/StatusBadge";
import { Skeleton } from "@/components/ui/skeleton";
import { bookService, authService, aiService, statsService } from "@/services/api";
import { useAuth } from "@/context/AuthContext";
import { Book, DashboardStats } from "@/types/book";
import { Link } from "react-router-dom";
import { uploadBookCover } from "@/lib/storage";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";

const genres = ["All", "Technology", "Science Fiction", "Self-Help", "History", "Design", "Psychology"];
const statuses = ["All", "available", "borrowed"];

const emptyBook = {
  title: "", author: "", genre: "", isbn: "", description: "", published_year: "", total_copies: "1"
};

const Books = () => {
  const [books, setBooks] = useState<Book[]>([]);
  const [booksLoading, setBooksLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [genreFilter, setGenreFilter] = useState("All");
  const [statusFilter, setStatusFilter] = useState("All");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [isAdmin, setIsAdmin] = useState(false);
  const [statsLoading, setStatsLoading] = useState(true);
  const [stats, setStats] = useState<DashboardStats>({
    totalBooks: 0,
    available: 0,
    borrowed: 0,
    reserved: 0,
    lost: 0,
    maintenance: 0,
    aiInsights: 0,
  });

  // Add book state
  const [addOpen, setAddOpen] = useState(false);
  const [newBook, setNewBook] = useState(emptyBook);
  const [coverFile, setCoverFile] = useState<File | null>(null);
  const [coverPreview, setCoverPreview] = useState<string>("");
  const [aiLoading, setAiLoading] = useState(false);
  const [addLoading, setAddLoading] = useState(false);

  // Edit book state
  const [editOpen, setEditOpen] = useState(false);
  const [editingBook, setEditingBook] = useState<Book | null>(null);
  const [editBook, setEditBook] = useState(emptyBook);
  const [editCoverFile, setEditCoverFile] = useState<File | null>(null);
  const [editCoverPreview, setEditCoverPreview] = useState<string>("");
  const [editLoading, setEditLoading] = useState(false);

  // Delete state
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [deleteOpen, setDeleteOpen] = useState(false);

  const { user } = useAuth();
  const location = useLocation();

  // Helper function to calculate stats from books
  const calculateStats = (booksList: Book[]) => {
    return {
      totalBooks: booksList.length,
      available: booksList.filter(b => b.status === 'available').length,
      borrowed: booksList.filter(b => b.status === 'borrowed').length,
      reserved: booksList.filter(b => b.status === 'reserved').length,
      lost: booksList.filter(b => b.status === 'lost').length,
      maintenance: booksList.filter(b => b.status === 'maintenance').length,
      aiInsights: 0,
    };
  };

  // Function to load/refresh books
  const loadBooks = async () => {
    setBooksLoading(true);
    const loadedBooks = await bookService.getAll();
    setBooks(loadedBooks);
    setStats(calculateStats(loadedBooks));
    setStatsLoading(false);
    setBooksLoading(false);
  };

  useEffect(() => {
    loadBooks();
  }, []);

  // Refresh books when navigating back to this page
  useEffect(() => {
    if (location.pathname === '/books') {
      loadBooks();
    }
  }, [location.pathname]);

  useEffect(() => {
    if (!user) return;
    authService.getProfile().then((p) => {
      const adminRole = p?.role === "admin" || p?.role === "librarian";
      setIsAdmin(adminRole);
    });
  }, [user]);

  // Cover handlers for Add
  const handleCoverChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setCoverFile(file);
      setCoverPreview(URL.createObjectURL(file));
    }
  };

  // Cover handlers for Edit
  const handleEditCoverChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setEditCoverFile(file);
      setEditCoverPreview(URL.createObjectURL(file));
    }
  };

  // AI autofill
  const handleAIFill = async () => {
    if (!newBook.title.trim()) return;
    setAiLoading(true);
    try {
      const data = await aiService.autofill(newBook.title);
      setNewBook(prev => ({
        ...prev,
        author: data.author || prev.author,
        genre: data.genre || prev.genre,
        isbn: data.isbn || prev.isbn,
        description: data.description || prev.description,
        published_year: data.published_year?.toString() || prev.published_year,
      }));
    } catch {
      console.error("AI autofill failed");
    }
    setAiLoading(false);
  };

  // Add book
  const handleAddBook = async () => {
    if (!newBook.title || !newBook.author) return;
    setAddLoading(true);
    try {
      let coverUrl = null;
      if (coverFile) coverUrl = await uploadBookCover(coverFile);

      await bookService.create({
        title: newBook.title,
        author: newBook.author,
        genre: newBook.genre,
        isbn: newBook.isbn,
        description: newBook.description,
        published_year: newBook.published_year ? parseInt(newBook.published_year) : null,
        total_copies: parseInt(newBook.total_copies) || 1,
        cover_url: coverUrl,
      });

      await loadBooks();
      setAddOpen(false);
      setNewBook(emptyBook);
      setCoverFile(null);
      setCoverPreview("");
    } catch {
      console.error("Failed to add book");
    }
    setAddLoading(false);
  };

  // Open edit dialog
  const handleEditOpen = (book: Book) => {
    setEditingBook(book);
    setEditBook({
      title: book.title,
      author: book.author,
      genre: book.genre || "",
      isbn: book.isbn || "",
      description: book.description || "",
      published_year: "",
      total_copies: "1",
    });
    setEditCoverPreview(book.coverUrl || "");
    setEditCoverFile(null);
    setEditOpen(true);
  };

  // Save edit
  const handleEditBook = async () => {
    if (!editingBook) return;
    setEditLoading(true);
    try {
      let coverUrl = editingBook.coverUrl;
      if (editCoverFile) coverUrl = await uploadBookCover(editCoverFile) || coverUrl;

      await bookService.update(editingBook.id, {
        title: editBook.title,
        author: editBook.author,
        genre: editBook.genre,
        isbn: editBook.isbn,
        description: editBook.description,
        coverUrl: coverUrl,
      });

      await loadBooks();
      setEditOpen(false);
      setEditingBook(null);
    } catch {
      console.error("Failed to edit book");
    }
    setEditLoading(false);
  };

  // Delete book
  const handleDeleteBook = async () => {
    if (!deleteId) return;
    try {
      await bookService.delete(deleteId);
      await loadBooks();
      setDeleteOpen(false);
      setDeleteId(null);
    } catch {
      console.error("Failed to delete book");
    }
  };

  const filtered = books.filter((b) => {
    const matchSearch =
      b.title.toLowerCase().includes(search.toLowerCase()) ||
      b.author.toLowerCase().includes(search.toLowerCase()) ||
      b.isbn?.includes(search);
    const matchGenre = genreFilter === "All" || b.genre === genreFilter;
    const matchStatus = statusFilter === "All" || b.status === statusFilter;
    return matchSearch && matchGenre && matchStatus;
  });

  // Reusable cover upload UI
  const CoverUpload = ({
    preview,
    onChange,
  }: {
    preview: string;
    onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  }) => (
    <div>
      <Label>Cover Image</Label>
      <div className="mt-1 flex items-center gap-4">
        {preview ? (
          <img src={preview} alt="Cover preview" className="h-20 w-14 rounded-lg object-cover border" />
        ) : (
          <div className="h-20 w-14 rounded-lg border bg-secondary/50 flex items-center justify-center">
            <BookOpen className="h-6 w-6 text-muted-foreground opacity-50" />
          </div>
        )}
        <input
          type="file"
          accept="image/*"
          onChange={onChange}
          className="text-sm text-muted-foreground file:mr-3 file:py-1.5 file:px-3 file:rounded-lg file:border file:text-xs file:font-medium file:bg-secondary file:text-secondary-foreground hover:file:bg-secondary/80 cursor-pointer"
        />
      </div>
    </div>
  );

  return (
    <div className="container py-4 px-4 sm:py-8 space-y-4 sm:space-y-6">
      {/* Admin Analytics */}
      {isAdmin && (
        <div className="grid grid-cols-1 gap-3 sm:gap-4 sm:grid-cols-3">
          {/* Total Books Card */}
          <div className="rounded-xl border bg-card p-5 card-shadow">
            <div className="flex items-center gap-3 mb-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10">
                <BookOpen className="h-5 w-5 text-primary" />
              </div>
              <span className="text-sm font-medium text-muted-foreground">Total Books</span>
            </div>
            {statsLoading ? (
              <Skeleton className="h-9 w-16 mb-1" />
            ) : (
              <p className="text-3xl font-bold text-foreground">{stats.totalBooks}</p>
            )}
            <p className="text-xs text-muted-foreground mt-1">In your library</p>
          </div>

          {/* Available Books Card */}
          <div className="rounded-xl border bg-card p-5 card-shadow">
            <div className="flex items-center gap-3 mb-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-green-500/10">
                <CheckCircle className="h-5 w-5 text-green-500" />
              </div>
              <span className="text-sm font-medium text-muted-foreground">Available</span>
            </div>
            {statsLoading ? (
              <Skeleton className="h-9 w-16 mb-1" />
            ) : (
              <p className="text-3xl font-bold text-foreground">{stats.available}</p>
            )}
            <p className="text-xs text-muted-foreground mt-1">Ready to borrow</p>
          </div>

          {/* Borrowed Books Card */}
          <div className="rounded-xl border bg-card p-5 card-shadow">
            <div className="flex items-center gap-3 mb-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-orange-500/10">
                <Clock className="h-5 w-5 text-orange-500" />
              </div>
              <span className="text-sm font-medium text-muted-foreground">Borrowed</span>
            </div>
            {statsLoading ? (
              <Skeleton className="h-9 w-16 mb-1" />
            ) : (
              <p className="text-3xl font-bold text-foreground">{stats.borrowed}</p>
            )}
            <p className="text-xs text-muted-foreground mt-1">Currently checked out</p>
          </div>
        </div>
      )}

      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground">
            {isAdmin ? "Manage Books" : "Browse Books"}
          </h1>
          {!booksLoading && <p className="mt-1 text-muted-foreground">{filtered.length} books available</p>}
        </div>
        {isAdmin ? (
          <Dialog open={addOpen} onOpenChange={setAddOpen}>
            <DialogTrigger asChild>
              <Button className="gap-2"><Plus className="h-4 w-4" /> Add Book</Button>
            </DialogTrigger>
            <DialogContent className="max-h-[90vh] overflow-y-auto">
              <DialogHeader><DialogTitle>Add New Book</DialogTitle></DialogHeader>
              <div className="space-y-4 pt-2">
                {/* Title + AI Fill */}
                <div className="flex gap-2">
                  <div className="flex-1">
                    <Label>Title</Label>
                    <Input
                      placeholder="Book title"
                      value={newBook.title}
                      onChange={(e) => setNewBook(prev => ({ ...prev, title: e.target.value }))}
                    />
                  </div>
                  <div className="flex items-end">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handleAIFill}
                      disabled={aiLoading || !newBook.title.trim()}
                      className="gap-1.5 whitespace-nowrap"
                    >
                      <Sparkles className="h-3.5 w-3.5" />
                      {aiLoading ? "Filling..." : "AI Fill"}
                    </Button>
                  </div>
                </div>
                <div>
                  <Label>Author</Label>
                  <Input placeholder="Author name" value={newBook.author} onChange={(e) => setNewBook(prev => ({ ...prev, author: e.target.value }))} />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>Genre</Label>
                    <Input placeholder="Genre" value={newBook.genre} onChange={(e) => setNewBook(prev => ({ ...prev, genre: e.target.value }))} />
                  </div>
                  <div>
                    <Label>ISBN</Label>
                    <Input placeholder="ISBN" value={newBook.isbn} onChange={(e) => setNewBook(prev => ({ ...prev, isbn: e.target.value }))} />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>Published Year</Label>
                    <Input placeholder="2024" value={newBook.published_year} onChange={(e) => setNewBook(prev => ({ ...prev, published_year: e.target.value }))} />
                  </div>
                  <div>
                    <Label>Total Copies</Label>
                    <Input placeholder="1" value={newBook.total_copies} onChange={(e) => setNewBook(prev => ({ ...prev, total_copies: e.target.value }))} />
                  </div>
                </div>
                <div>
                  <Label>Description</Label>
                  <textarea
                    className="w-full rounded-lg border bg-background px-3 py-2 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                    rows={3}
                    placeholder="Book description"
                    value={newBook.description}
                    onChange={(e) => setNewBook(prev => ({ ...prev, description: e.target.value }))}
                  />
                </div>
                <CoverUpload preview={coverPreview} onChange={handleCoverChange} />
                <Button className="w-full" onClick={handleAddBook} disabled={addLoading || !newBook.title || !newBook.author}>
                  {addLoading ? "Adding..." : "Add Book"}
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        ) : (
          <Link to="/ai-assistant">
            <Button className="gap-2">
              <Bot className="h-4 w-4" /> Ask AI for Recommendations
            </Button>
          </Link>
        )}
      </div>

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-2 sm:gap-3">
        <div className="relative flex-1 min-w-[200px] sm:min-w-[240px]">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search books..."
            className="w-full rounded-xl border bg-card py-2.5 pl-10 pr-4 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring card-shadow"
          />
        </div>
        <Select value={genreFilter} onValueChange={setGenreFilter}>
          <SelectTrigger className="w-[140px] sm:w-[160px] rounded-xl card-shadow">
            <Filter className="mr-2 h-4 w-4 text-muted-foreground" />
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {genres.map((g) => <SelectItem key={g} value={g}>{g}</SelectItem>)}
          </SelectContent>
        </Select>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-[120px] sm:w-[140px] rounded-xl card-shadow">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {statuses.map((s) => <SelectItem key={s} value={s}>{s === "All" ? "All Status" : s}</SelectItem>)}
          </SelectContent>
        </Select>
        <div className="flex rounded-xl border card-shadow">
          <button onClick={() => setViewMode("grid")} className={`rounded-l-xl p-2 sm:p-2.5 ${viewMode === "grid" ? "bg-primary/10 text-primary" : "text-muted-foreground hover:bg-secondary"}`}>
            <LayoutGrid className="h-4 w-4" />
          </button>
          <button onClick={() => setViewMode("list")} className={`rounded-r-xl p-2 sm:p-2.5 ${viewMode === "list" ? "bg-primary/10 text-primary" : "text-muted-foreground hover:bg-secondary"}`}>
            <List className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* Book Grid/List */}
      {booksLoading ? (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {[...Array(8)].map((_, i) => (
            <div key={i} className="rounded-xl border bg-card overflow-hidden card-shadow">
              <Skeleton className="h-80 sm:h-96 w-full" />
              <div className="p-4 space-y-3">
                <Skeleton className="h-5 w-3/4" />
                <Skeleton className="h-4 w-1/2" />
                <Skeleton className="h-6 w-20" />
              </div>
            </div>
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-secondary">
            <Search className="h-7 w-7 text-muted-foreground" />
          </div>
          <h3 className="text-lg font-semibold text-foreground">No books found</h3>
          <p className="mt-1 text-sm text-muted-foreground">Try adjusting your search or filters</p>
        </div>
      ) : viewMode === "grid" ? (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {filtered.map((book) => (
            <div key={book.id} className="relative group">
              <BookCard book={book} />
              {isAdmin && (
                <div className="absolute top-2 right-2 hidden group-hover:flex gap-1">
                  <button
                    onClick={(e) => { e.preventDefault(); handleEditOpen(book); }}
                    className="flex h-7 w-7 items-center justify-center rounded-lg bg-background border shadow-sm hover:bg-secondary transition-colors"
                  >
                    <Pencil className="h-3.5 w-3.5 text-muted-foreground" />
                  </button>
                  <button
                    onClick={(e) => { e.preventDefault(); setDeleteId(book.id); setDeleteOpen(true); }}
                    className="flex h-7 w-7 items-center justify-center rounded-lg bg-background border shadow-sm hover:bg-destructive/10 transition-colors"
                  >
                    <Trash2 className="h-3.5 w-3.5 text-destructive" />
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      ) : (
        <div className="rounded-xl border bg-card card-shadow overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="border-b bg-secondary/50">
                <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">Title</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">Author</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider hidden sm:table-cell">Genre</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">Status</th>
                <th className="px-4 py-3 text-right text-xs font-medium text-muted-foreground uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((book) => (
                <tr key={book.id} className="border-b last:border-0 hover:bg-secondary/30 transition-colors">
                  <td className="px-4 py-3">
                    <Link to={`/books/${book.id}`} className="font-medium text-foreground hover:text-primary">{book.title}</Link>
                  </td>
                  <td className="px-4 py-3 text-sm text-muted-foreground">{book.author}</td>
                  <td className="px-4 py-3 text-sm text-muted-foreground hidden sm:table-cell">{book.genre}</td>
                  <td className="px-4 py-3"><StatusBadge status={book.status} /></td>
                  <td className="px-4 py-3 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <Link to={`/books/${book.id}`}>
                        <Button variant="ghost" size="sm">View</Button>
                      </Link>
                      {isAdmin && (
                        <>
                          <Button variant="ghost" size="sm" onClick={() => handleEditOpen(book)}>
                            <Pencil className="h-3.5 w-3.5" />
                          </Button>
                          <Button variant="ghost" size="sm" onClick={() => { setDeleteId(book.id); setDeleteOpen(true); }}>
                            <Trash2 className="h-3.5 w-3.5 text-destructive" />
                          </Button>
                        </>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Edit Dialog */}
      <Dialog open={editOpen} onOpenChange={setEditOpen}>
        <DialogContent className="max-h-[90vh] overflow-y-auto">
          <DialogHeader><DialogTitle>Edit Book</DialogTitle></DialogHeader>
          <div className="space-y-4 pt-2">
            <div>
              <Label>Title</Label>
              <Input value={editBook.title} onChange={(e) => setEditBook(prev => ({ ...prev, title: e.target.value }))} />
            </div>
            <div>
              <Label>Author</Label>
              <Input value={editBook.author} onChange={(e) => setEditBook(prev => ({ ...prev, author: e.target.value }))} />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Genre</Label>
                <Input value={editBook.genre} onChange={(e) => setEditBook(prev => ({ ...prev, genre: e.target.value }))} />
              </div>
              <div>
                <Label>ISBN</Label>
                <Input value={editBook.isbn} onChange={(e) => setEditBook(prev => ({ ...prev, isbn: e.target.value }))} />
              </div>
            </div>
            <div>
              <Label>Description</Label>
              <textarea
                className="w-full rounded-lg border bg-background px-3 py-2 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                rows={3}
                value={editBook.description}
                onChange={(e) => setEditBook(prev => ({ ...prev, description: e.target.value }))}
              />
            </div>
            <CoverUpload preview={editCoverPreview} onChange={handleEditCoverChange} />
            <Button className="w-full" onClick={handleEditBook} disabled={editLoading}>
              {editLoading ? "Saving..." : "Save Changes"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteOpen} onOpenChange={setDeleteOpen}>
        <DialogContent>
          <DialogHeader><DialogTitle>Delete Book</DialogTitle></DialogHeader>
          <p className="text-sm text-muted-foreground">Are you sure you want to delete this book? This action cannot be undone.</p>
          <div className="flex gap-3 mt-4">
            <Button variant="outline" className="flex-1" onClick={() => setDeleteOpen(false)}>Cancel</Button>
            <Button variant="destructive" className="flex-1" onClick={handleDeleteBook}>Delete</Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Books;