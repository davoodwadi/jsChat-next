"use server"

import { streamText } from "ai"
import { openai } from "@ai-sdk/openai"
import { createStreamableValue } from "ai/rsc"
import { auth } from "@/auth"

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
