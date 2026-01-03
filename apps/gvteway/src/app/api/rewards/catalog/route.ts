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

    const { data: rewards, error: rewardsError } = await supabase
      .from("rewards_catalog")
      .select("id, name, description, type, points_required, availability, expires_at")
      .order("points_required", { ascending: true });

    if (rewardsError && rewardsError.code !== "42P01") {
      return NextResponse.json({ error: rewardsError.message }, { status: 500 });
    }

    const { data: userRewards } = await supabase
      .from("rewards_transactions")
      .select("amount, type")
      .eq("user_id", user.id);

    const txList = userRewards || [];
    const totalEarned = txList
      .filter((t) => t.type === "earned")
      .reduce((sum, t) => sum + (t.amount || 0), 0);
    const totalRedeemed = txList
      .filter((t) => t.type === "redeemed")
      .reduce((sum, t) => sum + (t.amount || 0), 0);
    const userPoints = totalEarned - totalRedeemed;

    const rewardsList = rewards || [];
    const availableCount = rewardsList.filter((r) => r.availability === "available").length;

    return NextResponse.json({
      rewards: rewardsList,
      user_points: userPoints,
      available_count: availableCount,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Internal server error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
