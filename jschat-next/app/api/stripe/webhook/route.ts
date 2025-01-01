import Stripe from "stripe";
import { NextRequest } from "next/server";
import { headers } from "next/headers";
import { connectToDatabase } from "@/lib/db";
import { MongoError } from "mongodb";

type METADATA = {
  userId: string;
  priceId: string;
};
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);

export async function POST(request: NextRequest) {
  const body = await request.text();
  const endpointSecret = process.env.STRIPE_SECRET_WEBHOOK_KEY!;
  const headerList = await headers();
  //   console.log("headerList", typeof headerList)
  //   for (const [key, value] of headerList.entries()) {
  //     console.log(`${key}: ${value}`)
  //   }
  const sig = headerList.get("stripe-signature") as string;
  //   console.log("sig", sig)
  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(body, sig, endpointSecret);
    // event: type, data{object:{id, amount, object, status: 'succeeded'}}
    console.log("event", event);
  } catch (err) {
    return new Response(`Webhook Error: ${err}`, {
      status: 400,
    });
  }

  const eventType = event.type;
  //   console.log("eventType", eventType)
  if (
    eventType !== "checkout.session.completed" &&
    eventType !== "checkout.session.async_payment_succeeded"
  )
    return new Response("Unmonitored Event", {
      status: 200,
    });
  // eventType is checkout.session.completed or checkout.session.async_payment_succeeded
  const data = event.data.object;

  try {
    // database update here
    console.log("WEBHOOK data", data);
    // connect to payments collection
    const client = await connectToDatabase();
    if (!client) {
      console.error("Database connection failed");
      return new Response("client is undefined", {
        status: 500,
      });
    }
    const collection = client.db("next").collection("webhooks");
    try {
      const resp = await collection.insertOne(data);
      console.log("webhook data added", resp);
    } catch (error) {
      if (error instanceof MongoError && error?.code === 11000) {
        console.error("duplicate webhook id", error);
      } else if (error instanceof MongoError) {
        console.error("webhook db op failed:", error?.code, error);
      } else {
        console.error("webhook db op failed UNKNOWN ERROR TYPE:", error);
      }
    }

    // data.id should match checkoutSession.id
    return new Response("Subscription added", {
      status: 200,
    });
  } catch (error) {
    return new Response("Server error while updating database", {
      status: 500,
    });
  }
}
