// import { openai } from "@ai-sdk/openai"
// import { streamText, tool } from "ai"
// import { z } from "zod"
import { NextResponse, NextRequest } from "next/server";
// // Allow streaming responses up to 30 seconds
// export const maxDuration = 30
export const runtime = 'edge'

export async function POST(req: Request) {
  const name = 'john'
  console.log("header:", req.headers);
  console.log('route runtime',process.env.NEXT_RUNTIME);
  return Response.json({ message: `Hello, ${name}!` }, { status: 200 });
}
export async function GET(req: Request) {
  // console.log("header:", req.headers);
  console.log('runtime',process.env.NEXT_RUNTIME);

  // return Response.json({name: 'hello'}, {status:200})
  const stream = new ReadableStream({
    start(controller) {
      // Function to enqueue data with a delay
      const enqueueWithDelay = (data: string, delay: number): Promise<void> => {
        return new Promise((resolve) => {
          setTimeout(() => {
            controller.enqueue(new TextEncoder().encode(data));
            resolve();
          }, delay);
        });
      };

      // Create an async function to handle the streaming
      const streamData = async () => {
        for (let i = 0; i < 80; i++) {
          await enqueueWithDelay(`${i}s`, 1000);
           
          }
        controller.close(); // Close the stream
      };

      

      // Start streaming the data
      streamData();
    },
  });
  // Return a new Response with the stream
  return new Response(stream, {
    headers: {
      "Content-Type": "text/plain",
    },
  });
}
async function wait(duration: number) {
  return new Promise((resolve) => setTimeout(resolve, duration));
}
//   const { messages } = await req.json()
//   console.log("server messages:", messages)
//   const res = new Response()
//   try {
//     const result = streamText({
//       model: openai("gpt-4o-mini"),
//       messages,
//     })

//     // return result.toDataStreamResponse()
//     // result.fullStream.getReader()
//     const reader = result.fullStream.getReader()

//     while (true) {
//       const { done, value } = await reader.read()
//       if (done) {
//         break
//       }

//       console.log("value:", value.textDelta ? value.textDelta : value)
//       return Response.write(value.textDelta ? value.textDelta : value)
//     }
//   } catch (error) {
//     console.warn("OpenAI api error:", error)
//   }
// }
