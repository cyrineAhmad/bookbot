import { LucideIcon } from "lucide-react";

interface StatsCardProps {
  title: string;
  value: string | number;
  icon: LucideIcon;
  variant?: "default" | "ai";
  subtitle?: string;
}

const StatsCard = ({ title, value, icon: Icon, variant = "default", subtitle }: StatsCardProps) => {
  return (
    <div className="rounded-xl border bg-card p-5 card-shadow">
      <div className="flex items-center justify-between mb-3">
        <span className="text-sm font-medium text-muted-foreground">{title}</span>
        <div
          className={`flex h-9 w-9 items-center justify-center rounded-lg ${
            variant === "ai" ? "ai-gradient" : "bg-primary/10"
          }`}
        >
          <Icon className={`h-4.5 w-4.5 ${variant === "ai" ? "text-primary-foreground" : "text-primary"}`} />
        </div>
      </div>
      <p className="text-3xl font-bold text-card-foreground">{value}</p>
      {subtitle && <p className="mt-1 text-xs text-muted-foreground">{subtitle}</p>}
    </div>
  );
};

export default StatsCard;
