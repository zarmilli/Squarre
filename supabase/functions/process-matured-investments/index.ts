import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  Deno.env.get("SUPABASE_URL")!,
  Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
);

Deno.serve(async () => {
  const now = new Date();

  const { data: assets, error: assetErr } = await supabase.from("assets").select("*");
  if (assetErr) return new Response("Failed to load assets", { status: 500 });

  for (const asset of assets) {
    const startDate = new Date(asset.start_date);
    const endDate = new Date(startDate);
    endDate.setDate(endDate.getDate() + asset.duration_weeks * 7);

    if (now < endDate) continue;

    const { data: investments, error: invErr } = await supabase
      .from("investments")
      .select("*")
      .eq("name", asset.name);

    if (invErr || !investments) continue;

    for (const inv of investments) {
      const totalReturn = inv.total_value * (1 + asset.interest / 100);

      // ✅ Add to user balance via RPC
      const { error: balanceErr } = await supabase.rpc("add_to_balance", {
        user_id_input: inv.user_id,
        amount_input: totalReturn,
      });

      if (balanceErr) continue;

      // ✅ Insert transaction
      await supabase.from("transactions").insert({
        user_id: inv.user_id,
        amount: totalReturn,
        type: "Interest",
        source: "Squarre",
        created_at: new Date().toISOString(),
      });

      // ✅ Delete investment
      await supabase.from("investments").delete().eq("id", inv.id);
    }
  }

  return new Response("Matured investments processed");
});
