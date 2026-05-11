"use client";

import { createContext, useContext } from "react";
import type { NotificationItem } from "./notification-bell";

interface NavData {
  userXp: number;
  streak: number;
  userName: string;
  userId: string;
  notifications: NotificationItem[];
  unreadCount: number;
}

const NavContext = createContext<NavData>({
  userXp: 0,
  streak: 0,
  userName: "Learner",
  userId: "",
  notifications: [],
  unreadCount: 0,
});

export function useNavData() {
  return useContext(NavContext);
}

export function DashboardShell({
  children,
  userXp,
  streak,
  userName,
  userId,
  notifications,
  unreadCount,
}: NavData & { children: React.ReactNode }) {
  return (
    <NavContext.Provider value={{ userXp, streak, userName, userId, notifications, unreadCount }}>
      {children}
    </NavContext.Provider>
  );
}
