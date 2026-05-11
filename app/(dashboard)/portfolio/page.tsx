import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { EmptyState } from "@/components/shared/empty-state";
import { Topbar } from "@/components/layout/topbar";
import { Briefcase, GitFork, Globe, FileCode, Camera, Star, Code2, Database, Zap } from "lucide-react";
import Link from "next/link";
import { formatDate, minutesToHours } from "@/lib/utils";

export const metadata = {
  title: "Portfolio | Personal Learning OS",
};

export default async function PortfolioPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const userId = session.user.id;

  const [user, submissions, tracks, totalXp, studyStats] = await Promise.all([
    db.user.findUnique({ where: { id: userId }, select: { name: true, email: true } }),
    db.submission.findMany({
      where: { userId, status: { in: ["submitted", "reviewed", "approved"] } },
      include: {
        assignment: {
          include: { week: true, track: true },
        },
      },
      orderBy: { submittedAt: "desc" },
    }),
    db.track.findMany({
      include: {
        modules: {
          include: {
            _count: { select: { lessons: true } },
          },
        },
      },
      orderBy: { order: "asc" },
    }),
    db.xpEvent.aggregate({ where: { userId }, _sum: { points: true } }),
    db.studyLog.aggregate({ where: { userId }, _sum: { minutes: true } }),
  ]);

  const completedModules = await db.progress.findMany({
    where: { userId, status: "completed", moduleId: { not: null } },
    include: { module: { include: { track: true } } },
  });

  const totalXpAmount = totalXp._sum.points ?? 0;
  const totalMinutes = studyStats._sum.minutes ?? 0;

  // Skills from completed modules
  const skillsByTrack = tracks.map((track) => {
    const completed = completedModules.filter((p) => p.module?.trackId === track.id);
    return { track: track.name, color: track.color, skills: completed.map((p) => p.module?.title ?? "") };
  });

  // CV bullet points based on submissions
  const cvBullets = submissions.map((s) => {
    const week = s.assignment.week.weekNumber;
    const title = s.assignment.title.replace(/^Week \d+ Assignment: /, "");
    const hasGithub = !!s.repoUrl;
    const hasDeployment = !!s.deploymentUrl;
    const extras = [hasGithub && "published to GitHub", hasDeployment && "deployed live"].filter(Boolean).join(", ");
    return `• ${title}${extras ? ` — ${extras}` : ""} (Week ${week})`;
  });

  return (
    <div>
      <Topbar title="Portfolio" subtitle="Your proof-of-work and career artifacts" />
      <div className="p-4 sm:p-6 space-y-6">

        {/* Profile card */}
        <Card className="border-primary/20">
          <CardContent className="pt-6">
            <div className="flex flex-col sm:flex-row gap-6 items-start">
              <div className="w-16 h-16 rounded-2xl gradient-primary flex items-center justify-center text-2xl font-bold text-white shrink-0">
                {user?.name?.[0]?.toUpperCase() ?? "L"}
              </div>
              <div className="flex-1 space-y-3">
                <div>
                  <h2 className="text-xl font-bold">{user?.name}</h2>
                  <p className="text-muted-foreground text-sm">{user?.email}</p>
                </div>
                <div className="flex flex-wrap gap-2">
                  <Badge variant="outline" className="text-primary border-primary/30">
                    <Zap className="w-3 h-3 mr-1" />{totalXpAmount.toLocaleString()} XP
                  </Badge>
                  <Badge variant="outline" className="text-emerald-400 border-emerald-400/30">
                    <Code2 className="w-3 h-3 mr-1" />Web Track
                  </Badge>
                  <Badge variant="outline" className="text-emerald-400 border-emerald-400/30">
                    <Database className="w-3 h-3 mr-1" />Data Engineering
                  </Badge>
                  <Badge variant="outline" className="text-muted-foreground border-border">
                    {minutesToHours(totalMinutes)} studied
                  </Badge>
                </div>
              </div>
              <div className="text-right shrink-0">
                <div className="text-3xl font-bold text-primary">{submissions.length}</div>
                <div className="text-xs text-muted-foreground">Projects submitted</div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Projects */}
        <div>
          <h3 className="font-semibold text-lg mb-4 flex items-center gap-2">
            <Briefcase className="w-5 h-5 text-muted-foreground" />
            Projects & Assignments
          </h3>

          {submissions.length === 0 ? (
            <EmptyState
              icon={Briefcase}
              title="No submitted projects yet"
              description="Submit your first assignment to start building your portfolio."
              action={{ label: "View Assignments", href: "/assignments" }}
            />
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {submissions.map((sub) => {
                const assignment = sub.assignment;
                const track = assignment.track;
                const week = assignment.week;
                return (
                  <Card key={sub.id} className="hover:border-primary/30 transition-colors">
                    <CardHeader className="pb-3">
                      <div className="flex items-start justify-between gap-2">
                        <CardTitle className="text-base leading-tight">
                          {assignment.title.replace(/^Week \d+ Assignment: /, "")}
                        </CardTitle>
                        <Badge
                          variant="outline"
                          className="shrink-0 text-xs"
                          style={{ color: track?.color ?? undefined, borderColor: track ? `${track.color}40` : undefined }}
                        >
                          Week {week.weekNumber}
                        </Badge>
                      </div>
                      {track && (
                        <Badge variant="outline" className="w-fit text-xs text-muted-foreground">
                          {track.name}
                        </Badge>
                      )}
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <p className="text-sm text-muted-foreground line-clamp-2">{assignment.brief}</p>

                      {/* Proof links */}
                      <div className="flex flex-wrap gap-2">
                        {sub.repoUrl && (
                          <Button asChild size="sm" variant="outline" className="h-7 px-2 text-xs gap-1">
                            <a href={sub.repoUrl} target="_blank" rel="noopener noreferrer">
                              <GitFork className="w-3 h-3" />GitHub
                            </a>
                          </Button>
                        )}
                        {sub.deploymentUrl && (
                          <Button asChild size="sm" variant="outline" className="h-7 px-2 text-xs gap-1 text-emerald-400 border-emerald-400/30">
                            <a href={sub.deploymentUrl} target="_blank" rel="noopener noreferrer">
                              <Globe className="w-3 h-3" />Live
                            </a>
                          </Button>
                        )}
                        {sub.sqlScriptUrl && (
                          <Button asChild size="sm" variant="outline" className="h-7 px-2 text-xs gap-1">
                            <a href={sub.sqlScriptUrl} target="_blank" rel="noopener noreferrer">
                              <FileCode className="w-3 h-3" />SQL
                            </a>
                          </Button>
                        )}
                        {sub.screenshotUrl && (
                          <Button asChild size="sm" variant="outline" className="h-7 px-2 text-xs gap-1">
                            <a href={sub.screenshotUrl} target="_blank" rel="noopener noreferrer">
                              <Camera className="w-3 h-3" />Screenshot
                            </a>
                          </Button>
                        )}
                      </div>

                      {sub.selfScore !== null && (
                        <div className="flex items-center gap-1.5 text-xs text-amber-400">
                          <Star className="w-3 h-3 fill-current" />
                          Self-score: {sub.selfScore}/10
                        </div>
                      )}

                      <div className="text-xs text-muted-foreground">
                        Submitted {formatDate(sub.submittedAt)}
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}
        </div>

        {/* Skills */}
        {skillsByTrack.some((t) => t.skills.length > 0) && (
          <div>
            <h3 className="font-semibold text-lg mb-4">Skills Demonstrated</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {skillsByTrack.map((trackSkills) => (
                trackSkills.skills.length > 0 && (
                  <Card key={trackSkills.track}>
                    <CardHeader className="pb-3">
                      <CardTitle className="text-sm" style={{ color: trackSkills.color }}>
                        {trackSkills.track}
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="flex flex-wrap gap-2">
                        {trackSkills.skills.map((skill) => (
                          <Badge key={skill} variant="outline" className="text-xs">{skill}</Badge>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                )
              ))}
            </div>
          </div>
        )}

        {/* CV Bullets */}
        {cvBullets.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="text-base">CV Bullet Points</CardTitle>
              <p className="text-xs text-muted-foreground">Copy these into your CV or LinkedIn profile</p>
            </CardHeader>
            <CardContent>
              <div className="bg-muted rounded-lg p-4 font-mono text-sm space-y-1">
                {cvBullets.map((bullet, i) => (
                  <div key={i} className="text-foreground leading-relaxed">{bullet}</div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
