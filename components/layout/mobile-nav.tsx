"use client";

import { useState, useEffect } from "react";
import { usePathname } from "next/navigation";
import { Menu } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTitle } from "@/components/ui/sheet";
import { Sidebar } from "./sidebar";

interface MobileNavProps {
  userXp?: number;
  streak?: number;
  userName?: string;
}

export function MobileNav({ userXp = 0, streak = 0, userName = "Learner" }: MobileNavProps) {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();

  // Close drawer whenever the route changes (user tapped a nav link)
  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  return (
    <>
      <Button
        variant="ghost"
        size="icon"
        className="h-8 w-8 lg:hidden"
        onClick={() => setOpen(true)}
        aria-label="Open navigation menu"
      >
        <Menu className="h-5 w-5" />
      </Button>

      <Sheet open={open} onOpenChange={setOpen}>
        <SheetContent side="left" className="w-60 p-0 bg-sidebar border-sidebar-border flex flex-col">
          <SheetTitle className="sr-only">Navigation</SheetTitle>
          <div className="flex-1 overflow-y-auto scrollbar-thin">
            <Sidebar userXp={userXp} streak={streak} userName={userName} />
          </div>
        </SheetContent>
      </Sheet>
    </>
  );
}
