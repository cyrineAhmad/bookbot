import { BookStatus } from "@/types/book";

interface StatusBadgeProps {
  status: BookStatus;
}

const StatusBadge = ({ status }: StatusBadgeProps) => {
  const isAvailable = status === "available";
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-medium ${
        isAvailable
          ? "bg-success/10 text-success"
          : "bg-warning/10 text-warning"
      }`}
    >
      <span className={`h-1.5 w-1.5 rounded-full ${isAvailable ? "bg-success" : "bg-warning"}`} />
      {isAvailable ? "Available" : "Borrowed"}
    </span>
  );
};

export default StatusBadge;
