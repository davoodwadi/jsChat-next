import Stripe from "stripe";
import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { connectToDatabase } from "@/lib/db";
import { MongoError } from "mongodb";
import { headers } from "next/headers";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY as string);
export async function POST(request: NextRequest) {
  // 1. Get the host from headers
  const head = await headers();
  const host = head.get("host") || "";
  const protocol = host.includes("local") ? "http://" : "https://";
  const baseUrl = protocol + host;
  console.log("baseUrl", baseUrl);

  try {
    // you can implement some basic check here like, is user valid or not
    const client = await connectToDatabase();
    if (!client) {
      console.error("Database connection failed");
      return NextResponse.json({ result: null, ok: false });
    }
    const collection = client.db("next").collection("checkouts");
    const session = await auth();
    const user = session?.user;
    if (!user || !user?.email) {
      console.error("No user or user does not have email");
      return NextResponse.json({ result: null, ok: false });
    }

    const data = await request.json();
    const priceId = data.priceId;
    // Check if priceId is valid
    if (typeof priceId !== "string" || priceId.trim() === "") {
      console.error("Price ID is required and must be a non-empty string");
      return NextResponse.json({ result: null, ok: false });
    }
    const lineItems = [
      {
        price: priceId,
        quantity: 1,
      },
    ];
    const metadata = {
      userId: user.email,
      priceId,
    };
    const checkoutSession: Stripe.Checkout.Session =
      await stripe.checkout.sessions.create({
        // payment_method_types: ["card"],
        line_items: lineItems,
        mode: "payment",
        success_url: `${baseUrl}/payment/success?session_id={CHECKOUT_SESSION_ID}`,
        cancel_url: `${baseUrl}/payment/failure?session_id={CHECKOUT_SESSION_ID}`,
        metadata: metadata,
      });
    console.log("checkoutSession.status", checkoutSession.status);
    try {
      const resp = await collection.insertOne(checkoutSession);
      console.log("checkoutSession added", resp);
    } catch (error) {
      if (error instanceof MongoError && error?.code === 11000) {
        console.error("duplicate checkout id", error);
      } else if (error instanceof MongoError) {
        console.error("db op failed:", error?.code, error);
      } else {
        console.error("db op failed with unknown error:", error);
      }
    }

    return NextResponse.json({ result: checkoutSession, ok: true });
  } catch (error) {
    console.log(error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}
