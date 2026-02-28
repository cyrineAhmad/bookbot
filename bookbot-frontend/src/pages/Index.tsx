import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { BookOpen, Bot, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { aiService } from "@/services/api";

const Index = () => {
  const [insights, setInsights] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const loadedInsights = await aiService.getInsights();
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
      <div className="text-center max-w-2xl mx-auto space-y-4">
        <div className="mx-auto mb-4 ai-gradient flex h-16 w-16 items-center justify-center rounded-2xl">
          <BookOpen className="h-8 w-8 text-primary-foreground" />
        </div>
        <h1 className="text-4xl font-bold tracking-tight text-foreground">
          Welcome to Book<span className="ai-gradient-text">Bot</span>
        </h1>
        <p className="text-lg text-muted-foreground">
          Discover, explore, and manage your library with AI-powered assistance
        </p>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2 max-w-4xl mx-auto">
        <Link to="/books">
          <div className="flex items-start gap-4 rounded-xl border bg-card p-6 hover:bg-secondary/30 transition-all cursor-pointer card-shadow hover:shadow-lg">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 shrink-0">
              <BookOpen className="h-6 w-6 text-primary" />
            </div>
            <div>
              <p className="text-lg font-semibold text-foreground mb-1">Browse Books</p>
              <p className="text-sm text-muted-foreground">Explore our collection and find your next read</p>
            </div>
          </div>
        </Link>
        
        <Link to="/ai-assistant">
          <div className="flex items-start gap-4 rounded-xl border bg-card p-6 hover:bg-secondary/30 transition-all cursor-pointer card-shadow hover:shadow-lg">
            <div className="ai-gradient flex h-12 w-12 items-center justify-center rounded-xl shrink-0">
              <Bot className="h-6 w-6 text-primary-foreground" />
            </div>
            <div>
              <p className="text-lg font-semibold text-foreground mb-1">AI Assistant</p>
              <p className="text-sm text-muted-foreground">Get personalized book recommendations</p>
            </div>
          </div>
        </Link>
      </div>

      <div className="max-w-2xl mx-auto rounded-xl border bg-card p-6 card-shadow">
        <div className="flex items-center gap-3 mb-4">
          <div className="ai-gradient flex h-10 w-10 items-center justify-center rounded-xl">
            <Sparkles className="h-5 w-5 text-primary-foreground" />
          </div>
          <h2 className="text-xl font-semibold text-foreground">AI Reading Tips</h2>
        </div>
        <div className="space-y-3">
          {loading ? (
            <p className="text-sm text-muted-foreground">Loading insights...</p>
          ) : insights.length > 0 ? (
            insights.slice(0, 3).map((insight, i) => (
              <div key={i} className="flex items-start gap-3 rounded-lg bg-secondary/50 p-4">
                <Sparkles className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                <p className="text-sm leading-relaxed text-foreground">{insight}</p>
              </div>
            ))
          ) : (
            <p className="text-sm text-muted-foreground">No insights available</p>
          )}
        </div>
        <Link to="/ai-assistant">
          <Button variant="outline" size="sm" className="w-full gap-2 mt-4">
            <Bot className="h-4 w-4" /> Chat with AI Assistant
          </Button>
        </Link>
      </div>
    </div>
  );
};

export default Index;