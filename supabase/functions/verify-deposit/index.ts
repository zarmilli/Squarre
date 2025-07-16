/// <reference types="https://deno.land/x/supabase_edge_functions/types.ts" />
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const supabase = createClient(
  Deno.env.get("URL")!,
  Deno.env.get("SERVICE_ROLE_KEY")!
);

Deno.serve(async (req) => {
  if (req.method !== "POST") {
    return new Response("Only POST allowed", { status: 405 });
  }

  const formData = await req.formData();

  const paymentStatus = formData.get("payment_status");
  const amountGross = formData.get("amount_gross");
  const customUserId = formData.get("custom_str1"); // You pass this in the form
  const pfSignature = formData.get("signature");

  if (!customUserId || !amountGross || !paymentStatus) {
    return new Response("Missing data", { status: 400 });
  }

  // Optional: validate signature (Payfast provides logic for this in docs)

  if (paymentStatus !== "COMPLETE") {
    return new Response("Payment not complete", { status: 200 });
  }

  const gross = parseFloat(amountGross.toString());
  const amount = gross - 3 - (0.03 * gross);


  // 1. Update user balance
  const { error: balanceErr } = await supabase.rpc("add_to_balance", {
    user_id_input: customUserId,
    amount_input: amount,
  });

  if (balanceErr) {
    console.error("Balance error:", balanceErr.message);
    return new Response("Balance update failed", { status: 500 });
  }

  // 2. Record transaction
  const { error: txErr } = await supabase.from("transactions").insert({
    user_id: customUserId,
    amount,
    type: "Deposit",
    source: "Payfast",
    created_at: new Date().toISOString(),
  });

  if (txErr) {
    console.error("Transaction log error:", txErr.message);
    return new Response("Transaction error", { status: 500 });
  }

  return new Response("OK", { status: 200 });
});
