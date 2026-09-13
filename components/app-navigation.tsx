"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import { HomeIcon, LeaderboardIcon, MatchesIcon, ProfileIcon, WalletIcon } from "@/components/icons";
import { cn } from "@/lib/cn";

const items = [
  { label: "Home", href: "/", icon: HomeIcon },
  { label: "Matches", href: "/matches", icon: MatchesIcon, disabled: true },
  { label: "Wallet", href: "/wallet", icon: WalletIcon },
  { label: "Leaderboard", href: "/leaderboard", icon: LeaderboardIcon, disabled: true },
  { label: "Profile", href: "/profile", icon: ProfileIcon },
];

function isActive(pathname: string, href: string) {
  if (href === "/profile") return pathname.startsWith("/profile") || pathname === "/terms" || pathname === "/account";
  return href === "/" ? pathname === "/" : pathname.startsWith(href);
}

export function AppNavigation({ variant }: { variant: "bottom" | "sidebar" }) {
  const pathname = usePathname();

  return (
    <nav aria-label="Primary navigation" className={cn(variant === "bottom" ? "grid grid-cols-5" : "grid gap-2")}>
      {items.map((item) => {
        const Icon = item.icon;
        const active = isActive(pathname, item.href);
        const className = cn(
          "relative flex items-center justify-center gap-1.5 rounded-xl text-muted transition",
          variant === "bottom" ? "min-h-16 flex-col px-1 text-[10px] font-semibold" : "min-h-12 justify-start px-3 text-sm font-semibold",
          active && "bg-violet-700/25 text-violet-400",
          item.disabled && "cursor-not-allowed opacity-45",
          !item.disabled && "hover:bg-elevated hover:text-white",
        );

        const content = <><Icon className={cn("size-5", active && "drop-shadow-[0_0_8px_rgb(148_116_255_/_0.7)]")} /><span>{item.label}</span>{active ? <span className={cn("absolute bg-violet-500", variant === "bottom" ? "top-0 h-0.5 w-8 rounded-full" : "left-0 h-7 w-0.5 rounded-r-full")} /> : null}</>;

        return item.disabled ? (
          <span aria-disabled="true" className={className} key={item.label} title={`${item.label} is coming soon`}>{content}</span>
        ) : (
          <Link aria-current={active ? "page" : undefined} className={className} href={item.href} key={item.label}>{content}</Link>
        );
      })}
    </nav>
  );
}
