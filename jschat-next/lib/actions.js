"use server";

import { streamText } from "ai";
import { openai } from "@ai-sdk/openai";
import { createStreamableValue } from "ai/rsc";
import { auth, signIn } from "@/auth";
import { AuthError } from "next-auth";
import { connectToDatabase } from "@/lib/db";
import { cookies } from "next/headers";
import { test } from "@/lib/test";
import { createDeepInfra } from "@ai-sdk/deepinfra";

const deepinfra = createDeepInfra({
  apiKey: process.env.DEEPINFRA_TOKEN,
});

export async function addUserToken({ email }) {
  const client = await connectToDatabase();
  const plansCollection = client.db("chat").collection("plans");
  const results = await plansCollection.findOneAndUpdate(
    { username: email },
    { $inc: { tokensRemaining: 100000 } },
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

export async function getSessionTokensLeft() {
  const session = await auth();
  const email = session?.user?.email;
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
  return { tokensRemaining: result.tokensRemaining, status: "ok" };
}

export async function getSessionTokensRemaining() {
  const session = await auth();
  const email = session?.user?.email;

  const client = await connectToDatabase();
  const plansCollection = client.db("chat").collection("plans");
  const result = await plansCollection.findOne(
    { username: email },
    {
      projection: {
        tokensRemaining: 1,
      },
    }
  );
  return { tokensRemaining: result.tokensRemaining, status: "ok" };
}

export async function decreaseSessionTokensRemaining(amount) {
  if (!amount) {
    return { tokensRemaining: null, status: "error" };
  }
  const session = await auth();
  const email = session?.user?.email;

  const client = await connectToDatabase();
  const plansCollection = client.db("chat").collection("plans");
  const result = await plansCollection.findOneAndUpdate(
    { username: email },
    {
      $inc: { tokensRemaining: -amount },
    },
    {
      returnDocument: "after",
      projection: { tokensRemaining: 1 },
    }
  );
  return { tokensRemaining: result.tokensRemaining, status: "ok" };
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

export async function generateDummmy(id, model) {
  const session = await auth();
  const tokensRemaining = await checkTokensRemaining();
  console.log("model", id, model);
  if (tokensRemaining <= 100000) {
    return { output: null, status: "Not Enough Tokens" };
  }
  if (test) {
    console.log("session generate", session);
  }
  if (!session?.user) {
    return { output: null, status: "Not Authenticated" };
  }

  const stream = createStreamableValue("");

  streamDummyFunction(stream, id);

  return { output: stream.value, status: "ok" };
}

async function checkTokensRemaining() {
  const tokensRemaining = await getSessionTokensRemaining();
  return tokensRemaining.tokensRemaining;
}

async function streamDummyFunction(stream, id) {
  console.log("START streamDummyFunction ");
  const s = `${id} Optimistically updating forms 
The useOptimistic Hook provides a way to optimistically update the user interface before a background operation, like a network request, completes. In the context of forms, this technique helps to make apps feel more responsive. When a user submits a form, instead of waiting for the server’s response to reflect the changes, the interface is immediately updated with the expected outcome.

\`\`\`jsx
import numpy as np
print(np.mean([1,2,3,4,5,6,7,1,2,3,4,5,6,7,1,2,3,4,5,6,7,1,2,3,4,5,6,7,1,2,3]))
\`\`\`

For example, when a user types a message into the form and hits the “Send” button, the useOptimistic Hook allows the message to immediately appear in the list with a “Sending…” label, even before the message is actually sent to a server. This “optimistic” approach gives the impression of speed and responsiveness. The form then attempts to truly send the message in the background. Once the server confirms the message has been received, the “Sending…” label is removed.`;

  const chunkSize = 15;
  for (let i = 0; i < s.length; i += chunkSize) {
    await wait(10);
    const char = s.substring(i, i + chunkSize);
    // console.log(`Substring: ${char}`);
    stream.update(char);
  }
  const amount = 250;
  const newTokensRemaining = await decreaseSessionTokensRemaining(amount);
  if (newTokensRemaining.status !== "ok") {
    console.log("newTokensRemaining.status not ok", newTokensRemaining.status);
  } else {
    console.log("newTokensRemaining.status", newTokensRemaining.status);
  }
  // console.log(
  //   "streamDummyFunction newTokensRemaining.tokensRemaining ",
  //   newTokensRemaining.tokensRemaining
  // );

  console.log("END streamDummyFunction ");

  stream.done();
}

export async function generateTestDummmy() {
  const stream = createStreamableValue("");
  let char;
  (async () => {
    "use server";
    await wait(2000);
    char = "1s";
    console.log(`Substring: ${char}`);
    stream.update(char);

    await wait(5000);
    char = "2s";
    console.log(`Substring: ${char}`);
    stream.update(char);

    await wait(5000);
    char = "3s";
    console.log(`Substring: ${char}`);
    stream.update(char);

    stream.done();
  })();
  console.log("server done");

  return { output: stream.value, status: "ok" };
}

async function streamFunction(stream, messages, model) {
  // console.log("streamFunction model: ", model);
  let result;
  if (model.includes("gpt")) {
    // console.log("gpt");
    result = streamText({
      model: openai(model),
      messages: messages,
    });
  } else {
    // console.log("deepinfra");

    result = streamText({
      model: deepinfra("deepseek-ai/DeepSeek-R1"),
      messages: messages,
    });
  }
  const fullStream = result.fullStream;

  let totalTokens;
  for await (const delta of fullStream) {
    if (test) {
      // console.log("server delta.type:", delta.type);
    }
    if (delta.type === "finish") {
      // count tokens and update database for user
      console.log("delta.usage.totalTokens", delta.usage.totalTokens);
      totalTokens = delta.usage.totalTokens;
    } else if (delta.type === "text-delta") {
      stream.update(delta.textDelta);
    } else if (delta.type === "error") {
      console.log("ERROR in LLM:", delta.error);
      stream.done();
      break;
    }
  }
  console.log("totalTokens", totalTokens);
  const newTokensRemaining = await decreaseSessionTokensRemaining(totalTokens);
  if (newTokensRemaining.status !== "ok") {
    console.log("newTokensRemaining.status not ok", newTokensRemaining.status);
  } else {
    console.log("newTokensRemaining.status ok", newTokensRemaining.status);
  }
  stream.done();
}

export async function generate({ messages, model }) {
  const session = await auth();
  // console.log("test", test);
  if (test) {
    // console.log("session generate", session);
  }
  if (!session?.user) {
    return { output: null, status: "Not Authenticated" };
  }

  const tokensRemaining = await checkTokensRemaining();
  if (tokensRemaining <= 0) {
    return { output: null, status: "Not Enough Tokens" };
  }

  const stream = createStreamableValue("");
  if (test) {
    // console.log("server messages:", messages);
  }

  streamFunction(stream, messages, model);

  return { output: stream.value, status: "ok" };
}

export async function wait(duration) {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve(`waited ${duration}`);
    }, duration);
  });
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
