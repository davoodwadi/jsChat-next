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

export async function generateDummmy(id) {
  // const stream = new ReadableStream({
  //   start(controller) {
  //     // Function to enqueue data with a delay
  //     const enqueueWithDelay = (data, delay) => {
  //       return new Promise((resolve) => {
  //         setTimeout(() => {
  //           controller.enqueue(new TextEncoder().encode(data));
  //           resolve();
  //         }, delay);
  //       });
  //     };

  //     // Create an async function to handle the streaming
  //     const streamData = async () => {
  //       await enqueueWithDelay("Hello ", 2000); // Wait 2 seconds
  //       await enqueueWithDelay("World", 2000); // Wait 2 seconds
  //       controller.close(); // Close the stream
  //     };

  //     // Start streaming the data
  //     streamData();
  //   },
  // });
  const stream = createStreamableValue("");
  (async () => {
    // returns "", "Hello ", "world ", "man "
    // const s = `${id} Hello world man late later `;
    const s = `${id} Optimistically updating forms 
The useOptimistic Hook provides a way to optimistically update the user interface before a background operation, like a network request, completes. In the context of forms, this technique helps to make apps feel more responsive. When a user submits a form, instead of waiting for the server’s response to reflect the changes, the interface is immediately updated with the expected outcome.

\`\`\`jsx
import numpy as np
print(np.mean([1,2,3,4,5,6,7,1,2,3,4,5,6,7,1,2,3,4,5,6,7,1,2,3,4,5,6,7,1,2,3]))
\`\`\`

For example, when a user types a message into the form and hits the “Send” button, the useOptimistic Hook allows the message to immediately appear in the list with a “Sending…” label, even before the message is actually sent to a server. This “optimistic” approach gives the impression of speed and responsiveness. The form then attempts to truly send the message in the background. Once the server confirms the message has been received, the “Sending…” label is removed.`;
    // Split the string at whitespace
    const splitString = s.split(/\s+/);

    // Loop through the array and log each substring
    // splitString.forEach(async (word, index) => {
    //   await wait(100);
    //   console.log(`Substring ${index}: ${word}`);
    //   stream.update(word);
    // });
    for (const char of s) {
      await wait(10);
      console.log(`Substring: ${char}`);
      stream.update(char);
    }

    stream.done();
  })();

  return { output: stream.value, status: "ok" };
}

export async function generate({ messages, model }) {
  const session = await auth();
  if (test) {
    // console.log("session", session);
  }
  if (!session?.user) {
    return { output: null, status: "Not Authenticated" };
  }
  const stream = createStreamableValue("");
  if (test) {
    // console.log("server messages:", messages);
  }
  (async () => {
    const { fullStream } = streamText({
      model: openai(model),
      messages: messages,
      maxTokens: 2000,
    });
    // START: simulate wait
    // console.log("waiting: 4000ms");
    // await wait(4000);
    // console.log("done: 4000ms");

    // END: simulate wait

    for await (const delta of fullStream) {
      if (test) {
        // console.log("server delta.type:", delta.type);
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
