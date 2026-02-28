import { useEffect, useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { ArrowLeft, BookOpen, Sparkles, MessageSquare, Calendar, Hash, Tag, Pencil, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import StatusBadge from "@/components/StatusBadge";
import { bookService, aiService, authService } from "@/services/api";
import { useAuth } from "@/context/AuthContext";
import { Book } from "@/types/book";
import { uploadBookCover } from "@/lib/storage";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import api from "@/lib/api";

const BookDetails = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [book, setBook] = useState<Book | null>(null);
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  const [userId, setUserId] = useState<string>("");

  // AI state
  const [summary, setSummary] = useState("");
  const [aiAnswer, setAiAnswer] = useState("");
  const [question, setQuestion] = useState("");
  const [loadingSummary, setLoadingSummary] = useState(false);
  const [loadingAsk, setLoadingAsk] = useState(false);

  // Borrow state
  const [borrowOpen, setBorrowOpen] = useState(false);
  const [borrowLoading, setBorrowLoading] = useState(false);
  const [returnLoading, setReturnLoading] = useState(false);
  const [activeBorrowingId, setActiveBorrowingId] = useState<string>("");
  const [dueDate, setDueDate] = useState<string>("");
  const [daysLeft, setDaysLeft] = useState<number | null>(null);

  // Edit state
  const [editOpen, setEditOpen] = useState(false);
  const [editBook, setEditBook] = useState({ title: "", author: "", genre: "", isbn: "", description: "" });
  const [editCoverFile, setEditCoverFile] = useState<File | null>(null);
  const [editCoverPreview, setEditCoverPreview] = useState<string>("");
  const [editLoading, setEditLoading] = useState(false);

  // Delete state
  const [deleteOpen, setDeleteOpen] = useState(false);

  useEffect(() => {
    if (id) {
      setLoading(true);
      bookService.getById(id).then((b) => {
        if (b) setBook(b);
        setLoading(false);
      }).catch(() => setLoading(false));
    }
  }, [id]);

  useEffect(() => {
    if (!user) return;
    authService.getProfile().then((p) => {
      setIsAdmin(p?.role === "admin");
    });
    setUserId(user.id);
  }, [user]);

  // Fetch active borrowing on load
  useEffect(() => {
    if (!id || !user) return;
    api.get("/api/borrowings").then((res) => {
      const borrowings = res.data as Array<{
        id: string;
        book_id: string;
        status: string;
        due_date: string | null;
        user_id: string;
      }>;
      const active = borrowings.find(
        (b) => b.book_id === id && b.status === "borrowed"
      );
      if (active) {
        setActiveBorrowingId(active.id);
        if (active.due_date) {
          const due = new Date(active.due_date);
          const today = new Date();
          const diff = Math.ceil((due.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
          setDueDate(due.toLocaleDateString());
          setDaysLeft(diff);
        }
      }
    }).catch(() => {});
  }, [id, user]);

  const handleBorrow = async () => {
    if (!id || !userId) return;
    setBorrowLoading(true);
    try {
      const borrowing = await bookService.borrow(id, userId, "") as {
        id: string;
        due_date: string | null;
      };
      
      if (borrowing?.id) {
        setActiveBorrowingId(borrowing.id);
        if (borrowing.due_date) {
          const due = new Date(borrowing.due_date);
          const today = new Date();
          const diff = Math.ceil((due.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
          setDueDate(due.toLocaleDateString());
          setDaysLeft(diff);
        }
      }
      
      // Refresh book data to get updated status
      const updated = await bookService.getById(id);
      if (updated) {
        setBook(updated);
        console.log("Book updated after borrow:", updated);
      }
      
      setBorrowOpen(false);
    } catch (error) {
      console.error("Failed to borrow book:", error);
    }
    setBorrowLoading(false);
  };

  const handleReturn = async () => {
    if (!activeBorrowingId) return;
    setReturnLoading(true);
    try {
      await bookService.returnBook(id!, activeBorrowingId);
      const updated = await bookService.getById(id!);
      if (updated) setBook(updated);
      setActiveBorrowingId("");
      setDueDate("");
      setDaysLeft(null);
    } catch {
      console.error("Failed to return book");
    }
    setReturnLoading(false);
  };

  const handleEditOpen = () => {
    if (!book) return;
    setEditBook({
      title: book.title,
      author: book.author,
      genre: book.genre || "",
      isbn: book.isbn || "",
      description: book.description || "",
    });
    setEditCoverPreview(book.coverUrl || "");
    setEditCoverFile(null);
    setEditOpen(true);
  };

  const handleEditSave = async () => {
    if (!book) return;
    setEditLoading(true);
    try {
      let coverUrl = book.coverUrl;
      if (editCoverFile) coverUrl = await uploadBookCover(editCoverFile) || coverUrl;
      await bookService.update(book.id, {
        title: editBook.title,
        author: editBook.author,
        genre: editBook.genre,
        isbn: editBook.isbn,
        description: editBook.description,
        coverUrl: coverUrl,
      });
      const updated = await bookService.getById(book.id);
      if (updated) setBook(updated);
      setEditOpen(false);
    } catch {
      console.error("Failed to update book");
    }
    setEditLoading(false);
  };

  const handleDelete = async () => {
    if (!book) return;
    try {
      await bookService.delete(book.id);
      navigate("/books");
    } catch {
      console.error("Failed to delete book");
    }
  };

  const generateSummary = async () => {
    if (!book) return;
    setLoadingSummary(true);
    const s = await aiService.generateSummary(`${book.title} by ${book.author}`);
    setSummary(s);
    setLoadingSummary(false);
  };

  const askAI = async () => {
    if (!book || !question.trim()) return;
    setLoadingAsk(true);
    const a = await aiService.askAboutBook(`${book.title} by ${book.author}`, question);
    setAiAnswer(a);
    setLoadingAsk(false);
  };

  if (loading) {
    return (
      <div className="container py-8 space-y-6">
        <Link to="/books" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors">
          <ArrowLeft className="h-4 w-4" /> Back to Books
        </Link>
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          <div className="lg:col-span-2 space-y-6">
            <div className="rounded-xl border bg-card p-6 card-shadow">
              <div className="flex gap-6 mb-6">
                <Skeleton className="h-36 w-24 shrink-0 rounded-xl" />
                <div className="flex-1 space-y-3">
                  <Skeleton className="h-7 w-3/4" />
                  <Skeleton className="h-5 w-1/2" />
                  <Skeleton className="h-16 w-full" />
                </div>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {[...Array(4)].map((_, i) => (
                  <Skeleton key={i} className="h-20 rounded-lg" />
                ))}
              </div>
            </div>
          </div>
          <div className="space-y-4">
            <Skeleton className="h-32 rounded-xl" />
            <Skeleton className="h-48 rounded-xl" />
          </div>
        </div>
      </div>
    );
  }

  if (!book) {
    return (
      <div className="container py-20 text-center">
        <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-secondary">
          <BookOpen className="h-7 w-7 text-muted-foreground" />
        </div>
        <h2 className="text-lg font-semibold">Book not found</h2>
        <Link to="/books" className="mt-2 inline-block text-sm text-primary hover:underline">
          Back to Books
        </Link>
      </div>
    );
  }

  const dueDateColor =
    daysLeft === null ? "" :
    daysLeft < 0 ? "text-destructive" :
    daysLeft <= 3 ? "text-orange-500" :
    "text-foreground";

  const dueDateBg =
    daysLeft === null ? "bg-secondary/50" :
    daysLeft < 0 ? "bg-destructive/10 border border-destructive/20" :
    daysLeft <= 3 ? "bg-orange-500/10 border border-orange-500/20" :
    "bg-secondary/50";

  return (
    <div className="container py-4 px-4 sm:py-8 space-y-4 sm:space-y-6">
      <Link to="/books" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors">
        <ArrowLeft className="h-4 w-4" /> Back to Books
      </Link>

      <div className="grid grid-cols-1 gap-4 sm:gap-6 lg:grid-cols-3 lg:items-start">
        {/* Book Info */}
        <div className="lg:col-span-2 flex flex-col">
          <div className="rounded-xl border bg-card p-4 sm:p-6 card-shadow flex-1">

            {/* Cover + Title */}
            <div className="flex flex-col sm:flex-row gap-4 sm:gap-6 mb-6">
              <div className="shrink-0 mx-auto sm:mx-0">
                {book.coverUrl ? (
                  <img
                    src={book.coverUrl}
                    alt={book.title}
                    className="h-48 sm:h-36 w-auto rounded-xl object-cover border"
                  />
                ) : (
                  <div className="h-48 sm:h-36 w-32 sm:w-24 rounded-xl border bg-secondary/50 flex items-center justify-center">
                    <BookOpen className="h-10 sm:h-8 w-10 sm:w-8 text-muted-foreground opacity-30" />
                  </div>
                )}
              </div>
              <div className="flex-1">
                <div className="flex items-start justify-between">
                  <div>
                    <h1 className="text-2xl font-bold text-card-foreground">{book.title}</h1>
                    <p className="mt-1 text-muted-foreground">{book.author}</p>
                  </div>
                  <StatusBadge status={book.status} />
                </div>
                <p className="mt-3 text-sm leading-relaxed text-muted-foreground line-clamp-3">
                  {book.description}
                </p>
              </div>
            </div>

            {/* Metadata */}
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
              {[
                { icon: Tag, label: "Genre", value: book.genre || "—" },
                { icon: Hash, label: "ISBN", value: book.isbn || "—" },
                { icon: Calendar, label: "Added", value: new Date(book.addedAt).toLocaleDateString() },
              ].map((item) => (
                <div key={item.label} className="rounded-lg bg-secondary/50 p-3">
                  <div className="flex items-center gap-1.5 mb-1">
                    <item.icon className="h-3.5 w-3.5 text-muted-foreground" />
                    <span className="text-xs text-muted-foreground">{item.label}</span>
                  </div>
                  <p className="text-sm font-medium text-secondary-foreground truncate">{item.value}</p>
                </div>
              ))}
            </div>

            {/* Due date banner */}
            {book.status === "borrowed" && dueDate && (
              <div className={`mt-4 rounded-lg p-3 flex items-center gap-3 ${dueDateBg}`}>
                <Calendar className={`h-4 w-4 shrink-0 ${dueDateColor}`} />
                <div>
                  <p className="text-xs text-muted-foreground">Due date</p>
                  <p className={`text-sm font-medium ${dueDateColor}`}>
                    {dueDate} —{" "}
                    {daysLeft === null ? "" :
                      daysLeft < 0 ? `Overdue by ${Math.abs(daysLeft)} days` :
                      daysLeft === 0 ? "Due today!" :
                      `${daysLeft} days left`
                    }
                  </p>
                </div>
              </div>
            )}

            {/* Actions */}
            <div className="mt-6 flex flex-wrap gap-3">
              {/* Borrow */}
              {book.status === "available" && (
                <Dialog open={borrowOpen} onOpenChange={setBorrowOpen}>
                  <DialogTrigger asChild>
                    <Button>
                      {isAdmin ? "Mark as Borrowed" : "Borrow This Book"}
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>
                        {isAdmin ? "Mark Book as Borrowed" : "Borrow Book"}
                      </DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4 pt-2">
                      <p className="text-sm text-muted-foreground">
                        {isAdmin
                          ? `Mark "${book.title}" as borrowed. This will reduce available copies by 1.`
                          : `You're borrowing "${book.title}". It will be due in 14 days.`
                        }
                      </p>
                      <Button className="w-full" onClick={handleBorrow} disabled={borrowLoading}>
                        {borrowLoading ? "Processing..." : "Confirm"}
                      </Button>
                    </div>
                  </DialogContent>
                </Dialog>
              )}

              {/* Return */}
              {book.status === "borrowed" && activeBorrowingId && (
                <Button variant="outline" onClick={handleReturn} disabled={returnLoading}>
                  {returnLoading ? "Processing..." : isAdmin ? "Mark as Returned" : "Return Book"}
                </Button>
              )}

              {/* Admin only */}
              {isAdmin && (
                <>
                  <Button variant="outline" className="gap-2" onClick={handleEditOpen}>
                    <Pencil className="h-4 w-4" /> Edit
                  </Button>
                  <Button
                    variant="outline"
                    className="gap-2 text-destructive hover:bg-destructive/10"
                    onClick={() => setDeleteOpen(true)}
                  >
                    <Trash2 className="h-4 w-4" /> Delete
                  </Button>
                </>
              )}
            </div>
          </div>
        </div>

        {/* AI Features */}
        <div className="flex flex-col gap-4 lg:h-full">
          {/* Generate Summary */}
          <div className="rounded-xl border bg-card p-5 card-shadow flex-1 flex flex-col">
            <div className="flex items-center gap-2 mb-3">
              <div className="ai-gradient flex h-8 w-8 items-center justify-center rounded-lg">
                <Sparkles className="h-4 w-4 text-primary-foreground" />
              </div>
              <h3 className="text-sm font-semibold text-card-foreground">AI Summary</h3>
            </div>
            {summary ? (
              <p className="text-sm leading-relaxed text-muted-foreground flex-1">{summary}</p>
            ) : (
              <div className="flex-1 flex items-center">
                <Button variant="outline" size="sm" className="w-full gap-2" onClick={generateSummary} disabled={loadingSummary}>
                  <Sparkles className="h-3.5 w-3.5" />
                  {loadingSummary ? "Generating..." : "Generate AI Summary"}
                </Button>
              </div>
            )}
          </div>

          {/* Ask AI */}
          <div className="rounded-xl border bg-card p-5 card-shadow flex-1 flex flex-col">
            <div className="flex items-center gap-2 mb-3">
              <div className="ai-gradient flex h-8 w-8 items-center justify-center rounded-lg">
                <MessageSquare className="h-4 w-4 text-primary-foreground" />
              </div>
              <h3 className="text-sm font-semibold text-card-foreground">Ask AI About This Book</h3>
            </div>
            <div className="space-y-3 flex-1 flex flex-col">
              <input
                value={question}
                onChange={(e) => setQuestion(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && askAI()}
                placeholder="What's the main theme?"
                className="w-full rounded-lg border bg-background px-3 py-2 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
              />
              <Button variant="outline" size="sm" className="w-full gap-2" onClick={askAI} disabled={loadingAsk || !question.trim()}>
                <MessageSquare className="h-3.5 w-3.5" />
                {loadingAsk ? "Thinking..." : "Ask AI"}
              </Button>
              {aiAnswer && (
                <div className="rounded-lg bg-secondary/50 p-3 flex-1">
                  <p className="text-sm leading-relaxed text-secondary-foreground">{aiAnswer}</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Edit Dialog */}
      <Dialog open={editOpen} onOpenChange={setEditOpen}>
        <DialogContent className="max-h-[90vh] overflow-y-auto">
          <DialogHeader><DialogTitle>Edit Book</DialogTitle></DialogHeader>
          <div className="space-y-4 pt-2">
            <div>
              <Label>Title</Label>
              <Input value={editBook.title} onChange={(e) => setEditBook(p => ({ ...p, title: e.target.value }))} />
            </div>
            <div>
              <Label>Author</Label>
              <Input value={editBook.author} onChange={(e) => setEditBook(p => ({ ...p, author: e.target.value }))} />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Genre</Label>
                <Input value={editBook.genre} onChange={(e) => setEditBook(p => ({ ...p, genre: e.target.value }))} />
              </div>
              <div>
                <Label>ISBN</Label>
                <Input value={editBook.isbn} onChange={(e) => setEditBook(p => ({ ...p, isbn: e.target.value }))} />
              </div>
            </div>
            <div>
              <Label>Description</Label>
              <textarea
                className="w-full rounded-lg border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                rows={3}
                value={editBook.description}
                onChange={(e) => setEditBook(p => ({ ...p, description: e.target.value }))}
              />
            </div>
            <div>
              <Label>Cover Image</Label>
              <div className="mt-1 flex items-center gap-4">
                {editCoverPreview ? (
                  <img src={editCoverPreview} alt="Cover" className="h-20 w-14 rounded-lg object-cover border" />
                ) : (
                  <div className="h-20 w-14 rounded-lg border bg-secondary/50 flex items-center justify-center">
                    <BookOpen className="h-6 w-6 text-muted-foreground opacity-50" />
                  </div>
                )}
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) {
                      setEditCoverFile(file);
                      setEditCoverPreview(URL.createObjectURL(file));
                    }
                  }}
                  className="text-sm text-muted-foreground file:mr-3 file:py-1.5 file:px-3 file:rounded-lg file:border file:text-xs file:font-medium file:bg-secondary file:text-secondary-foreground cursor-pointer"
                />
              </div>
            </div>
            <Button className="w-full" onClick={handleEditSave} disabled={editLoading}>
              {editLoading ? "Saving..." : "Save Changes"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Delete Dialog */}
      <Dialog open={deleteOpen} onOpenChange={setDeleteOpen}>
        <DialogContent>
          <DialogHeader><DialogTitle>Delete Book</DialogTitle></DialogHeader>
          <p className="text-sm text-muted-foreground">
            Are you sure you want to delete <strong>{book.title}</strong>? This cannot be undone.
          </p>
          <div className="flex gap-3 mt-4">
            <Button variant="outline" className="flex-1" onClick={() => setDeleteOpen(false)}>Cancel</Button>
            <Button variant="destructive" className="flex-1" onClick={handleDelete}>Delete</Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default BookDetails;