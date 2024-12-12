"use server";

import { streamText } from "ai";
import { openai } from "@ai-sdk/openai";
import { createStreamableValue } from "ai/rsc";
import { auth, signIn } from "@/auth";
import { AuthError } from "next-auth";
import { connectToDatabase } from "@/lib/db";
import { test } from "@/lib/test";

export async function addUserToken({ email }) {
  const client = await connectToDatabase();
  const plansCollection = client.db("chat").collection("plans");
  const results = await plansCollection.findOneAndUpdate(
    { username: email },
    { $inc: { tokensRemaining: 10000 } },
    {
      returnDocument: "after", // Return the document after the update
      projection: { tokensRemaining: 1 }, // Only return the tokensRemaining field
    }
  );
  if (test) {
    console.log(results, "results");
  }
  return { email: email, tokensRemaining: results.tokensRemaining };
  // const userDb = results[0]
  // return userDb.tokensRemaining
}

export async function getUserTokensLeft({ user }) {
  const email = user?.email;
  // const email = "davoodwadi@gmail.com"

  const client = await connectToDatabase();
  const plansCollection = client.db("chat").collection("plans");
  const result = await plansCollection.findOne(
    { username: email },
    {
      projection: {
        tokensRemaining: 1,
        tokensConsumed: 1,
        quotaRefreshedAt: 1,
        lastLogin: 1,
        createdAt: 1,
      },
    }
  );
  return { user: result, status: "ok" };
}

export async function generate({ messages, model }) {
  const session = await auth();
  if (test) {
    console.log("session", session);
  }
  if (!session?.user) {
    return { output: null, status: "Not Authenticated" };
  }
  const stream = createStreamableValue("");
  if (test) {
    console.log("server messages:", messages);
  }
  (async () => {
    const { fullStream } = streamText({
      model: openai(model),
      messages: messages,
      maxTokens: 2000,
    });

    for await (const delta of fullStream) {
      if (test) {
        console.log("server delta.type:", delta.type);
      }
      if (delta.type === "finish") {
        // count tokens and update database for user
        console.log("delta.usage.totalTokens", delta.usage.totalTokens);
      } else if (delta.type === "text-delta") {
        stream.update(delta.textDelta);
      } else if (delta.type === "error") {
        console.log("ERROR in LLM:", delta.error);
        stream.done();
        break;
      }
    }

    stream.done();
  })();

  return { output: stream.value, status: "ok" };
}

export async function signInClientAction({ providerId }) {
  try {
    const resp = await signIn(
      providerId
      // provider.id
      // {
      //   redirectTo: props.searchParams?.callbackUrl ?? "",
      // }
    );
    console.log("sign in action resp:", resp);
  } catch (error) {
    // Signin can fail for a number of reasons, such as the user
    // not existing, or the user not having the correct role.
    // In some cases, you may want to redirect to a custom error
    if (error instanceof AuthError) {
      return "error";
      // return redirect(`${SIGNIN_ERROR_URL}?error=${error.type}`);
    }

    // Otherwise if a redirects happens Next.js can handle it
    // so you can just re-thrown the error and let Next.js handle it.
    // Docs:
    // https://nextjs.org/docs/app/api-reference/functions/redirect#server-component
    throw error;
  }
}
