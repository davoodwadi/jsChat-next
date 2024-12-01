// import { openai } from "@ai-sdk/openai"
// import { StreamingTextResponse, streamText } from "ai"

export async function POST(req) {
  const messages = await req.json()
  console.log("inside post: messages parsed", messages)
  //   const result = await streamText({
  //     model: openai("gpt-4o-mini"),
  //     messages,
  //   })

  //   return new StreamingTextResponse(result.toAIStream())
  return Response.json(JSON.stringify(messages))
}

// export async function GET(req) {
//   const { messages } = await req.json()
//   //   const result = await streamText({
//   //     model: openai("gpt-4o-mini"),
//   //     messages,
//   //   })

//   //   return new StreamingTextResponse(result.toAIStream())
//   return Response.json({ statsss: "received" })
// }

export async function GET(request) {
  //   redirect("https://nextjs.org/")
  return Response.json({ message: "Hello World" })
}
