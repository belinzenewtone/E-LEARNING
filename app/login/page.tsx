"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { BookOpen, Database, Code2, ArrowRight, Eye, EyeOff, Target, Terminal } from "lucide-react";
import { cn } from "@/lib/utils";

type FeatureColor = "cyan" | "emerald" | "amber" | "purple";

const FEATURES = [
  { icon: Code2,    title: "Web Track",       detail: "JS → TS → Next.js → Node.js",           color: "cyan" as FeatureColor },
  { icon: Database, title: "Data Track",      detail: "SQL → dbt → Airflow → BigQuery",         color: "emerald" as FeatureColor },
  { icon: Terminal, title: "Python & FastAPI", detail: "Python → FastAPI → SQLAlchemy → Docker", color: "amber" as FeatureColor },
  { icon: Target,   title: "Continuity & Credits", detail: "Record focus velocity and active sprint metrics", color: "purple" as FeatureColor },
];

const colorMap: Record<FeatureColor, { text: string; bg: string; border: string }> = {
  cyan: { text: "text-[var(--token-cyan)]", bg: "bg-[var(--token-cyan)]/6", border: "border-[var(--token-cyan)]/15" },
  emerald: { text: "text-[var(--token-emerald)]", bg: "bg-[var(--token-emerald)]/6", border: "border-[var(--token-emerald)]/15" },
  amber: { text: "text-[var(--token-amber)]", bg: "bg-[var(--token-amber)]/6", border: "border-[var(--token-amber)]/15" },
  purple: { text: "text-[var(--token-purple)]", bg: "bg-[var(--token-purple)]/6", border: "border-[var(--token-purple)]/15" },
};

const PHASES = [
  { label: "Phase 1: Foundations", weeks: "WEEKS 1–4",   progress: 100, color: "bg-[var(--token-emerald)]" },
  { label: "Phase 2: Deep Dive",   weeks: "WEEKS 5–8",   progress: 100, color: "bg-[var(--token-cyan)]" },
  { label: "Phase 3: Advanced",    weeks: "WEEKS 9–13",  progress: 60,  color: "bg-[var(--token-purple)]" },
  { label: "Phase 4: Production",  weeks: "WEEKS 14–22", progress: 30,  color: "bg-[var(--token-amber)]" },
  { label: "Phase 5: Python Extension", weeks: "WEEKS 23–26", progress: 0, color: "bg-[var(--token-amber)]" },
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
      const result = await signIn("credentials", {
        email,
        password,
        redirect: false,
      });

      if (result?.error) {
        toast.error("Invalid email or password. Please try again.");
      } else {
        router.push("/dashboard");
      }
    } catch {
      toast.error("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex bg-background">
      {/* ── Left panel ──────────────────────────────────────────────────────── */}
      <div className="hidden lg:flex lg:w-[52%] flex-col justify-between p-10 bg-card border-r border-border/40 relative overflow-hidden">
        
        {/* Logo */}
        <div className="relative flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 border border-primary/20">
            <BookOpen className="h-5 w-5 text-primary" />
          </div>
          <div>
            <span className="font-bold text-base tracking-tight text-foreground">Personal Learning OS</span>
            <p className="text-[10px] font-mono font-semibold tracking-wider text-muted-foreground mt-0.5 uppercase">SYSTEM ACCESS CONTROL</p>
          </div>
        </div>

        {/* Hero */}
        <div className="relative space-y-10">
          <div>
            <h1 className="text-5xl font-semibold leading-tight tracking-tight text-foreground">
              26 weeks.<br />
              <span className="text-primary">Three tracks.</span><br />
              One mission.
            </h1>
            <p className="mt-5 text-xs text-muted-foreground/80 leading-relaxed max-w-md">
              A structured, self-directed curriculum for Data Engineering and Web Development — featuring rigorous sprint assessments, continuous learning records, and a premium proof-of-work portfolio.
            </p>
          </div>

          {/* Tracks grid */}
          <div className="grid grid-cols-2 gap-3">
            {FEATURES.map(({ icon: Icon, title, detail, color }) => {
              const styles = colorMap[color];
              return (
                <div key={title} className="group rounded-xl border border-border/40 bg-card/60 p-4 transition-all hover:shadow-sm" data-slot="card">
                  <div className="flex items-start gap-3">
                    <div className={cn("flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border", styles.bg, styles.border, styles.text)}>
                      <Icon className="h-4 w-4" />
                    </div>
                    <div>
                      <p className="text-xs font-bold text-foreground leading-none mt-1">{title}</p>
                      <p className="text-[10px] text-muted-foreground/75 mt-1 leading-snug">{detail}</p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Footer */}
        <p className="relative text-[10px] font-mono text-muted-foreground/60 uppercase tracking-tight">
          Next.js 16 // Prisma // PostgreSQL // Tailwind CSS v4
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
            <p className="text-[9px] font-mono font-semibold tracking-widest text-muted-foreground/80 uppercase">SYSTEM SIGN IN</p>
            <h2 className="text-xl font-bold tracking-tight text-foreground mt-1">Welcome back</h2>
            <p className="text-xs text-muted-foreground/80 mt-1">Sign in to authenticate secure learning session</p>
          </div>

          {/* Form */}
          <form onSubmit={handleLogin} className="space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="email" className="text-[10px] font-semibold text-muted-foreground uppercase font-mono tracking-wider">Email Address</Label>
              <Input
                id="email"
                type="email"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                autoComplete="email"
                className="h-10 bg-card border-border/60 focus:border-primary/60 transition-colors font-mono text-xs rounded-lg"
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="password" className="text-[10px] font-semibold text-muted-foreground uppercase font-mono tracking-wider">Password</Label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  autoComplete="current-password"
                  className="h-10 bg-card border-border/60 focus:border-primary/60 pr-10 transition-colors font-mono text-xs rounded-lg"
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

            <Button type="submit" className="w-full h-10 font-mono text-xs font-semibold uppercase tracking-wider gap-2 rounded-lg mt-2" isLoading={loading}>
              {loading ? "Signing in…" : <>Sign in <ArrowRight className="h-3.5 w-3.5" /></>}
            </Button>
          </form>

          {/* Journey progress */}
          <div className="rounded-xl border border-border/40 bg-card/60 p-4 space-y-3" data-slot="card">
            <div className="flex items-center gap-2 text-[9px] font-bold text-muted-foreground uppercase tracking-widest font-mono">
              <Target className="h-3.5 w-3.5 text-primary/75" />
              Roadmap Progression Phases
            </div>
            <div className="space-y-3">
              {PHASES.map(({ label, weeks, progress, color }) => (
                <div key={label} className="space-y-1">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-semibold text-foreground text-[11px]">{label}</span>
                    <span className="text-[9px] font-mono text-muted-foreground/70">{weeks}</span>
                  </div>
                  <div className="h-1 bg-muted rounded overflow-hidden">
                    <div
                      className={cn("h-full rounded transition-all duration-500", color)}
                      style={{ width: `${progress}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          <p className="text-center text-[9px] font-mono text-muted-foreground/60 uppercase tracking-tight">
            SECURED ENDPOINT // SINGLE USER ACCESS ONLY
          </p>
        </div>
      </div>
    </div>
  );
}
