import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { BookOpen, CheckCircle, Clock, Sparkles, Bot } from "lucide-react";
import { Button } from "@/components/ui/button";
import { bookService, statsService, aiService } from "@/services/api";
import { DashboardStats } from "@/types/book";

const Index = () => {
  const [stats, setStats] = useState<DashboardStats>({
    totalBooks: 0,
    available: 0,
    borrowed: 0,
    reserved: 0,
    lost: 0,
    maintenance: 0,
    aiInsights: 0,
  });
  const [insights, setInsights] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const [loadedStats, loadedInsights] = await Promise.all([
          statsService.getDashboardStats(),
          aiService.getInsights(),
        ]);
        setStats(loadedStats);
        setInsights(Array.isArray(loadedInsights)
          ? loadedInsights
          : (loadedInsights as string).split("\n").filter((l: string) => l.trim()).slice(0, 3)
        );
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  return (
    <div className="container py-8 space-y-8">
      {/* Header */}
      <div className="flex items-end justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground">Dashboard</h1>
          <p className="mt-1 text-muted-foreground">Welcome back! Here's your library overview.</p>
        </div>
        <Link to="/books">
          <Button className="gap-2">
            <BookOpen className="h-4 w-4" /> Browse Books
          </Button>
        </Link>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <div className="rounded-xl border bg-card p-5 card-shadow">
          <div className="flex items-center gap-3 mb-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10">
              <BookOpen className="h-5 w-5 text-primary" />
            </div>
            <span className="text-sm font-medium text-muted-foreground">Total Books</span>
          </div>
          <p className="text-3xl font-bold text-foreground">{loading ? "—" : stats.totalBooks}</p>
          <p className="text-xs text-muted-foreground mt-1">In your library</p>
        </div>

        <div className="rounded-xl border bg-card p-5 card-shadow">
          <div className="flex items-center gap-3 mb-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-green-500/10">
              <CheckCircle className="h-5 w-5 text-green-500" />
            </div>
            <span className="text-sm font-medium text-muted-foreground">Available</span>
          </div>
          <p className="text-3xl font-bold text-foreground">{loading ? "—" : stats.available}</p>
          <p className="text-xs text-muted-foreground mt-1">Ready to borrow</p>
        </div>

        <div className="rounded-xl border bg-card p-5 card-shadow">
          <div className="flex items-center gap-3 mb-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-orange-500/10">
              <Clock className="h-5 w-5 text-orange-500" />
            </div>
            <span className="text-sm font-medium text-muted-foreground">Borrowed</span>
          </div>
          <p className="text-3xl font-bold text-foreground">{loading ? "—" : stats.borrowed}</p>
          <p className="text-xs text-muted-foreground mt-1">Currently checked out</p>
        </div>
      </div>

      {/* Main content */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">

        {/* Quick Actions */}
        <div className="lg:col-span-2 rounded-xl border bg-card p-6 card-shadow">
          <h2 className="text-lg font-semibold text-foreground mb-4">Quick Actions</h2>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <Link to="/books">
              <div className="flex items-center gap-4 rounded-xl border p-4 hover:bg-secondary/50 transition-colors cursor-pointer">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                  <BookOpen className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-foreground">Browse Books</p>
                  <p className="text-xs text-muted-foreground">View and manage the library</p>
                </div>
              </div>
            </Link>
            <Link to="/ai-assistant">
              <div className="flex items-center gap-4 rounded-xl border p-4 hover:bg-secondary/50 transition-colors cursor-pointer">
                <div className="ai-gradient flex h-10 w-10 items-center justify-center rounded-lg">
                  <Bot className="h-5 w-5 text-primary-foreground" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-foreground">AI Assistant</p>
                  <p className="text-xs text-muted-foreground">Get book recommendations</p>
                </div>
              </div>
            </Link>
          </div>
        </div>

        {/* AI Insights */}
        <div className="rounded-xl border bg-card p-5 card-shadow">
          <div className="flex items-center gap-2 mb-4">
            <div className="ai-gradient flex h-8 w-8 items-center justify-center rounded-lg">
              <Sparkles className="h-4 w-4 text-primary-foreground" />
            </div>
            <h2 className="text-sm font-semibold text-foreground">AI Reading Tips</h2>
          </div>
          <div className="space-y-3">
            {loading ? (
              <p className="text-sm text-muted-foreground">Loading insights...</p>
            ) : insights.length > 0 ? (
              insights.slice(0, 3).map((insight, i) => (
                <div key={i} className="flex items-start gap-2 rounded-lg bg-secondary/50 p-3">
                  <Sparkles className="mt-0.5 h-3.5 w-3.5 shrink-0 text-primary" />
                  <p className="text-xs leading-relaxed text-secondary-foreground">{insight}</p>
                </div>
              ))
            ) : (
              <p className="text-sm text-muted-foreground">No insights available</p>
            )}
          </div>
          <Link to="/ai-assistant">
            <Button variant="outline" size="sm" className="w-full gap-2 mt-4">
              <Bot className="h-4 w-4" /> Open AI Assistant
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Index;