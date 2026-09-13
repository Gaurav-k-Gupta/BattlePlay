import "server-only";

type TranzupiStatus = "SUCCESS" | "PENDING" | "FAILURE" | "NOT_FOUND" | "UNKNOWN";

type TranzupiOrder = {
  orderId: string;
  paymentUrl: string;
};

type TranzupiStatusResult = {
  status: TranzupiStatus;
  amount: string | null;
  utr: string | null;
};

function getUserToken() {
  const userToken = process.env.TRANZUPI_USER_TOKEN;

  if (!userToken) throw new Error("TranzUPI is not configured.");
  return userToken;
}

async function postToTranzupi(endpoint: string, fields: Record<string, string>) {
  const body = new URLSearchParams({ user_token: getUserToken(), ...fields });
  const response = await fetch(`https://tranzupi.com/api/${endpoint}`, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body,
    cache: "no-store",
  });

  if (!response.ok) throw new Error("TranzUPI is temporarily unavailable.");
  return response.json() as Promise<unknown>;
}

export async function createTranzupiOrder(input: {
  customerMobile: string;
  amount: string;
  orderId: string;
  redirectUrl: string;
  customerName: string;
}): Promise<TranzupiOrder> {
  const response = await postToTranzupi("create-order", {
    customer_mobile: input.customerMobile,
    amount: input.amount,
    order_id: input.orderId,
    redirect_url: input.redirectUrl,
    remark1: "BattlePlay wallet top-up",
    remark2: input.customerName.slice(0, 100),
  });

  if (
    !response || typeof response !== "object" || !("status" in response) || response.status !== true ||
    !("result" in response) || !response.result || typeof response.result !== "object" ||
    !("orderId" in response.result) || !("payment_url" in response.result) ||
    typeof response.result.orderId !== "string" || typeof response.result.payment_url !== "string"
  ) throw new Error("TranzUPI could not create this payment order.");

  if (response.result.orderId !== input.orderId) throw new Error("TranzUPI returned an unexpected order ID.");

  let paymentUrl: URL;
  try {
    paymentUrl = new URL(response.result.payment_url);
  } catch {
    throw new Error("TranzUPI returned an invalid payment URL.");
  }

  if (paymentUrl.protocol !== "https:" || (paymentUrl.hostname !== "tranzupi.com" && !paymentUrl.hostname.endsWith(".tranzupi.com"))) {
    throw new Error("TranzUPI returned an untrusted payment URL.");
  }

  return { orderId: response.result.orderId, paymentUrl: paymentUrl.toString() };
}

export async function checkTranzupiOrderStatus(orderId: string): Promise<TranzupiStatusResult> {
  const response = await postToTranzupi("check-order-status", { order_id: orderId });

  if (!response || typeof response !== "object" || !("result" in response) || !response.result || typeof response.result !== "object") {
    const message = response && typeof response === "object" && "message" in response && typeof response.message === "string" ? response.message.toLowerCase() : "";
    return { status: message.includes("order not found") ? "NOT_FOUND" : "UNKNOWN", amount: null, utr: null };
  }

  const result = response.result;
  const status = "status" in result && typeof result.status === "string" ? result.status.toUpperCase() : "UNKNOWN";
  const amount = "amount" in result && typeof result.amount === "string" ? result.amount : null;
  const utr = "utr" in result && typeof result.utr === "string" ? result.utr : null;

  if (status === "SUCCESS") return { status: "SUCCESS", amount, utr };
  if (status === "PENDING") return { status: "PENDING", amount, utr };
  if (status === "FAILURE" || status === "FAILED") return { status: "FAILURE", amount, utr };
  return { status: "UNKNOWN", amount, utr };
}
