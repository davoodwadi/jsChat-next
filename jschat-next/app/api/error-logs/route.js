import { connectToDatabase } from "@/lib/db";
import { NextResponse } from "next/server";

/**
 * POST /api/error-logs
 * Stores client-side errors in MongoDB
 */
export async function POST(req) {
  try {
    const errorLog = await req.json();

    // Validate required fields
    if (!errorLog.timestamp || !errorLog.context) {
      return NextResponse.json(
        { error: "Missing required fields: timestamp, context" },
        { status: 400 },
      );
    }

    // Connect to database
    const client = await connectToDatabase();
    const errorLogsCollection = client.db("chat").collection("errorLogs");

    // Add server-side metadata
    const enrichedLog = {
      ...errorLog,
      serverTimestamp: new Date(),
      ip: req.headers.get("x-forwarded-for") || req.headers.get("x-real-ip"),
      userAgent: req.headers.get("user-agent"),
    };

    // Insert error log
    const result = await errorLogsCollection.insertOne(enrichedLog);

    // Log critical errors to console (Brave/iOS issues)
    if (
      errorLog.deviceInfo?.isBrave ||
      errorLog.deviceInfo?.userAgent?.includes("iPhone")
    ) {
      console.error(
        `🔴 [BRAVE/iOS ERROR] ${errorLog.context}:`,
        errorLog.error.message,
      );
    }

    return NextResponse.json(
      {
        success: true,
        id: result.insertedId,
      },
      { status: 200 },
    );
  } catch (e) {
    console.error("Failed to store error log:", e);
    return NextResponse.json(
      { error: "Failed to store error log" },
      { status: 500 },
    );
  }
}

/**
 * GET /api/error-logs
 * Retrieves recent error logs (for debugging dashboard)
 */
export async function GET(req) {
  try {
    const client = await connectToDatabase();
    const errorLogsCollection = client.db("chat").collection("errorLogs");

    // Get query parameters
    const { searchParams } = new URL(req.url);
    const limit = parseInt(searchParams.get("limit") || "50");
    const context = searchParams.get("context"); // Filter by context (e.g., "chat-send")
    const isBrave = searchParams.get("isBrave") === "true"; // Filter Brave browser

    // Build query
    const query = {};
    if (context) {
      query.context = context;
    }
    if (isBrave) {
      query["deviceInfo.isBrave"] = true;
    }

    // Fetch error logs
    const errors = await errorLogsCollection
      .find(query)
      .sort({ serverTimestamp: -1 })
      .limit(limit)
      .toArray();

    return NextResponse.json(
      {
        success: true,
        count: errors.length,
        errors,
      },
      { status: 200 },
    );
  } catch (e) {
    console.error("Failed to retrieve error logs:", e);
    return NextResponse.json(
      { error: "Failed to retrieve error logs" },
      { status: 500 },
    );
  }
}
