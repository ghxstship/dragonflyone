import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { z } from "zod";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

const redeemSchema = z.object({
  reward_id: z.string().min(1),
});

export async function POST(request: NextRequest) {
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

    const body = await request.json();
    const validation = redeemSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        { error: "Validation failed", details: validation.error.flatten() },
        { status: 422 }
      );
    }

    const { reward_id } = validation.data;

    const { data: reward, error: rewardError } = await supabase
      .from("rewards_catalog")
      .select("id, name, points_required, availability")
      .eq("id", reward_id)
      .single();

    if (rewardError || !reward) {
      return NextResponse.json({ error: "Reward not found" }, { status: 404 });
    }

    if (reward.availability !== "available") {
      return NextResponse.json({ error: "Reward is not available" }, { status: 400 });
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

    if (userPoints < reward.points_required) {
      return NextResponse.json(
        { error: "Insufficient points", required: reward.points_required, available: userPoints },
        { status: 400 }
      );
    }

    const { error: txError } = await supabase
      .from("rewards_transactions")
      .insert({
        user_id: user.id,
        type: "redeemed",
        amount: reward.points_required,
        description: `Redeemed: ${reward.name}`,
        source: "reward_redemption",
        date: new Date().toISOString(),
      });

    if (txError) {
      return NextResponse.json({ error: txError.message }, { status: 500 });
    }

    const { error: redemptionError } = await supabase
      .from("user_reward_redemptions")
      .insert({
        user_id: user.id,
        reward_id: reward.id,
        points_spent: reward.points_required,
        redeemed_at: new Date().toISOString(),
      });

    if (redemptionError && redemptionError.code !== "42P01") {
      console.error("Failed to record redemption:", redemptionError);
    }

    return NextResponse.json({
      success: true,
      message: `Successfully redeemed ${reward.name}`,
      points_spent: reward.points_required,
      remaining_points: userPoints - reward.points_required,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Internal server error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
