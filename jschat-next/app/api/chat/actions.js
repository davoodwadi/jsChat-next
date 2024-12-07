"use server"

import { streamText } from "ai"
import { openai } from "@ai-sdk/openai"
import { createStreamableValue } from "ai/rsc"
import { auth } from "@/auth"
import { connectToDatabase } from "@/lib/db"

export async function addUserToken({ user }) {
  // const email = user?.email
  const email = user.email

  const client = await connectToDatabase()
  const plansCollection = client.db("chat").collection("plans")
  const results = await plansCollection.updateOne(
    { username: email },
    { $inc: { tokensRemaining: 10000 } }
  )
  console.log(results, "results")
  return results.acknowledged
  // const userDb = results[0]
  // return userDb.tokensRemaining
}

export async function getUserTokensLeft({ user }) {
  const email = user?.email
  // const email = "davoodwadi@gmail.com"

  const client = await connectToDatabase()
  const plansCollection = client.db("chat").collection("plans")
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
  )

  return { user: result, status: "ok" }
}

export async function generate({ messages, model }) {
  const session = await auth()
  console.log("session", session)
  if (!session?.user) {
    return { output: null, status: "Not Authenticated" }
  }
  const stream = createStreamableValue("")
  console.log("server messages:", messages)
  ;(async () => {
    const { fullStream } = streamText({
      model: openai(model),
      messages,
    })

    for await (const delta of fullStream) {
      //   console.log("server delta:", delta)
      if (delta.type === "finish") {
        // count tokens and update database for user
        console.log("delta.usage.totalTokens", delta.usage.totalTokens)
      } else if (delta.type === "text-delta") {
        stream.update(delta.textDelta)
      } else if (delta.type === "error") {
        console.log("ERROR in LLM:", delta.error)
        stream.done()
        break
      }
    }

    stream.done()
  })()

  return { output: stream.value, status: "ok" }
}
