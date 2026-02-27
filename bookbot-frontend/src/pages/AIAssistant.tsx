import { useState } from "react";
import { Bot, Lightbulb, BookOpen, TrendingUp, Search, Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import { aiService } from "@/services/api";

interface Message {
  role: "user" | "assistant";
  content: string;
}

const suggestions = [
  { icon: Search, text: "Find sci-fi books about AI" },
  { icon: BookOpen, text: "Summarize 'Atomic Habits'" },
  { icon: TrendingUp, text: "What are trending books?" },
  { icon: Lightbulb, text: "Recommend books for beginners" },
];

const AIAssistant = () => {
  const [messages, setMessages] = useState<Message[]>([
    { role: "assistant", content: "Hi! I'm BookBot AI 📚 Ask me anything about books, recommendations, or your library!" }
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);

  const sendMessage = async (text?: string) => {
    const messageText = text || input.trim();
    if (!messageText) return;

    setMessages(prev => [...prev, { role: "user", content: messageText }]);
    setInput("");
    setLoading(true);

    try {
      const response = await aiService.chat(messageText);
      setMessages(prev => [...prev, { role: "assistant", content: response }]);
    } catch {
      setMessages(prev => [...prev, { role: "assistant", content: "Sorry, I encountered an error. Please try again." }]);
    }
    setLoading(false);
  };

  return (
    <div className="container py-8">
      <div className="mx-auto max-w-4xl">
        <div className="mb-6 text-center">
          <div className="mx-auto mb-3 ai-gradient flex h-14 w-14 items-center justify-center rounded-2xl">
            <Bot className="h-7 w-7 text-primary-foreground" />
          </div>
          <h1 className="text-2xl font-bold text-foreground">AI Assistant</h1>
          <p className="mt-1 text-muted-foreground">Ask me anything about your library</p>
        </div>

        {/* Suggestion chips */}
        <div className="mb-4 flex flex-wrap justify-center gap-2">
          {suggestions.map((s) => (
            <button
              key={s.text}
              onClick={() => sendMessage(s.text)}
              className="flex items-center gap-2 rounded-full border bg-card px-4 py-2 text-sm text-muted-foreground card-shadow hover:bg-secondary hover:text-foreground transition-colors"
            >
              <s.icon className="h-3.5 w-3.5" />
              {s.text}
            </button>
          ))}
        </div>

        {/* Chat Window */}
        <div className="rounded-xl border bg-card card-shadow overflow-hidden flex flex-col" style={{ height: "500px" }}>
          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {messages.map((msg, i) => (
              <div key={i} className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
                <div className={`max-w-[80%] rounded-2xl px-4 py-2.5 text-sm leading-relaxed ${
                  msg.role === "user"
                    ? "bg-primary text-primary-foreground rounded-br-sm"
                    : "bg-secondary text-secondary-foreground rounded-bl-sm"
                }`}>
                  {msg.content}
                </div>
              </div>
            ))}
            {loading && (
              <div className="flex justify-start">
                <div className="bg-secondary rounded-2xl rounded-bl-sm px-4 py-2.5 text-sm text-muted-foreground">
                  Thinking...
                </div>
              </div>
            )}
          </div>

          {/* Input */}
          <div className="border-t p-4 flex gap-3">
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && sendMessage()}
              placeholder="Ask about books, recommendations..."
              className="flex-1 rounded-xl border bg-background px-4 py-2 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
            />
            <Button onClick={() => sendMessage()} disabled={loading || !input.trim()} size="sm" className="rounded-xl px-4">
              <Send className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AIAssistant;