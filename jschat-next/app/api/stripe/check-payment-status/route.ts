import { NextRequest, NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/db";
import { addUserToken } from "@/lib/actions";
import { auth } from "@/auth";
import { sendEmail } from "@/lib/actions";

export async function GET(request: NextRequest) {
  const session = await auth();
  const searchParams = request.nextUrl.searchParams;
  const session_id = searchParams.get("session_id");

  const client = await connectToDatabase();
  if (!client) {
    console.error("Database connection failed");

    return NextResponse.json({ error: "client is undefined" }, { status: 500 });
  }
  const webhookCollection = client.db("next").collection("webhooks");
  const plansCollection = client.db("chat").collection("plans");

  try {
    const resp = await webhookCollection.findOne(
      { id: session_id },
      {
        projection: {
          id: 1,
          metadata: 1,
          addedToAccount: 1,
          amount_total: 1,
          currency: 1,
          created: 1,
        },
      }
    );
    // console.log("resp", resp);
    const timestamp = resp?.created;
    // console.log("timestamp", typeof timestamp);
    const date = new Date(timestamp * 1000).toString();
    // console.log("date", date);
    const currency = resp?.currency;
    const amount = resp?.amount_total;
    if (resp) {
      // found the event
      console.log("webhook resp", resp);
      console.log("webhook resp.metadata?.userId", resp.metadata?.userId);
      const email = resp?.metadata?.userId;
      if (!resp.addedToAccount) {
        // fresh payment
        await webhookCollection.updateOne(
          { id: session_id },
          {
            $set: {
              addedToAccount: true,
            },
          }
        );
        const res = await addUserToken({ email }); // return email, tokensRemaining
        console.log(
          "tokens updated for email",
          res.email,
          res.email === email,
          res.tokensRemaining
        );
        // send email
        sendEmail({
          status: "success",
          sessionId: session_id,
          tokensRemaining: res.tokensRemaining,
          email: email,
          date: date,
          amount,
          currency,
        });
        //
        return NextResponse.json(
          { message: "success", newTokens: res.tokensRemaining, email: email },
          { status: 201 }
        );
      } else {
        // expired payment
        const res = await plansCollection.findOne(
          { username: email },
          { projection: { email: 1, tokensRemaining: 1 } }
        );
        if (!res) {
          return NextResponse.json(
            { message: "res not found", newTokens: null, email: null },
            { status: 401 }
          );
        } else {
          return NextResponse.json(
            {
              message: "expired",
              newTokens: res.tokensRemaining,
              email: email,
            },
            { status: 201 }
          );
        }
      }
    } else {
      // not found the event
      // get current tokens and send
      console.log("not found the event yet");
      const tokens = await plansCollection.findOne(
        { username: session?.user?.email },
        { projection: { email: 1, tokensRemaining: 1 } }
      );
      // console.log("tokens", tokens);
      if (!tokens) {
        return NextResponse.json(
          { message: "tokens not found", newTokens: null, email: null },
          { status: 401 }
        );
      } else {
        return NextResponse.json(
          {
            message: "pending",
            newTokens: tokens.tokensRemaining,
            email: tokens.email,
          },
          { status: 200 }
        );
      }
    }
  } catch (e) {
    console.error(e);
    return NextResponse.json(
      { error: "Error fetching payment." },
      { status: 400 }
    );
  }

  // query is "hello" for /api/search?query=hello
}
