import type { SVGProps } from "react";

type IconProps = SVGProps<SVGSVGElement>;

function IconFrame({ children, ...props }: IconProps) {
  return (
    <svg aria-hidden="true" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" viewBox="0 0 24 24" {...props}>
      {children}
    </svg>
  );
}

export function HomeIcon(props: IconProps) { return <IconFrame {...props}><path d="m3 10 9-7 9 7v10a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1V10Z" /><path d="M9 21v-6h6v6" /></IconFrame>; }
export function MatchesIcon(props: IconProps) { return <IconFrame {...props}><path d="M7 3h10v4a5 5 0 0 1-10 0V3Z" /><path d="M7 5H4v2a3 3 0 0 0 3 3" /><path d="M17 5h3v2a3 3 0 0 1-3 3" /><path d="M12 12v5" /><path d="M8 21h8" /></IconFrame>; }
export function WalletIcon(props: IconProps) { return <IconFrame {...props}><path d="M4 6a2 2 0 0 1 2-2h12a2 2 0 0 1 2 2v14H6a2 2 0 0 1-2-2V6Z" /><path d="M4 8h16" /><path d="M16 14h.01" /></IconFrame>; }
export function LeaderboardIcon(props: IconProps) { return <IconFrame {...props}><path d="M5 20v-6h4v6" /><path d="M10 20V9h4v11" /><path d="M15 20V4h4v16" /></IconFrame>; }
export function ProfileIcon(props: IconProps) { return <IconFrame {...props}><circle cx="12" cy="8" r="4" /><path d="M4 21a8 8 0 0 1 16 0" /></IconFrame>; }
