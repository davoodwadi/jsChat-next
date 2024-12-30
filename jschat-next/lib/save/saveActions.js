"use server";

import { auth } from "@/auth";
import { connectToDatabase } from "@/lib/db";

export async function loadChatSession({ chatId }) {
  console.log("SERVER ACTION load", chatId);
  const session = await auth();
  const email = session?.user?.email;
  console.log("email", email);
  const client = await connectToDatabase();
  const plansCollection = client.db("chat").collection("plans");
  const results = await plansCollection.findOne(
    { username: email, "lastSession.chatid": chatId },
    {
      projection: { username: 1, lastSession: 1, tokensRemaining: 1 }, // Only return the tokensRemaining field
    }
  );
  if (results) {
    // console.log("results", results);
    return results.lastSession;
  } else {
    return;
  }
}

export async function saveChatSession({
  chatId,
  userMessagesJSON,
  botMessagesJSON,
  userMessages,
  botMessages,
}) {
  console.log("SERVER ACTION save", chatId);
  // console.log("SERVER ACTION userMessages", userMessagesJSON);
  // console.log("SERVER ACTION userMessages", userMessages);
  const session = await auth();
  const email = session?.user?.email;
  console.log("email", email);
  const client = await connectToDatabase();
  const plansCollection = client.db("chat").collection("plans");
  const results = await plansCollection.findOneAndUpdate(
    { username: email },
    {
      $set: {
        lastSession: {
          chatid: chatId,
          content: {
            userMessages,
            botMessages,
          },
        },
      },
    },
    {
      returnDocument: "after", // Return the document after the update
      projection: { username: 1, "lastSession.chatid": 1, tokensRemaining: 1 }, // Only return the tokensRemaining field
    }
  );
  console.log("results", results);
}
