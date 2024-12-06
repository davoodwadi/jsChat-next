import { connectToDatabase } from "@/lib/db"
import { NextResponse } from "next/server"

export async function POST(req) {
  const body = await req.json()
  const email = body?.email
  console.log("email", email)

  try {
    const client = await connectToDatabase()
    const usersCollection = client.db("next").collection("users")

    const usersArray = await usersCollection
      .find({ email: email }, { projection: { email: 1 } }) // get only the email
      .toArray()
    // console.log("api user results", results)
    if (usersArray.length === 0) {
      return NextResponse.json(
        { error: "User not found in users" },
        { status: 400 }
      )
    }
    if (usersArray.length > 1) {
      return NextResponse.json(
        { error: "Multiple users found in users" },
        { status: 400 }
      )
    }
    const user = usersArray[0]
    const plansCollection = client.db("chat").collection("plans")
    const results = await plansCollection
      .find(
        { email: user.email },
        {
          projection: {
            tokensRemaining: 1,
            tokensConsumed: 1,
            quotaRefreshedAt: 1,
            lastLogin: 1,
            createdAt: 1,
          },
        }
      )
      .toArray()

    return NextResponse.json({ user: results[0] }, { status: 200 })
  } catch (e) {
    console.warn(e)
    return NextResponse.json({ error: "error fetching data" }, { status: 400 })
  }
}
