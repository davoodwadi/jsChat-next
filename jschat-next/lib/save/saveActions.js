"use server";

import { auth } from "@/auth";
import { connectToDatabase } from "@/lib/db";

const chatId = "8g2tcoyirak-m723viv8";
const chatText = "Hello sir";
const chatSessions = [
  {
    title: chatText,
    url: `/chat/${chatId}`,
  },

  {
    title: chatText,
    url: `/chat/${chatId}`,
  },
];

export async function loadAllChatSessions() {
  const session = await auth();
  const email = session?.user?.email;
  console.log("loadAllChatSessions email", email);
  return chatSessions;
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
  console.log("results", results);
  if (!results.sessions) {
    console.log("results.sessions null", results.sessions);

    return;
  } else if (!results.sessions[0]) {
    console.log("results.sessions[0] null", results.sessions[0]);

    return;
  } else {
    return results.sessions[0];
  }
}

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
  console.log("results", results);
  if (!results.sessions) {
    console.log("results.sessions null", results.sessions);

    return;
  } else if (!results.sessions[0]) {
    console.log("results.sessions[0] null", results.sessions[0]);

    return;
  } else {
    return results.sessions[0];
  }
}

export async function saveChatSession({ chatId, userMessages, botMessages }) {
  console.log("SERVER ACTION save", chatId);
  const session = await auth();
  const email = session?.user?.email;
  console.log("email", email);
  console.log("email", userMessages);
  console.log("email", botMessages);
  const client = await connectToDatabase();
  const plansCollection = client.db("chat").collection("plans");
  const results = await plansCollection.findOneAndUpdate(
    { username: email },
    [
      {
        $set: {
          sessions: {
            $cond: {
              if: {
                $and: [
                  { $eq: [{ $type: "$sessions" }, "array"] }, // Check if it's an array
                  { $gt: [{ $size: "$sessions" }, 0] }, // Ensure there are existing sessions
                  { $in: [chatId, "$sessions.chatid"] },
                ],
              },
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
                  { $ifNull: ["$sessions", []] }, // Initialize as an empty array if null
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

  // console.log("results", results);
}
