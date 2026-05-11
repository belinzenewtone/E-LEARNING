"use client";

import { createContext, useContext } from "react";

interface NavData {
  userXp: number;
  streak: number;
  userName: string;
}

const NavContext = createContext<NavData>({ userXp: 0, streak: 0, userName: "Learner" });

export function useNavData() {
  return useContext(NavContext);
}

export function DashboardShell({
  children,
  userXp,
  streak,
  userName,
}: NavData & { children: React.ReactNode }) {
  return (
    <NavContext.Provider value={{ userXp, streak, userName }}>
      {children}
    </NavContext.Provider>
  );
}
