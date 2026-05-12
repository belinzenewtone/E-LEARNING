"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { BookOpen, Zap, Database, Code2, Loader2, ArrowRight, Eye, EyeOff } from "lucide-react";

const FEATURES = [
  { icon: Code2,    label: "Web Track",  desc: "JS → TS → Next.js → Node.js"     },
  { icon: Database, label: "Data Track", desc: "SQL → dbt → Airflow → BigQuery"   },
  { icon: Zap,      label: "XP System",  desc: "Earn points, build daily streaks"  },
  { icon: BookOpen, label: "22 Weeks",   desc: "May 11 → Oct 11, 2026"            },
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
      {/* ── Left panel — branding ─────────────────────────────────────────── */}
      <div className="hidden lg:flex lg:w-[55%] flex-col justify-between p-12 bg-card/50 border-r border-border/60 relative overflow-hidden">
        {/* Background decoration */}
        <div className="absolute inset-0 bg-gradient-to-br from-primary/3 via-transparent to-secondary/3 pointer-events-none" />
        <div className="absolute top-0 right-0 h-96 w-96 rounded-full bg-primary/3 blur-3xl pointer-events-none" />

        {/* Logo */}
        <div className="relative flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 border border-primary/20">
            <BookOpen className="h-5 w-5 text-primary" />
          </div>
          <span className="font-bold text-lg text-foreground">Personal Learning OS</span>
        </div>

        {/* Hero copy */}
        <div className="relative space-y-8">
          <div>
            <h1 className="text-5xl font-extrabold leading-tight text-foreground">
              22 weeks.<br />
              <span className="text-primary">Two tracks.</span><br />
              One mission.
            </h1>
            <p className="mt-5 text-base text-muted-foreground leading-relaxed max-w-md">
              Your personal upskilling cockpit for Data Engineering and modern Web Development. Structured sprints, real assignments, and proof-of-work that builds a portfolio employers notice.
            </p>
          </div>

          {/* Feature grid */}
          <div className="grid grid-cols-2 gap-3">
            {FEATURES.map(({ icon: Icon, label, desc }) => (
              <div key={label} className="flex items-start gap-3 rounded-xl border border-border/50 bg-background/40 p-4 backdrop-blur-sm">
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-primary/10">
                  <Icon className="h-4 w-4 text-primary" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-foreground">{label}</p>
                  <p className="text-xs text-muted-foreground mt-0.5">{desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        <p className="relative text-xs text-muted-foreground">
          Built with Next.js 16 · Prisma · PostgreSQL · Tailwind CSS
        </p>
      </div>

      {/* ── Right panel — form ────────────────────────────────────────────── */}
      <div className="flex flex-1 items-center justify-center p-8">
        <div className="w-full max-w-sm space-y-8">
          {/* Mobile logo */}
          <div className="flex items-center gap-3 lg:hidden">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary/10 border border-primary/20">
              <BookOpen className="h-4 w-4 text-primary" />
            </div>
            <span className="font-bold text-base text-foreground">Personal Learning OS</span>
          </div>

          {/* Heading */}
          <div>
            <h2 className="text-2xl font-semibold text-foreground">Welcome back</h2>
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
                className="h-11 bg-muted/30 border-border/60 focus:border-primary/60"
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
                  className="h-11 bg-muted/30 border-border/60 focus:border-primary/60 pr-10"
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

            <Button type="submit" className="w-full h-11 font-semibold gap-2" disabled={loading}>
              {loading ? (
                <><Loader2 className="h-4 w-4 animate-spin" /> Signing in…</>
              ) : (
                <>Sign in <ArrowRight className="h-4 w-4" /></>
              )}
            </Button>
          </form>

          {/* Progress indicator */}
          <div className="rounded-xl border border-border/40 bg-muted/10 p-4 space-y-3">
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Your 22-week journey</p>
            <div className="space-y-2">
              {[
                { label: "Phase 1: Foundations", weeks: "Weeks 1–4",  color: "bg-cyan-400"   },
                { label: "Phase 2: Core Skills", weeks: "Weeks 5–8",  color: "bg-blue-400"   },
                { label: "Phase 3: Advanced",    weeks: "Weeks 9–13", color: "bg-purple-400" },
              ].map(({ label, weeks, color }) => (
                <div key={label} className="flex items-center gap-2 text-xs text-muted-foreground">
                  <div className={`h-1.5 w-1.5 rounded-full shrink-0 ${color}`} />
                  <span className="flex-1">{label}</span>
                  <span className="text-[10px]">{weeks}</span>
                </div>
              ))}
            </div>
          </div>

          <p className="text-center text-xs text-muted-foreground">
            Personal platform — single user access only
          </p>
        </div>
      </div>
    </div>
  );
}
