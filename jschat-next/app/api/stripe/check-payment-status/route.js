import { NextRequest, NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/db";
import { addUserToken } from "@/lib/actions";
import { auth } from "@/auth";

export async function GET(request) {
  const session = await auth();
  const searchParams = request.nextUrl.searchParams;
  const session_id = searchParams.get("session_id");

  const client = await connectToDatabase();
  const webhookCollection = client.db("next").collection("webhooks");
  const plansCollection = client.db("chat").collection("plans");

  try {
    const resp = await webhookCollection.findOne(
      { id: session_id },
      { projection: { id: 1, metadata: 1, addedToAccount: 1 } }
    );
    if (resp) {
      // found the event
      console.log("webhook resp", resp);
      console.log("webhook resp.metadata?.userId", resp.metadata?.userId);
      const email = resp.metadata?.userId;
      if (!resp.addedToAccount) {
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
        return NextResponse.json(
          { message: "success", newTokens: res.tokensRemaining, email: email },
          { status: 201 }
        );
      } else {
        const res = await plansCollection.findOne(
          { username: email },
          { projection: { email: 1, tokensRemaining: 1 } }
        );
        return NextResponse.json(
          { message: "expired", newTokens: res.tokensRemaining, email: email },
          { status: 201 }
        );
      }
    } else {
      // not found the event
      // get current tokens and send
      console.log("not found the event");
      const tokens = await plansCollection.findOne(
        { username: session?.user?.email },
        { projection: { email: 1, tokensRemaining: 1 } }
      );
      console.log("tokens", tokens);
      return NextResponse.json(
        { message: "pending", newTokens: tokens.tokensRemaining, email: email },
        { status: 200 }
      );
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
