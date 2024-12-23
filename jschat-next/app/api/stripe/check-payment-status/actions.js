"use server";
import { auth } from "@/auth";
import { connectToDatabase } from "@/lib/db";

export async function getTokens() {
  const session = await auth();
  const client = await connectToDatabase();
  const plansCollection = client.db("chat").collection("plans");
  const tokens = await plansCollection.findOne(
    { username: session?.user?.email },
    { projection: { email: 1, tokensRemaining: 1 } }
  );
  // console.log("tokens", tokens);
  return tokens?.tokensRemaining;
}

export async function getStatus({ session_id, retries }) {
  console.log("num retries", retries);
  const session = await auth();
  const client = await connectToDatabase();
  const webhookCollection = client.db("next").collection("webhooks");
  const payment = await webhookCollection.findOne(
    { id: session_id },
    { projection: { id: 1, metadata: 1, addedToAccount: 1 } }
  );
  console.log("payment", payment);
  await new Promise((resolve) => setTimeout(resolve, 3000));
  if (!payment) {
    return null;
  }

  return payment?.metadata?.userId;
}
