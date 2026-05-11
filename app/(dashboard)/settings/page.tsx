import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import { Topbar } from "@/components/layout/topbar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { User, Shield, Target, AlertTriangle } from "lucide-react";
import { formatDate } from "@/lib/utils";

export const metadata = {
  title: "Settings | Personal Learning OS",
};

export default async function SettingsPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const userId = session.user.id;

  const [user, goals, xpTotal] = await Promise.all([
    db.user.findUnique({
      where: { id: userId },
      select: { name: true, email: true, createdAt: true },
    }),
    db.goal.findMany({
      where: { userId },
      include: { track: { select: { name: true, color: true } } },
      orderBy: { createdAt: "desc" },
    }),
    db.xpEvent.aggregate({ where: { userId }, _sum: { points: true } }),
  ]);

  return (
    <div>
      <Topbar title="Settings" subtitle="Profile and preferences" />
      <div className="p-6 space-y-6 max-w-2xl">
        {/* Profile */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <User className="w-4 h-4 text-muted-foreground" />
              Profile
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-2xl gradient-primary flex items-center justify-center text-2xl font-bold text-white">
                {user?.name?.[0]?.toUpperCase() ?? "L"}
              </div>
              <div>
                <div className="font-semibold text-lg">{user?.name}</div>
                <div className="text-sm text-muted-foreground">{user?.email}</div>
                <div className="text-xs text-muted-foreground mt-0.5">
                  Member since {user ? formatDate(user.createdAt) : "—"}
                </div>
              </div>
            </div>
            <Separator />
            <div className="flex gap-3 text-sm">
              <Badge variant="outline" className="text-primary border-primary/30">
                {(xpTotal._sum.points ?? 0).toLocaleString()} XP
              </Badge>
              <Badge variant="outline" className="text-muted-foreground">
                Personal Learning OS
              </Badge>
            </div>
            <p className="text-xs text-muted-foreground">
              To change your name, email, or password, update the environment variables and re-seed the database.
            </p>
          </CardContent>
        </Card>

        {/* Goals */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <Target className="w-4 h-4 text-muted-foreground" />
              Goals
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {goals.length === 0 ? (
              <p className="text-sm text-muted-foreground">No goals set yet.</p>
            ) : (
              goals.map((goal) => (
                <div key={goal.id} className="flex items-start gap-3 p-3 rounded-lg bg-muted/50 border border-border">
                  <div className="flex-1 min-w-0">
                    <div className="font-medium text-sm">{goal.title}</div>
                    {goal.description && (
                      <div className="text-xs text-muted-foreground mt-0.5">{goal.description}</div>
                    )}
                    {goal.targetDate && (
                      <div className="text-xs text-muted-foreground mt-1">
                        Target: {formatDate(goal.targetDate)}
                      </div>
                    )}
                  </div>
                  <div className="flex gap-2 shrink-0">
                    {goal.track && (
                      <Badge
                        variant="outline"
                        className="text-xs"
                        style={{ color: goal.track.color, borderColor: `${goal.track.color}30` }}
                      >
                        {goal.track.name}
                      </Badge>
                    )}
                    <Badge
                      variant="outline"
                      className={`text-xs ${goal.status === "completed" ? "text-emerald-400 border-emerald-400/30" : "text-muted-foreground"}`}
                    >
                      {goal.status}
                    </Badge>
                  </div>
                </div>
              ))
            )}
          </CardContent>
        </Card>

        {/* Security */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <Shield className="w-4 h-4 text-muted-foreground" />
              Security
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <p className="text-sm text-muted-foreground">
              Authentication uses NextAuth credentials. Your password is stored as a bcrypt hash.
              To change your password, update <code className="bg-muted px-1.5 py-0.5 rounded text-xs">ADMIN_PASSWORD</code> in your environment variables and run <code className="bg-muted px-1.5 py-0.5 rounded text-xs">npm run db:seed</code>.
            </p>
          </CardContent>
        </Card>

        {/* Danger zone */}
        <Card className="border-red-400/20">
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2 text-red-400">
              <AlertTriangle className="w-4 h-4" />
              Danger Zone
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <p className="text-sm text-muted-foreground">
              Resetting progress will delete all your XP events, study logs, lesson progress, and submissions. This action cannot be undone.
            </p>
            <Button
              variant="outline"
              size="sm"
              className="text-red-400 border-red-400/30 hover:bg-red-400/5 cursor-not-allowed opacity-60"
              disabled
              title="Use npm run db:reset from the terminal to reset all data"
            >
              Reset All Progress (use terminal: npm run db:reset)
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
