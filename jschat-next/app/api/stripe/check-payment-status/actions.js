"use server";
import { auth } from "@/auth";
import { connectToDatabase } from "@/lib/db";

export async function getTokens(session_id) {
  const session = await auth();
  const client = await connectToDatabase();
  const plansCollection = client.db("chat").collection("plans");
  const checkoutsCollection = client.db("next").collection("checkouts");
  const tokens = await plansCollection.findOne(
    { username: session?.user?.email },
    { projection: { email: 1, tokensRemaining: 1 } }
  );
  // console.log("session_id", session_id);
  const transaction = await checkoutsCollection.findOne(
    { id: session_id },
    {
      projection: {
        amount_total: 1,
        id: 1,
        currency: 1,
        metadata: 1,
        created: 1,
      },
    }
  );
  // console.log("transaction", transaction);
  const timestamp = transaction?.created;
  const date = new Date(timestamp * 1000).toString();
  return {
    tokens: tokens?.tokensRemaining,
    email: transaction?.metadata?.userId,
    amount: transaction?.amount_total,
    currency: transaction?.currency,
    date: date,
  };
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
