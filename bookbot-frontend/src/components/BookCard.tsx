import { Book } from "@/types/book";
import StatusBadge from "./StatusBadge";
import { Link } from "react-router-dom";
import { BookOpen } from "lucide-react";

interface BookCardProps {
  book: Book;
}

const BookCard = ({ book }: BookCardProps) => {
  return (
    <Link
      to={`/books/${book.id}`}
      className="group flex flex-col rounded-xl border bg-card overflow-hidden card-shadow transition-all hover:bg-secondary/30 hover:-translate-y-0.5"
    >
      {/* Cover Image — fixed height */}
      <div className="h-44 w-full bg-secondary/50 flex items-center justify-center overflow-hidden shrink-0">
        {book.coverUrl ? (
          <img
            src={book.coverUrl}
            alt={book.title}
            className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-300"
          />
        ) : (
          <div className="flex flex-col items-center gap-2 text-muted-foreground">
            <BookOpen className="h-10 w-10 opacity-20" />
          </div>
        )}
      </div>

      {/* Info — fixed height so all cards are equal */}
      <div className="p-4 flex flex-col justify-between flex-1" style={{ minHeight: "100px" }}>
        <div>
          <div className="flex items-start justify-between gap-2 mb-1">
            <h3 className="font-semibold text-card-foreground group-hover:text-primary transition-colors line-clamp-1 flex-1">
              {book.title}
            </h3>
            <StatusBadge status={book.status} />
          </div>
          <p className="text-sm text-muted-foreground line-clamp-1">{book.author}</p>
        </div>
        {book.genre && (
          <span className="mt-2 inline-block rounded-md bg-secondary px-2 py-0.5 text-xs font-medium text-secondary-foreground">
            {book.genre}
          </span>
        )}
      </div>
    </Link>
  );
};

export default BookCard;