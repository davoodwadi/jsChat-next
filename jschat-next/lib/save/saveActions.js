"use server";

import { auth } from "@/auth";
import { connectToDatabase } from "@/lib/db";
import { ObjectId } from "mongodb";
import { revalidatePath } from "next/cache";

export async function getBookmarkStatus({ chatId }) {
  const session = await auth();
  const chatSessionUserId = session?.user?.chatSessionUserId;
  // if (!chatSessionUserId) throw new Error("Unauthorized");
  // console.log("chatSessionUserId", chatSessionUserId);
  // console.log("chatId", chatId);
  const client = await connectToDatabase();
  const sessionsCollection = client.db("chat").collection("sessions");
  // Find current record
  const doc = await sessionsCollection.findOne({
    userId: new ObjectId(chatSessionUserId),
    chatid: chatId,
  });
  // console.log("doc", doc);
  if (!doc) return false;

  return doc.bookmarked; // toggle flag
}
export async function toggleBookmarkChatSession({ chatId }) {
  const session = await auth();
  const chatSessionUserId = session?.user?.chatSessionUserId;

  if (!chatSessionUserId) throw new Error("Unauthorized");

  const client = await connectToDatabase();
  const sessionsCollection = client.db("chat").collection("sessions");

  // Find current record
  const doc = await sessionsCollection.findOne({
    userId: new ObjectId(chatSessionUserId),
    chatid: chatId,
  });
  // console.log("doc", doc);
  if (!doc) throw new Error("Chat not found");

  const newBookmarked = !doc.bookmarked; // toggle flag

  const res = await sessionsCollection.updateOne(
    { _id: doc._id },
    { $set: { bookmarked: newBookmarked } }
  );
  // console.log("toggleBookmarkChatSession newBookmarked", newBookmarked);
  // Revalidate the path that contains NavigationEvents/Sidebar
  revalidatePath("/");
  revalidatePath(`/chat/${chatId}`);
  console.log("revalidated", `/chat/${chatId}`);
  return { success: true, bookmarked: newBookmarked };
}

export async function deleteChatSession({ chatId }) {
  const session = await auth();
  const chatSessionUserId = session?.user?.chatSessionUserId;

  if (!chatSessionUserId) {
    throw new Error("Unauthorized");
  }

  const client = await connectToDatabase();
  const sessionsCollection = client.db("chat").collection("sessions");

  const result = await sessionsCollection.deleteOne({
    userId: new ObjectId(chatSessionUserId),
    chatid: chatId,
  });
  // Revalidate the path that contains NavigationEvents/Sidebar
  revalidatePath("/");

  return { success: result.deletedCount > 0 };
}

