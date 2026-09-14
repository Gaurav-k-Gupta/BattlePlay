"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import { HomeIcon, LeaderboardIcon, MatchesIcon, ProfileIcon, WalletIcon } from "@/components/icons";
import { cn } from "@/lib/cn";

const regularItems = [
  { label: "Home", href: "/", icon: HomeIcon },
  { label: "Matches", href: "/matches", icon: MatchesIcon },
  { label: "Wallet", href: "/wallet", icon: WalletIcon },
  { label: "Leaderboard", href: "/leaderboard", icon: LeaderboardIcon },
  { label: "Profile", href: "/profile", icon: ProfileIcon },
] as const;

const adminItems = [
  { label: "Dashboard", href: "/admin", icon: HomeIcon },
  { label: "Matches", href: "/admin/matches", icon: MatchesIcon },
  { label: "Withdrawals", href: "/admin/withdrawals", icon: WalletIcon },
  { label: "Users", href: "/admin/users", icon: ProfileIcon },
  { label: "Promos", href: "/admin/promos", icon: LeaderboardIcon },
];

function isActive(pathname: string, href: string) {
  if (href === "/profile") return pathname.startsWith("/profile") || pathname === "/terms" || pathname === "/account";
  if (href === "/admin") return pathname === "/admin";
  return href === "/" ? pathname === "/" : pathname.startsWith(href);
}

export function AppNavigation({ variant, isAdmin = false }: { variant: "bottom" | "sidebar", isAdmin?: boolean }) {
  const pathname = usePathname();
  const items = isAdmin ? adminItems : regularItems;

  return (
    <nav aria-label="Primary navigation" className={cn(variant === "bottom" ? "grid grid-cols-5" : "grid gap-2")}>
      {items.map((item) => {
        const Icon = item.icon;
        const active = isActive(pathname, item.href);
        const className = cn(
          "relative flex items-center justify-center gap-1.5 rounded-xl text-muted transition",
          variant === "bottom" ? "min-h-16 flex-col px-1 text-[10px] font-semibold" : "min-h-12 justify-start px-3 text-sm font-semibold",
          active && "bg-violet-700/25 text-violet-400",
          "hover:bg-elevated hover:text-white",
        );

        const content = <><Icon className={cn("size-5", active && "drop-shadow-[0_0_8px_rgb(148_116_255_/_0.7)]")} /><span>{item.label}</span>{active ? <span className={cn("absolute bg-violet-500", variant === "bottom" ? "top-0 h-0.5 w-8 rounded-full" : "left-0 h-7 w-0.5 rounded-r-full")} /> : null}</>;

        return (
          <Link aria-current={active ? "page" : undefined} className={className} href={item.href} key={item.label}>{content}</Link>
        );
      })}
    </nav>
  );
}
