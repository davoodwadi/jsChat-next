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
    { username: email }, // Ensure we are looking for the correct chatId in the sessions array
    {
      projection: {
        username: 1,
        tokensRemaining: 1,
        sessions: {
          $filter: {
            input: "$sessions",
            as: "session",
            cond: { $eq: ["$$session.chatid", chatId] }, // Filter sessions to find the one with the matching chatId
          },
        },
      },
    }
  );
  if (results.sessions[0]) {
    console.log("results.sessions[0]", results.sessions[0]);
    return results.sessions[0];
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
    [
      {
        $set: {
          sessions: {
            $cond: {
              if: { $in: [chatId, "$sessions.chatid"] },
              then: {
                $map: {
                  input: "$sessions",
                  as: "session",
                  in: {
                    $cond: {
                      if: { $eq: ["$$session.chatid", chatId] },
                      then: {
                        chatid: chatId,
                        content: {
                          userMessages,
                          botMessages,
                        },
                      },
                      else: "$$session",
                    },
                  },
                },
              },
              else: {
                $concatArrays: [
                  "$sessions",
                  [
                    {
                      chatid: chatId,
                      content: {
                        userMessages,
                        botMessages,
                      },
                    },
                  ],
                ],
              },
            },
          },
        },
      },
    ],
    {
      returnDocument: "after", // Return the document after the update
      projection: {
        username: 1,
        tokensRemaining: 1,
        // sessions: { $slice: -1 },
      },
    }
  );

  console.log("results", results);
}
