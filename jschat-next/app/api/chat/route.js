// import { openai } from "@ai-sdk/openai";
import { streamText } from "ai";
import OpenAI from "openai";
import { createDeepInfra } from "@ai-sdk/deepinfra";
import Groq from "groq-sdk";
import Anthropic from "@anthropic-ai/sdk";

import {
  groqModels,
  openaiModels,
  deepinfraModels,
  anthropicModels,
} from "@/app/models";

// // Allow streaming responses up to 30 seconds
// export const maxDuration = 30
export const runtime = "edge";

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

const deepinfra = createDeepInfra({
  apiKey: process.env.DEEPINFRA_TOKEN,
});
const openai = new OpenAI({
  apiKey: process.env["OPENAI_KEY"], // This is the default and can be omitted
});
const anthropic = new Anthropic();

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
        if (anthropicModels.includes(data.model)) {
          // console.log("Anthropic Model", data.model);
          const thinking = data.model.includes("claude-3-7-sonnet")
            ? { thinking: { type: "enabled", budget_tokens: 8000 } }
            : {};
          // console.log("thinking", thinking);
          const stream = await anthropic.messages.create({
            max_tokens: 8192,
            messages: data.messages.map((m) => ({
              role: m.role,
              content: m.content,
            })),
            model: data.model,
            stream: true,
            ...thinking,
          });
          let total_tokens = 0;
          // const all_models = await anthropic.models.list({
          //   limit: 20,
          // });
          // console.log("latest anthropic models:", all_models);
          for await (const messageStreamEvent of stream) {
            // console.log("messageStreamEvent", messageStreamEvent);
            if (messageStreamEvent.type === "message_start") {
              // console.log("message_start", messageStreamEvent.message.usage);
              total_tokens += messageStreamEvent.message.usage.input_tokens; // messageStreamEvent.usage.input_tokens
              total_tokens += messageStreamEvent.message.usage.output_tokens; // messageStreamEvent.usage.output_tokens
              total_tokens +=
                messageStreamEvent.message.usage.cache_creation_input_tokens; // messageStreamEvent.usage.cache_creation_input_tokens,
              total_tokens +=
                messageStreamEvent.message.usage.cache_read_input_tokens; // messageStreamEvent.usage.cache_read_input_tokens
            } else if (messageStreamEvent.type === "message_delta") {
              // console.log("message_delta", messageStreamEvent);
              total_tokens += messageStreamEvent.usage.output_tokens;
            } else if (messageStreamEvent?.content_block?.type === "thinking") {
              controller.enqueue(encoder.encode("<think>\n"));
            } else if (messageStreamEvent?.delta?.type === "signature_delta") {
              controller.enqueue(encoder.encode("\n\n</think>\n\n"));
            } else if (messageStreamEvent.type === "content_block_delta") {
              // messageStreamEvent.delta.text
              if (messageStreamEvent?.delta?.type === "thinking_delta") {
                controller.enqueue(
                  encoder.encode(messageStreamEvent?.delta?.thinking)
                );
              } else {
                controller.enqueue(
                  encoder.encode(messageStreamEvent?.delta?.text)
                );
              }
            }
          }
          // console.log("total_tokens", total_tokens);
          fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/api/tokens`, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              amount: total_tokens,
              email: data.email,
            }),
          });
        } else if (groqModels.includes(data.model)) {
          // console.log("groq");
          const stream = await groq.chat.completions.create({
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
            } else if (typeof chunk?.choices[0]?.finish_reason === "string") {
              // console.log("chunk", chunk);

              // console.log("finished: ", chunk?.x_groq?.usage?.total_tokens);
              fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/api/tokens`, {
                method: "POST",
                headers: {
                  "Content-Type": "application/json",
                },
                body: JSON.stringify({
                  amount: chunk?.x_groq?.usage?.total_tokens,
                  email: data.email,
                }),
              });
            }
          }
        } else if (deepinfraModels.includes(data.model)) {
          // console.log("deepinfra");
          result = streamText({
            model: deepinfra(data.model),
            messages: data.messages,
            maxTokens: 16384,
          });
          const fullStream = result.fullStream;
          for await (const fullPart of fullStream) {
            console.log("fullPart", fullPart);
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
          // console.log("openai");
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
            // console.log("chunk", chunk);
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
