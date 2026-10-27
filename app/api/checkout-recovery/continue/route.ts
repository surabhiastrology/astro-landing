import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import { CheckoutRecovery, hashRecoveryToken } from "@/lib/checkout-recovery";

export async function GET(req: NextRequest) {
  const token = req.nextUrl.searchParams.get("token") || "";
  const fallback = new URL("/checkout", req.url);
  if (!/^[a-f0-9]{64}$/.test(token)) return NextResponse.redirect(fallback);
  await connectDB();
  const recovery = await CheckoutRecovery.findOne({
    tokenHash: hashRecoveryToken(token),
    environment: "preview",
    sentAt: { $exists: true },
  });
  if (!recovery) return NextResponse.redirect(fallback);
  await CheckoutRecovery.updateOne({ _id: recovery._id, clickedAt: { $exists: false } }, { $set: { clickedAt: new Date() } });
  fallback.searchParams.set("service", recovery.service);
  fallback.searchParams.set("plan", recovery.plan);
  fallback.searchParams.set("recovery", token);
  return NextResponse.redirect(fallback);
}
