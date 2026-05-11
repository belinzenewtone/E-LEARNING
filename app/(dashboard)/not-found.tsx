import Link from "next/link";
import { BookOpen, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function NotFound() {
  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center gap-4 p-8 text-center">
      <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/10">
        <BookOpen className="h-7 w-7 text-primary" />
      </div>
      <div className="space-y-1">
        <h2 className="text-lg font-semibold text-foreground">Page not found</h2>
        <p className="text-sm text-muted-foreground max-w-sm">
          This resource doesn&apos;t exist or may have been removed.
        </p>
      </div>
      <Button asChild variant="outline" size="sm" className="gap-2">
        <Link href="/dashboard">
          <ArrowLeft className="h-3.5 w-3.5" />
          Back to Dashboard
        </Link>
      </Button>
    </div>
  );
}
