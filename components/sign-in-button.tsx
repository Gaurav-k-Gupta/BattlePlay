"use client";

import { signIn } from "next-auth/react";

export function SignInButton() {
  return (
    <button
      className="w-fit rounded-lg bg-cyan-300 px-5 py-3 font-semibold text-slate-950 transition hover:bg-cyan-200"
      onClick={() => signIn("google", { callbackUrl: "/account" })}
      type="button"
    >
      Continue with Google
    </button>
  );
}
