"use client";

import { signIn } from "next-auth/react";

import { Button } from "@/components/ui/button";

export function SignInButton() {
  return (
    <Button
      className="w-fit"
      onClick={() => signIn("google", { callbackUrl: "/account" })}
      type="button"
    >
      Continue with Google
    </Button>
  );
}
