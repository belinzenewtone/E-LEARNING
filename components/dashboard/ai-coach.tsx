"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import {
  Bot,
  Sparkles,
  Brain,
  MessageSquare,
  FileText,
  Calendar,
  Target,
  AlertCircle,
  ChevronRight,
  Loader2,
} from "lucide-react";
import { cn } from "@/lib/utils";

type CoachAction = {
  id: string;
  label: string;
  icon: React.ElementType;
  prompt: string;
};

const coachActions: CoachAction[] = [
  { id: "explain", label: "Explain a concept", icon: Brain, prompt: "I need help understanding a concept from my notes." },
  { id: "quiz", label: "Generate quiz from notes", icon: Sparkles, prompt: "Create quiz questions based on my recent notes." },
  { id: "summarize", label: "Summarize my week", icon: Calendar, prompt: "Summarize my learning progress this week." },
  { id: "suggest", label: "What should I study next?", icon: Target, prompt: "Based on my progress, what should I focus on next?" },
  { id: "blocker", label: "Help with a blocker", icon: AlertCircle, prompt: "I'm stuck on something and need help unblocking." },
  { id: "review", label: "Review my reflection", icon: FileText, prompt: "Review my assignment reflection and give feedback." },
  { id: "cv", label: "Turn week into CV bullets", icon: MessageSquare, prompt: "Convert my week's work into professional CV bullet points." },
];

const mockResponses: Record<string, string> = {
  explain: "I'd be happy to help explain that concept! Based on your recent notes, it looks like you've been working through JavaScript closures and SQL window functions. Tell me which specific concept is giving you trouble, and I'll break it down with examples from your study material.",
  quiz: "Here are 3 questions based on your recent notes:\n\n1. **JS Variables**: What is the temporal dead zone and which keyword creates it?\n\n2. **SQL GROUP BY**: Write a query to find the top 3 companies by average salary, excluding companies with fewer than 5 employees.\n\n3. **Async JS**: Explain what happens when an unhandled Promise rejection occurs in Node.js.",
  summarize: "**This Week's Summary:**\n\n✅ Completed 3 lessons in JS Foundations\n📝 Added 3 notes (2 in Web, 1 in Data)\n⏱ Logged 150 minutes of study\n\n**Strengths:** Your SQL GROUP BY note shows clear understanding. Good instinct flagging type coercion as confusing.\n\n**Next focus:** Get to the DOM manipulation lesson — that sets up your Week 2 assignment.",
  suggest: "Based on your current progress, I recommend:\n\n1. **Immediate**: Finish the 'DOM Manipulation Basics' lesson — it's the last piece of Week 1.\n2. **This week**: Start the Week 1 assignment before Friday to avoid rush.\n3. **SQL**: You've done SELECT and WHERE well. Move to aggregations next — they'll feel natural after GROUP BY.\n\nYour study pace is solid. Keep the 90+ minute sessions going.",
  blocker: "Tell me what you're stuck on — include the concept name, what you've tried, and what's confusing. I'll use your notes and the official docs to help you push through.\n\nCommon blockers at your current stage:\n- 'this' keyword in callbacks (arrow functions help)\n- SQL NULL handling in WHERE vs HAVING\n- Promise chains vs async/await equivalence",
  review: "To review your reflection, paste it in the chat. I'll check that you've:\n✅ Identified what you understood\n✅ Named what confused you specifically\n✅ Connected the learning to a real application\n\nStrong reflections are the difference between passive and active learning.",
  cv: "Based on your Week 1 work, here are draft CV bullet points:\n\n• Built a JavaScript calculator application demonstrating control flow and DOM manipulation\n• Wrote 20+ SQL queries on a professional dataset using SELECT, WHERE, ORDER BY, and aggregation functions\n• Established a structured learning system with daily study logs and weekly assignments",
};

interface AiCoachProps {
  hasApiKey?: boolean;
  userName?: string;
}

type Message = {
  role: "user" | "assistant";
  content: string;
};

