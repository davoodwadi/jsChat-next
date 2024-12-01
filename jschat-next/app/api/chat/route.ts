import { openai } from "@ai-sdk/openai"
import { streamText, tool } from "ai"
import { z } from "zod"

// Allow streaming responses up to 30 seconds
export const maxDuration = 30

export async function POST(req: Request) {
  const { messages } = await req.json()
  console.log("server messages:", messages)
  try {
    const result = streamText({
      model: openai("gpt-4o-mini"),
      messages,
    })

    return result.toDataStreamResponse()
  } catch (error) {
    console.warn("OpenAI api error:", error)
    return "openAI error return"
  }
}
