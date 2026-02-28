import { useState } from "react";
import { Bot, Lightbulb, BookOpen, TrendingUp, Search, Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import { aiService } from "@/services/api";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

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
      <div className="mx-auto max-w-4xl space-y-6">
        <div className="text-center">
          <div className="mx-auto mb-4 ai-gradient flex h-14 w-14 items-center justify-center rounded-2xl">
            <Bot className="h-7 w-7 text-primary-foreground" />
          </div>
          <h1 className="text-3xl font-bold text-foreground">AI Book Assistant</h1>
          <p className="mt-2 text-muted-foreground">Get personalized recommendations and insights about books</p>
        </div>

        {/* Suggestion chips */}
        {messages.length <= 1 && (
          <div className="flex flex-wrap justify-center gap-2">
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
        )}

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
                  {msg.role === "assistant" ? (
                    <div className="prose prose-sm max-w-none dark:prose-invert prose-p:leading-relaxed prose-pre:p-0 prose-headings:mt-3 prose-headings:mb-2 prose-li:my-1">
                      <ReactMarkdown
                        remarkPlugins={[remarkGfm]}
                        components={{
                          p: ({ children }) => <p className="mb-2 last:mb-0">{children}</p>,
                          ul: ({ children }) => <ul className="my-2 ml-4 list-disc space-y-1">{children}</ul>,
                          ol: ({ children }) => <ol className="my-2 ml-4 list-decimal space-y-1">{children}</ol>,
                          li: ({ children }) => <li className="leading-relaxed">{children}</li>,
                          strong: ({ children }) => <strong className="font-semibold text-foreground">{children}</strong>,
                          h1: ({ children }) => <h1 className="text-xl font-bold mb-2">{children}</h1>,
                          h2: ({ children }) => <h2 className="text-lg font-bold mb-2">{children}</h2>,
                          h3: ({ children }) => <h3 className="text-base font-bold mb-1">{children}</h3>,
                          code: ({ children, className }) => {
                            const isInline = !className;
                            return isInline ? (
                              <code className="bg-muted px-1 py-0.5 rounded text-xs">{children}</code>
                            ) : (
                              <code className={className}>{children}</code>
                            );
                          },
                        }}
                      >
                        {msg.content}
                      </ReactMarkdown>
                    </div>
                  ) : (
                    msg.content
                  )}
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
              className="flex-1 rounded-xl border bg-background px-4 py-2.5 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
            />
            <Button onClick={() => sendMessage()} disabled={loading || !input.trim()} size="default" className="rounded-xl px-6">
              <Send className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AIAssistant;