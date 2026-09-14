"use client";

import { useEffect, useState } from "react";
import { Notification } from "@/generated/prisma/client";
import { Button } from "@/components/ui/button";

export function NotificationList({ initialNotifications }: { initialNotifications: Notification[] }) {
  const [notifications, setNotifications] = useState(initialNotifications);

  const markAllAsRead = async () => {
    const unread = notifications.some(n => !n.isRead);
    if (!unread) return;

    // Optimistic update
    setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));

    await fetch("/api/notifications/read", { method: "POST" });
  };

  useEffect(() => {
    // Mark as read when the page is opened
    markAllAsRead();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (notifications.length === 0) {
    return (
      <div className="p-12 text-center text-muted">
        <svg className="mx-auto h-12 w-12 text-white/10 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
        </svg>
        <p>You have no notifications yet.</p>
      </div>
    );
  }

  return (
    <ul className="divide-y divide-line">
      {notifications.map((notif) => (
        <li 
          key={notif.id} 
          className={`p-5 transition-colors ${!notif.isRead ? "bg-violet-900/10" : "hover:bg-white/5"}`}
        >
          <div className="flex items-start justify-between gap-4">
            <div>
              <div className="flex items-center gap-2">
                {!notif.isRead && <span className="h-2 w-2 rounded-full bg-violet-500 shadow-[0_0_8px_rgba(139,92,246,0.8)]" />}
                <p className={`text-sm font-bold ${!notif.isRead ? "text-white" : "text-white/80"}`}>{notif.title}</p>
              </div>
              <p className={`mt-1.5 text-sm leading-relaxed ${!notif.isRead ? "text-white/90" : "text-muted"}`}>
                {notif.message}
              </p>
              <p className="mt-3 text-xs font-semibold text-white/30">
                {new Date(notif.createdAt).toLocaleString()}
              </p>
            </div>
            
            <div className="shrink-0 text-[10px] font-bold uppercase tracking-wider text-violet-400/50 bg-violet-400/10 px-2 py-1 rounded">
              {notif.type.replace("_", " ")}
            </div>
          </div>
        </li>
      ))}
    </ul>
  );
}
