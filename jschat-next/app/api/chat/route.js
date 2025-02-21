// import { openai } from "@ai-sdk/openai";
import { streamText } from "ai";
import OpenAI from "openai";
import { createDeepInfra } from "@ai-sdk/deepinfra";
import Groq from "groq-sdk";

// // Allow streaming responses up to 30 seconds
// export const maxDuration = 30
export const runtime = "edge";

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

const deepinfra = createDeepInfra({
  apiKey: process.env.DEEPINFRA_TOKEN,
});

const openai = new OpenAI({
  apiKey: process.env["OPENAI_API_KEY"], // This is the default and can be omitted
});

const groqModels = [
  "llama-3.3-70b-versatile",
  "llama-3.3-70b-specdec",
  "deepseek-r1-distill-llama-70b",
];
const deepinfraModels = [
  "deepseek-ai/DeepSeek-R1",
  "deepseek-ai/DeepSeek-R1-Distill-Qwen-32B",
  "nvidia/Llama-3.1-Nemotron-70B-Instruct",
  "Qwen/Qwen2.5-72B-Instruct",
];
const openaiModels = ["gpt-4o-mini"];

export async function POST(req) {
  const data = await req.json();

  console.log("route runtime", process.env.NEXT_RUNTIME);
  // revalidatePath("/", "layout");
  console.log("model server", data.model);

  const stream = new ReadableStream({
    async start(controller) {
      try {
        const encoder = new TextEncoder();

        let result;
        if (groqModels.includes(data.model)) {
          console.log("groq");
          const stream = await groq.chat.completions.create({
            messages: data.messages.map((m) => ({
              role: m.role,
              content: m.content,
            })),
            // model: "llama-3.3-70b-versatile",
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
        } else if (deepinfraModels.includes(data.model)) {
          console.log("deepinfra");
          result = streamText({
            model: deepinfra(data.model),
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
        } else if (openaiModels.includes(data.model)) {
          console.log("openai");
          const stream = await openai.chat.completions.create({
            messages: data.messages.map((m) => ({
              role: m.role,
              content: m.content,
            })),
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
          console.log(`Model ${model} not found in any list.`);
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
