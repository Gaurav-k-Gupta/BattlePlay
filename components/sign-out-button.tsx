"use client";

import { signOut } from "next-auth/react";

import { Button } from "@/components/ui/button";

export function SignOutButton() {
  return (
    <Button
      className="w-full mt-4 bg-transparent border border-ember-500/30 text-ember-400 hover:bg-ember-500/10 hover:border-ember-500/50 transition-colors"
      onClick={() => signOut({ callbackUrl: "/" })}
      type="button"
    >
      Sign Out
    </Button>
  );
}
