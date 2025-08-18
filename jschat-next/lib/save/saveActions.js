"use server";

import { auth } from "@/auth";
import { connectToDatabase } from "@/lib/db";
import { ObjectId } from "mongodb";

export async function clearAllChatSessions() {
  const session = await auth();
  const email = session?.user?.email;
  // console.log("clearAllChatSessions email", email);
  if (!email) {
    return null;
  }
  const client = await connectToDatabase();
  const plansCollection = client.db("chat").collection("plans");
  const result = await plansCollection.updateOne(
    { username: email }, // Ensure we are looking for the correct username
    {
      $set: {
        "sessions.$[].hidden": true, // Set hidden attribute to true for each session
      },
    }
  );
  // console.log("clearAllChatSessions result", result);
}

export async function loadAllChatSessions() {
  const session = await auth();
  const email = session?.user?.email;
  const chatSessionUserId = session?.user?.chatSessionUserId;
  // console.log("loadAllChatSessions chatSessionUserId", chatSessionUserId);
  // console.log("loadAllChatSessions email", email);
  if (!email) {
    return null;
  }
  const client = await connectToDatabase();
  // const sessionsCollection = client.db("chat").collection("sessions");
  // Start aggregation from PLANS collection, not sessions
  const sessionsCollection = client.db("chat").collection("sessions");
  const sessions = await sessionsCollection
    .find({
      userId: new ObjectId(chatSessionUserId),
      hidden: { $ne: true },
    })
    .sort({ sortOrder: 1 })
    .toArray();
  // console.log("sessions", sessions);
  const serializedSessions = sessions.map((session) =>
    serializeSession(session)
  );

  if (serializedSessions.length === 0) {
    console.log("No sessions found for the user");
    return null;
  }

  return serializedSessions || [];
}

export async function loadChatSession({ chatId }) {
  // console.log("SERVER ACTION load", chatId);
  const session = await auth();
  const email = session?.user?.email;
  const chatSessionUserId = session?.user?.chatSessionUserId;
  // console.log("email", email);
  const client = await connectToDatabase();
  const sessionsCollection = client.db("chat").collection("sessions");
  const results = await sessionsCollection.findOne(
    { userId: new ObjectId(chatSessionUserId), chatid: chatId }, // Ensure we are looking for the correct chatId in the sessions array
    {
      // projection: {
      //   username: 1,
      //   tokensRemaining: 1,
      //   sessions: {
      //     $filter: {
      //       input: "$sessions",
      //       as: "session",
      //       cond: { $eq: ["$$session.chatid", chatId] }, // Filter sessions to find the one with the matching chatId
      //     },
      //   },
      // },
    }
  );
  // console.log("results", results);
  if (!results) {
    // console.log("results.sessions null");
    return;
  } else {
    const serializedSession = serializeSession(results);
    return serializedSession;
  }
}

export async function saveChatSession(params) {
  console.log("SERVER ACTION save systemPrompt", params.systemPrompt);
  const session = await auth();
  const email = session?.user?.email;
  const chatSessionUserId = session?.user?.chatSessionUserId;
  // console.log("email", email);
  // console.log("email", userMessages);
  // console.log("email", botMessages);
  const content = params;
  // console.log("content to be saved", content);
  const chatId = params.chatId || params.canvasId;
  console.log("chatId", chatId);
  // return;
  const client = await connectToDatabase();
  const sessionsCollection = client.db("chat").collection("sessions");
  // Check if session already exists (update) or is new (create)
  const existingSession = await sessionsCollection.findOne({ chatid: chatId });

  if (existingSession) {
    // Update existing session
    const updateResult = await sessionsCollection.findOneAndUpdate(
      { chatid: chatId },
      {
        $set: {
          content: content,
          updatedAt: new Date(),
          // Ensure user ownership
          userId: new ObjectId(chatSessionUserId),
          userEmail: email,
        },
      },
      {
        returnDocument: "after",
        upsert: false,
      }
    );

    // console.log("Session updated:", updateResult.chatid);
    // console.log("Session updated:", updateResult);
    return {
      success: true,
      chatId: chatId,
      action: "updated",
      // session: serializeSession(updateResult.value),
    };
  } else {
    // Create new session - need to determine sortOrder
    const userSessionCount = await sessionsCollection.countDocuments({
      userId: new ObjectId(chatSessionUserId),
    });

    const newSession = {
      _id: chatId,
      userId: new ObjectId(chatSessionUserId),
      userEmail: email,
      chatid: chatId,
      content: content,
      hidden: false,
      sortOrder: userSessionCount, // Next position in the sequence
      createdAt: new Date(),
      updatedAt: new Date(),
      migratedAt: null, // This is a new session, not migrated
      originalArrayPosition: null,
    };

    const insertResult = await sessionsCollection.insertOne(newSession);

    // console.log("New session created:", insertResult.insertedId);
    return {
      success: true,
      chatId: chatId,
      action: "created",
      // session: serializeSession(newSession),
    };
  }

  // console.log("results", results);
}

function serializeSession(session) {
  // Convert MongoDB objects to plain objects
  return {
    _id: session._id.toString(), // Convert ObjectId to string
    userId: session.userId.toString(), // Convert ObjectId to string
    userEmail: session.userEmail,
    chatid: session.chatid,
    content: session.content,
    hidden: session.hidden,
    sortOrder: session.sortOrder,
    createdAt: session.createdAt?.toISOString(), // Convert Date to ISO string
    updatedAt: session.updatedAt?.toISOString(), // Convert Date to ISO string
    migratedAt: session.migratedAt?.toISOString(), // Convert Date to ISO string
    originalArrayPosition: session.originalArrayPosition,
  };
}
