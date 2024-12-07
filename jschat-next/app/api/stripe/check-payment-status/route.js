import { NextRequest, NextResponse } from "next/server"
import { connectToDatabase } from "@/lib/db"

export async function GET(request) {
  const searchParams = request.nextUrl.searchParams
  const session_id = searchParams.get("session_id")

  const client = await connectToDatabase()
  const webhookCollection = client.db("next").collection("webhooks")
  const plansCollection = client.db("chat").collection("plans")
  try {
    const resp = await webhookCollection.findOne(
      { id: session_id },
      { projection: { id: 1, metadata: 1 } }
    )
    if (resp) {
      // found the event
      console.log("webhook resp", resp)
      console.log("webhook resp.metadata?.userId", resp.metadata?.userId)

      return NextResponse.json({ message: "success" }, { status: 201 })
    } else {
      // not found the event
      return NextResponse.json({ message: "pending" }, { status: 200 })
    }
  } catch (e) {
    console.error(e)
    return NextResponse.json(
      { error: "Error fetching payment." },
      { status: 400 }
    )
  }

  return NextResponse.json({ message: session_id }, { status: 201 })
  // query is "hello" for /api/search?query=hello
}
