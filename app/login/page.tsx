"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { BookOpen, Zap, Database, Code2, Loader2, ArrowRight, Eye, EyeOff, Target, Map, CalendarRange } from "lucide-react";
import { cn } from "@/lib/utils";

const FEATURES = [
  { icon: Code2,    title: "Web Track",   detail: "JS → TS → Next.js → Node.js",         color: "var(--token-cyan)" },
  { icon: Database, title: "Data Track",  detail: "SQL → dbt → Airflow → BigQuery",        color: "var(--token-emerald)" },
  { icon: Zap,      title: "XP & Streaks", detail: "Earn points, build habits, stay sharp", color: "var(--token-amber)" },
  { icon: CalendarRange, title: "22 Weeks",  detail: "May 11 → Oct 11, 2026",              color: "var(--token-purple)" },
];

const PHASES = [
  { label: "Phase 1: Foundations", weeks: "Weeks 1–4",  progress: 100, color: "var(--token-emerald)" },
  { label: "Phase 2: Deep Dive",   weeks: "Weeks 5–8",  progress: 100, color: "var(--token-cyan)" },
  { label: "Phase 3: Advanced",    weeks: "Weeks 9–13", progress: 60,  color: "var(--token-purple)" },
  { label: "Phase 4: Production",  weeks: "Weeks 14+",  progress: 30,  color: "var(--token-amber)" },
];

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    try {
      const result = await signIn("credentials", { email, password, redirect: false });
      if (result?.error) {
        toast.error("Invalid credentials. Please check your email and password.");
      } else {
        router.push("/dashboard");
        router.refresh();
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex bg-background">
      {/* ── Left panel ──────────────────────────────────────────────────────── */}
      <div className="hidden lg:flex lg:w-[52%] flex-col justify-between p-10 bg-card border-r border-border/40 relative overflow-hidden">
        {/* Ambient glow */}
        <div className="absolute -top-40 -right-40 h-[500px] w-[500px] rounded-full bg-[var(--token-cyan)]/4 blur-[120px] pointer-events-none" />
        <div className="absolute -bottom-20 -left-20 h-[300px] w-[300px] rounded-full bg-[var(--token-emerald)]/3 blur-[100px] pointer-events-none" />

        {/* Logo */}
        <div className="relative flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 border border-primary/20">
            <BookOpen className="h-5 w-5 text-primary" />
          </div>
          <div>
            <span className="font-bold text-base text-foreground">Personal Learning OS</span>
            <p className="text-[11px] text-muted-foreground mt-0.5">Your upskilling cockpit</p>
          </div>
        </div>

        {/* Hero */}
        <div className="relative space-y-10">
          <div>
            <h1 className="text-5xl font-semibold leading-tight tracking-tight text-foreground">
              22 weeks.<br />
              <span className="text-primary">Two tracks.</span><br />
              One mission.
            </h1>
            <p className="mt-5 text-sm text-muted-foreground leading-relaxed max-w-md">
              A structured, self-directed curriculum for Data Engineering and Web Development — real assignments, XP gamification, and a proof-of-work portfolio that employers notice.
            </p>
          </div>

          {/* Tracks grid */}
          <div className="grid grid-cols-2 gap-3">
            {FEATURES.map(({ icon: Icon, title, detail, color }) => (
              <div key={title} className="group rounded-xl border border-border/40 bg-card/60 p-4 transition-all hover:border-border/70 hover:shadow-sm">
                <div className="flex items-start gap-3">
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border" style={{ backgroundColor: `${color}10`, borderColor: `${color}30`, color }}>
                    <Icon className="h-4 w-4" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-foreground">{title}</p>
                    <p className="text-[11px] text-muted-foreground mt-0.5">{detail}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Footer */}
        <p className="relative text-[11px] text-muted-foreground/60">
          Next.js 16 · Prisma · PostgreSQL · Tailwind CSS v4
        </p>
      </div>

      {/* ── Right panel ─────────────────────────────────────────────────────── */}
      <div className="flex flex-1 items-center justify-center p-6 sm:p-10">
        <div className="w-full max-w-sm space-y-7">
          {/* Mobile branding */}
          <div className="lg:hidden space-y-2">
            <div className="flex items-center gap-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary/10 border border-primary/20">
                <BookOpen className="h-4 w-4 text-primary" />
              </div>
              <span className="font-bold text-base text-foreground">Personal Learning OS</span>
            </div>
          </div>

          {/* Heading */}
          <div>
            <h2 className="text-2xl font-semibold tracking-tight text-foreground">Welcome back</h2>
            <p className="text-sm text-muted-foreground mt-1.5">Sign in to continue your learning journey</p>
          </div>

          {/* Form */}
          <form onSubmit={handleLogin} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email" className="text-sm font-medium">Email address</Label>
              <Input
                id="email"
                type="email"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                autoComplete="email"
                className="h-11 bg-muted/30 border-border/60 focus:border-primary/60 transition-colors"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="password" className="text-sm font-medium">Password</Label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  autoComplete="current-password"
                  className="h-11 bg-muted/30 border-border/60 focus:border-primary/60 pr-10 transition-colors"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((v) => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                  tabIndex={-1}
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            <Button type="submit" className="w-full h-11 font-semibold gap-2" isLoading={loading}>
              {loading ? "Signing in…" : <>Sign in <ArrowRight className="h-4 w-4" /></>}
            </Button>
          </form>

          {/* Journey progress */}
          <div className="rounded-xl border border-border/40 bg-card/60 p-4 space-y-3">
            <div className="flex items-center gap-2 text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">
              <Target className="h-3 w-3" />
              Your 22-week journey
            </div>
            <div className="space-y-2.5">
              {PHASES.map(({ label, weeks, progress, color }) => (
                <div key={label} className="space-y-1.5">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-medium text-foreground">{label}</span>
                    <span className="text-[10px] text-muted-foreground">{weeks}</span>
                  </div>
                  <div className="h-1.5 w-full rounded-full bg-muted/40 overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all duration-500"
                      style={{ width: `${progress}%`, backgroundColor: color }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          <p className="text-center text-[11px] text-muted-foreground/60">
            Personal platform — single user access only
          </p>
        </div>
      </div>
    </div>
  );
}
