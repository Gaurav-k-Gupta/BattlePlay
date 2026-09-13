"use client";

import { useState } from "react";

import { Button } from "@/components/ui/button";

type ProfileValues = {
  name: string;
  phone: string | null;
  freeFireUID: string | null;
  freeFireIGN: string | null;
};

export function ProfileForm({ initialProfile }: { initialProfile: ProfileValues }) {
  const [form, setForm] = useState({
    name: initialProfile.name,
    phone: initialProfile.phone ?? "",
    freeFireUID: initialProfile.freeFireUID ?? "",
    freeFireIGN: initialProfile.freeFireIGN ?? "",
  });
  const [message, setMessage] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsSaving(true);
    setMessage(null);

    try {
      const response = await fetch("/api/profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: form.name,
          phone: form.phone.trim() || null,
          freeFireUID: form.freeFireUID.trim() || null,
          freeFireIGN: form.freeFireIGN.trim() || null,
        }),
      });
      const result = (await response.json()) as { error?: string };

      setMessage(response.ok ? "Profile saved." : result.error ?? "Unable to save your profile.");
    } catch {
      setMessage("Unable to reach the server. Please try again.");
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <form className="grid gap-5" onSubmit={handleSubmit}>
      <label className="grid gap-2 text-sm">
        <span className="font-semibold text-white">Name</span>
        <input
          className="min-h-11 rounded-xl border border-line bg-canvas px-3 text-white outline-none transition placeholder:text-muted focus:border-violet-500 focus:ring-2 focus:ring-violet-600/25"
          minLength={2}
          onChange={(event) => setForm({ ...form, name: event.target.value })}
          required
          value={form.name}
        />
      </label>
      <label className="grid gap-2 text-sm">
        <span className="font-semibold text-white">Phone number</span>
        <input
          className="min-h-11 rounded-xl border border-line bg-canvas px-3 text-white outline-none transition placeholder:text-muted focus:border-violet-500 focus:ring-2 focus:ring-violet-600/25"
          onChange={(event) => setForm({ ...form, phone: event.target.value })}
          inputMode="numeric"
          maxLength={13}
          placeholder="10-digit Indian mobile number"
          type="tel"
          value={form.phone}
        />
        <span className="text-xs text-muted">Required to add wallet funds. Enter a 10-digit Indian mobile number.</span>
      </label>
      <label className="grid gap-2 text-sm">
        <span className="font-semibold text-white">Free Fire UID</span>
        <input
          className="min-h-11 rounded-xl border border-line bg-canvas px-3 text-white outline-none transition placeholder:text-muted focus:border-violet-500 focus:ring-2 focus:ring-violet-600/25"
          onChange={(event) => setForm({ ...form, freeFireUID: event.target.value })}
          placeholder="Required before joining a match"
          value={form.freeFireUID}
        />
      </label>
      <label className="grid gap-2 text-sm">
        <span className="font-semibold text-white">Free Fire IGN</span>
        <input
          className="min-h-11 rounded-xl border border-line bg-canvas px-3 text-white outline-none transition placeholder:text-muted focus:border-violet-500 focus:ring-2 focus:ring-violet-600/25"
          onChange={(event) => setForm({ ...form, freeFireIGN: event.target.value })}
          placeholder="Required before joining a match"
          value={form.freeFireIGN}
        />
      </label>
      {message ? <p aria-live="polite" className="text-sm font-medium text-violet-400">{message}</p> : null}
      <Button
        className="w-fit"
        disabled={isSaving}
        type="submit"
      >
        {isSaving ? "Saving…" : "Save profile"}
      </Button>
    </form>
  );
}
