import { openai } from "@ai-sdk/openai"
import { streamText, tool } from "ai"
import { z } from "zod"

// Allow streaming responses up to 30 seconds
export const maxDuration = 30

export async function POST(req: Request) {
  //   console.log("header:", req.headers)
  const { messages } = await req.json()
  console.log("server messages:", messages)
  const res = new Response()
  try {
    const result = streamText({
      model: openai("gpt-4o-mini"),
      messages,
    })

    // return result.toDataStreamResponse()
    // result.fullStream.getReader()
    const reader = result.fullStream.getReader()

    while (true) {
      const { done, value } = await reader.read()
      if (done) {
        break
      }

      console.log("value:", value.textDelta ? value.textDelta : value)
      return Response.write(value.textDelta ? value.textDelta : value)
    }
  } catch (error) {
    console.warn("OpenAI api error:", error)
  }
}
