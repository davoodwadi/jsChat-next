import Stripe from "stripe";
import { NextRequest, NextResponse } from "next/server";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY as string);

export async function POST(request: NextRequest) {
  const session_id = await request.json();
  console.log("session_id to expire...", session_id);
  const session = await stripe.checkout.sessions.expire(session_id);
}