export function AiCoach({ hasApiKey = false, userName = "Learner" }: AiCoachProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [selectedAction, setSelectedAction] = useState<string | null>(null);

  async function handleAction(action: CoachAction) {
    setSelectedAction(action.id);
    setInput(action.prompt);
    await sendMessage(action.prompt, action.id);
    setInput("");
  }

  async function sendMessage(text: string, actionId?: string) {
    if (!text.trim()) return;
    setLoading(true);

    const userMessage: Message = { role: "user", content: text };
    setMessages((prev) => [...prev, userMessage]);
    setInput("");

    // Simulate API delay
    await new Promise((resolve) => setTimeout(resolve, 1200));

    const responseKey = actionId ?? "explain";
    const response = mockResponses[responseKey] ?? "I'm here to help! Once an API key is configured, I'll give you real AI-powered coaching based on your notes, progress, and assignments.";

    const assistantMessage: Message = { role: "assistant", content: response };
    setMessages((prev) => [...prev, assistantMessage]);
    setLoading(false);
    setSelectedAction(null);
  }

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-border">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg gradient-primary flex items-center justify-center">
            <Bot className="w-4 h-4 text-white" />
          </div>
          <div>
            <div className="font-semibold text-sm">AI Coach</div>
            <div className="text-xs text-muted-foreground">Your personal learning guide</div>
          </div>
        </div>
        <Badge
          variant="outline"
          className={cn(
            "text-xs",
            hasApiKey
              ? "text-emerald-400 border-emerald-400/30"
              : "text-amber-400 border-amber-400/30"
          )}
        >
          {hasApiKey ? "✓ Active" : "Demo mode"}
        </Badge>
      </div>

      {!hasApiKey && messages.length === 0 && (
        <div className="mx-4 mt-4 p-3 rounded-lg bg-amber-400/5 border border-amber-400/20 text-xs text-amber-400">
          <AlertCircle className="w-3 h-3 inline mr-1" />
          Running in demo mode. Set ANTHROPIC_API_KEY to enable real AI coaching.
        </div>
      )}

      {/* Quick actions */}
      {messages.length === 0 && (
        <div className="p-4 space-y-2">
          <p className="text-xs text-muted-foreground font-medium uppercase tracking-wide mb-3">
            What can I help with?
          </p>
          {coachActions.map((action) => (
            <button
              key={action.id}
              onClick={() => handleAction(action)}
              disabled={loading}
              className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-left text-sm bg-muted/50 hover:bg-muted border border-transparent hover:border-border transition-all group"
            >
              <action.icon className="w-4 h-4 text-muted-foreground group-hover:text-primary shrink-0" />
              <span className="flex-1 text-muted-foreground group-hover:text-foreground">{action.label}</span>
              <ChevronRight className="w-3 h-3 text-muted-foreground opacity-0 group-hover:opacity-100" />
            </button>
          ))}
        </div>
      )}

      {/* Message thread */}
      {messages.length > 0 && (
        <ScrollArea className="flex-1 p-4">
          <div className="space-y-4">
            {messages.map((msg, i) => (
              <div
                key={i}
                className={cn(
                  "flex gap-3",
                  msg.role === "user" ? "flex-row-reverse" : "flex-row"
                )}
              >
                <div
                  className={cn(
                    "w-6 h-6 rounded-full flex items-center justify-center shrink-0 text-xs font-semibold mt-1",
                    msg.role === "user"
                      ? "bg-primary text-primary-foreground"
                      : "gradient-primary text-white"
                  )}
                >
                  {msg.role === "user" ? userName[0]?.toUpperCase() : "AI"}
                </div>
                <div
                  className={cn(
                    "flex-1 text-sm leading-relaxed whitespace-pre-wrap rounded-xl px-3 py-2.5",
                    msg.role === "user"
                      ? "bg-primary/10 text-foreground"
                      : "bg-muted text-foreground"
                  )}
                >
                  {msg.content}
                </div>
              </div>
            ))}
            {loading && (
              <div className="flex gap-3">
                <div className="w-6 h-6 rounded-full gradient-primary flex items-center justify-center shrink-0 text-xs font-semibold text-white">AI</div>
                <div className="flex-1 bg-muted rounded-xl px-3 py-2.5 flex items-center gap-2">
                  <Loader2 className="w-4 h-4 animate-spin text-muted-foreground" />
                  <span className="text-xs text-muted-foreground">Thinking…</span>
                </div>
              </div>
            )}
          </div>
        </ScrollArea>
      )}

      <Separator />

      {/* Input */}
      <div className="p-4 space-y-2">
        {messages.length > 0 && (
          <button
            onClick={() => setMessages([])}
            className="text-xs text-muted-foreground hover:text-foreground"
          >
            ← Back to actions
          </button>
        )}
        <div className="flex gap-2">
          <Textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask anything about your learning…"
            className="min-h-[60px] text-sm resize-none"
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                sendMessage(input);
              }
            }}
          />
        </div>
        <Button
          size="sm"
          className="w-full"
          disabled={!input.trim() || loading}
          onClick={() => sendMessage(input)}
        >
          {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4 mr-1" />}
          Ask coach
        </Button>
      </div>
    </div>
  );
}
