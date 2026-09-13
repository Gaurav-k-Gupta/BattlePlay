"use client";

import { useState } from "react";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

type CreateOrderResponse = { orderId: string; paymentUrl: string };

const presets = [50, 100, 250, 500];

function isCreateOrderResponse(value: unknown): value is CreateOrderResponse {
  return Boolean(value && typeof value === "object" && "orderId" in value && "paymentUrl" in value && typeof value.orderId === "string" && typeof value.paymentUrl === "string");
}

export function WalletTopUp() {
  const [amount, setAmount] = useState(100);
  const [isPending, setIsPending] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [profileUrl, setProfileUrl] = useState<string | null>(null);

  async function startTopUp() {
    setMessage(null);
    setProfileUrl(null);
    setIsPending(true);

    try {
      const response = await fetch("/api/wallet/topup/create-order", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ amount }),
      });
      const result: unknown = await response.json();

      if (!response.ok || !isCreateOrderResponse(result)) {
        const error = result && typeof result === "object" && "error" in result && typeof result.error === "string" ? result.error : "We could not start this top-up.";
        if (result && typeof result === "object" && "profileUrl" in result && typeof result.profileUrl === "string") setProfileUrl(result.profileUrl);
        throw new Error(error);
      }

      window.location.assign(result.paymentUrl);
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "We could not start this top-up.");
      setIsPending(false);
    }
  }

  return (
    <Card className="p-5 sm:p-6" tone="elevated">
      <p className="text-xs font-bold tracking-[0.18em] text-violet-400">ADD FUNDS</p>
      <h2 className="mt-2 font-display text-2xl font-black text-white">Top up securely</h2>
      <p className="mt-2 text-sm leading-6 text-muted">Choose an amount, then complete payment on TranzUPI&apos;s secure hosted page. Your wallet is credited only after server-side confirmation.</p>
      <div className="mt-5 grid grid-cols-2 gap-2 sm:grid-cols-4">
        {presets.map((preset) => <Button className="px-3" key={preset} onClick={() => setAmount(preset)} type="button" variant={amount === preset ? "primary" : "secondary"}>₹{preset}</Button>)}
      </div>
      <label className="mt-5 block text-sm font-semibold text-white" htmlFor="topup-amount">
        Custom amount
        <span className="mt-2 flex items-center rounded-xl border border-line bg-canvas px-3 focus-within:border-violet-500 focus-within:ring-2 focus-within:ring-violet-600/25">
          <span className="text-muted">₹</span>
          <input className="min-h-11 w-full bg-transparent px-2 text-white outline-none" id="topup-amount" max="10000" min="10" onChange={(event) => setAmount(Number(event.target.value))} step="1" type="number" value={Number.isFinite(amount) ? amount : ""} />
        </span>
      </label>
      <Button className="mt-5 w-full" disabled={isPending || !Number.isInteger(amount) || amount < 10 || amount > 10_000} onClick={startTopUp} type="button">
        {isPending ? "Opening secure payment…" : `Add ₹${Number.isFinite(amount) ? amount : 0}`}
      </Button>
      <p className="mt-3 text-xs text-muted">Minimum ₹10 · Maximum ₹10,000 per top-up</p>
      {message ? <p aria-live="polite" className="mt-4 rounded-xl border border-ember-500/35 bg-ember-700/15 p-3 text-sm font-medium text-ember-400">{message}{profileUrl ? <a className="ml-1 underline" href={profileUrl}>Update profile</a> : null}</p> : null}
    </Card>
  );
}
