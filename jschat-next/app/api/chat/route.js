import { openai } from "@ai-sdk/openai";
import { streamText } from "ai";
import OpenAI from "openai";

import { createDeepInfra } from "@ai-sdk/deepinfra";

const deepinfra = createDeepInfra({
  apiKey: process.env.DEEPINFRA_TOKEN,
});

// import { z } from "zod"
import { NextResponse, NextRequest } from "next/server";
// // Allow streaming responses up to 30 seconds
// export const maxDuration = 30
export const runtime = "edge";

const client = new OpenAI({
  apiKey: process.env["OPENAI_API_KEY"], // This is the default and can be omitted
});

export async function POST(req) {
  const data = await req.json();

  console.log("route runtime", process.env.NEXT_RUNTIME);

  const stream = new ReadableStream({
    async start(controller) {
      try {
        const encoder = new TextEncoder();

        let result;
        if (data.model.includes("gpt")) {
          const stream = await client.chat.completions.create({
            messages: data.messages,
            model: data.model,
            stream: true,
            stream_options: { include_usage: true },
            max_completion_tokens: 16384,
          });

          for await (const chunk of stream) {
            if (chunk.choices[0]?.delta?.content) {
              controller.enqueue(
                encoder.encode(chunk.choices[0]?.delta?.content)
              );
            } else if (chunk?.usage?.total_tokens) {
              fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/api/tokens`, {
                method: "POST",
                headers: {
                  "Content-Type": "application/json",
                },
                body: JSON.stringify({
                  amount: chunk?.usage?.total_tokens,
                  email: data.email,
                }),
              });
            }
          }
        } else {
          result = streamText({
            model: deepinfra("deepseek-ai/DeepSeek-R1"),
            messages: data.messages,
            maxTokens: 16384,
          });
          const fullStream = result.fullStream;
          for await (const fullPart of fullStream) {
            // console.log(fullPart);
            if (fullPart.type === "text-delta") {
              const chunk = fullPart.textDelta;
              // console.log(chunk);
              controller.enqueue(encoder.encode(chunk));
            } else if (fullPart.type === "finish") {
              fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/api/tokens`, {
                method: "POST",
                headers: {
                  "Content-Type": "application/json",
                },
                body: JSON.stringify({
                  amount: fullPart.usage.totalTokens,
                  email: data.email,
                }),
              });
            }
          }
        }

        controller.close(); // Close the stream
      } catch (error) {
        console.error("Streaming error:", error);
        controller.error(error); // Signal an error in the stream
      }
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "application/json",
    },
  });
}

export async function GET(req) {
  // console.log("header:", req.headers);
  console.log("runtime", process.env.NEXT_RUNTIME);

  // return Response.json({name: 'hello'}, {status:200})
  const stream = new ReadableStream({
    start(controller) {
      // Function to enqueue data with a delay
      const enqueueWithDelay = (data, delay) => {
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
async function wait(duration) {
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
