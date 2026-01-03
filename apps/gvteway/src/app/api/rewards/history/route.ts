import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function GET(request: NextRequest) {
  try {
    const authHeader = request.headers.get("authorization");
    if (!authHeader) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const token = authHeader.replace("Bearer ", "");
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);

    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { data: transactions, error: txError } = await supabase
      .from("rewards_transactions")
      .select("id, type, amount, description, source, date, created_at")
      .eq("user_id", user.id)
      .order("date", { ascending: false });

    if (txError && txError.code !== "42P01") {
      return NextResponse.json({ error: txError.message }, { status: 500 });
    }

    const txList = transactions || [];
    const totalEarned = txList
      .filter((t) => t.type === "earned")
      .reduce((sum, t) => sum + (t.amount || 0), 0);
    const totalRedeemed = txList
      .filter((t) => t.type === "redeemed")
      .reduce((sum, t) => sum + (t.amount || 0), 0);
    const currentBalance = totalEarned - totalRedeemed;

    return NextResponse.json({
      transactions: txList,
      totalEarned,
      totalRedeemed,
      currentBalance,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Internal server error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