export async function clearAllChatSessions() {
  const session = await auth();
  const email = session?.user?.email;
  const chatSessionUserId = session?.user?.chatSessionUserId;
  // console.log("clearAllChatSessions email", email);
  if (!chatSessionUserId) {
    return null;
  }
  const client = await connectToDatabase();
  const sessionsCollection = client.db("chat").collection("sessions");

  const result = await sessionsCollection.updateMany(
    { userId: new ObjectId(chatSessionUserId) }, // Ensure we are looking for the correct username
    {
      $set: {
        hidden: true, // Set hidden to true for all matching sessions
      },
    }
  );
  // Revalidate the path that contains NavigationEvents/Sidebar
  revalidatePath("/");

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
    .find(
      {
        userId: new ObjectId(chatSessionUserId),
        // userEmail: email,
        // hidden: { $ne: true },
        hidden: false,
      },
      {
        projection: {
          _id: 1, // exclude Mongo’s internal _id
          chatid: 1,
          userEmail: 1,
          updatedAt: 1,
          userId: 1,
          bookmarked: 1,
          snippet: 1,
          // "content.userMessages": 1,
          // "content.canvasText": 1,
        },
      }
    )
    .sort({ updatedAt: -1 })
    .limit(50) // ✅ only the 50 most recent
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

// async function backfillSnippets() {
//   const client = await connectToDatabase();
//   const sessionsCollection = client.db("chat").collection("sessions");

//   const cursor = sessionsCollection.find(
//     { snippet: { $exists: false } }, // only update if snippet missing
//     {
//       projection: {
//         chatid: 1,
//         "content.userMessages": 1,
//         "content.canvasText": 1,
//       },
//     }
//   );

//   let updated = 0;
//   while (await cursor.hasNext()) {
//     const doc = await cursor.next();
//     if (!doc) continue;

//     const userMessages = doc?.content?.userMessages;
//     console.log(`doc.chatid`, doc.chatid);

//     let snippet = null;

//     if (Array.isArray(userMessages)) {
//       const snippetArray = userMessages.map((m) =>
//         typeof m.content === "string" ? m.content : (m.content?.text ?? null)
//       );
//       snippet = snippetArray.filter(Boolean).join("...");
//     } else {
//       snippet = doc?.content?.canvasText ?? null;
//     }

//     if (snippet) {
//       await sessionsCollection.updateOne(
//         { chatid: doc.chatid },
//         { $set: { snippet } }
//       );
//       updated++;
//     }
//   }

//   console.log(`✅ Backfilled ${updated} snippets`);
//   await client.close();
// }

export async function loadChatSession({ chatId }) {
  // console.log("SERVER ACTION load", chatId);
  const session = await auth();
  const email = session?.user?.email;
  const chatSessionUserId = session?.user?.chatSessionUserId;
  // console.log("email", email);
  const client = await connectToDatabase();
  const sessionsCollection = client.db("chat").collection("sessions");
  const results = await sessionsCollection.findOne(
    { userId: new ObjectId(chatSessionUserId), chatid: chatId } // Ensure we are looking for the correct chatId in the sessions array
  );
  // console.log("results", results);
  if (!results) {
    // console.log("results.sessions null");
    return;
  } else {
    const serializedSession = serializeOneSession(results);
    return serializedSession;
  }
}

export async function saveChatSession(params) {
  // await backfillSnippets();
  // console.log("SERVER ACTION save params", params);
  // console.log("SERVER ACTION save systemPrompt", params.systemPrompt);
  const session = await auth();
  const email = session?.user?.email;
  const chatSessionUserId = session?.user?.chatSessionUserId;
  // console.log("email", email);
  // console.log("email", userMessages);
  // console.log("email", botMessages);
  const content = params;
  // console.log("content to be saved", content);
  const chatId = params.chatId || params.canvasId;
  // console.log("chatId", chatId);
  // return;
  const client = await connectToDatabase();
  const sessionsCollection = client.db("chat").collection("sessions");
  // Check if session already exists (update) or is new (create)
  const existingSession = await sessionsCollection.findOne({ chatid: chatId });

  // get userMessages array and form the snippet
  const userMessages = params?.userMessages;
  let snippet;

  if (!params.canvasId && userMessages) {
    const snippetArray = userMessages.map((m) =>
      typeof m.content === "string"
        ? m.content
        : m.content?.text
          ? m.content?.text
          : null
    );
    snippet = snippetArray.join("...");
  } else {
    snippet = params?.canvasText;
  }

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
          hidden: false,
          snippet,
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
    // const userSessionCount = await sessionsCollection.countDocuments({
    //   userId: new ObjectId(chatSessionUserId),
    // });

    const newSession = {
      _id: chatId,
      userId: new ObjectId(chatSessionUserId),
      userEmail: email,
      chatid: chatId,
      content: content,
      hidden: false,
      // sortOrder: userSessionCount, // Next position in the sequence
      createdAt: new Date(),
      updatedAt: new Date(),
      migratedAt: null, // This is a new session, not migrated
      originalArrayPosition: null,
      snippet,
    };

    const insertResult = await sessionsCollection.insertOne(newSession);
    // Revalidate the path that contains NavigationEvents/Sidebar
    revalidatePath("/");

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
function serializeOneSession(session) {
  // Convert MongoDB objects to plain objects
  return {
    _id: session?._id.toString(), // Convert ObjectId to string
    userId: session?.userId.toString(), // Convert ObjectId to string
    userEmail: session?.userEmail,
    chatid: session?.chatid,
    snippet: session?.snippet,
    content: session?.content,
    // hidden: session?.hidden,
    // sortOrder: session?.sortOrder,
    // createdAt: session?.createdAt?.toISOString(), // Convert Date to ISO string
    updatedAt: session?.updatedAt?.toISOString(), // Convert Date to ISO string
    // migratedAt: session?.migratedAt?.toISOString(), // Convert Date to ISO string
    // originalArrayPosition: session?.originalArrayPosition,
    bookmarked: session?.bookmarked,
  };
}

function serializeSession(session) {
  // Convert MongoDB objects to plain objects
  return {
    _id: session?._id.toString(), // Convert ObjectId to string
    userId: session?.userId.toString(), // Convert ObjectId to string
    userEmail: session?.userEmail,
    chatid: session?.chatid,
    snippet: session?.snippet,
    // content: session?.content,
    // hidden: session?.hidden,
    // sortOrder: session?.sortOrder,
    // createdAt: session?.createdAt?.toISOString(), // Convert Date to ISO string
    updatedAt: session?.updatedAt?.toISOString(), // Convert Date to ISO string
    // migratedAt: session?.migratedAt?.toISOString(), // Convert Date to ISO string
    // originalArrayPosition: session?.originalArrayPosition,
    bookmarked: session?.bookmarked,
  };
}
