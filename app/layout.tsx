import type { Metadata, Viewport } from "next";

import { Suspense } from "react";
import { AppShell } from "@/components/app-shell";
import { ReferralTracker } from "@/components/referral-tracker";

import "./globals.css";

export const metadata: Metadata = {
  title: "BattlePlay",
  description: "Your competitive gaming hub",
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "BattlePlay",
  },
};

export const viewport: Viewport = {
  themeColor: "#8B5CF6",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body>
        <Suspense fallback={null}>
          <ReferralTracker />
        </Suspense>
        <AppShell>{children}</AppShell>
      </body>
    </html>
  );
}
