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
  xAIModels,
} from "@/app/models";
import {
  groqModelsWithMeta,
  openaiModelsWithMeta,
  deepinfraModelsWithMeta,
  anthropicModelsWithMeta,
  xAIModelsWithMeta,
} from "@/app/models";

const allModels = [
  ...groqModelsWithMeta,
  ...openaiModelsWithMeta,
  ...deepinfraModelsWithMeta,
  ...anthropicModelsWithMeta,
  ...xAIModelsWithMeta,
];

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
const xAI = new OpenAI({
  apiKey: process.env["XAI_API_KEY"],
  baseURL: "https://api.x.ai/v1",
});

const anthropic = new Anthropic();

export async function POST(req) {
  const data = await req.json();

  console.log("route runtime", process.env.NEXT_RUNTIME);
  // revalidatePath("/", "layout");
  console.log("model server", data.model);

  if (anthropicModels.includes(data.model)) {
    const stream = new ReadableStream({
      async start(controller) {
        try {
          const encoder = new TextEncoder();
          // console.log("Anthropic Model", data.model);
          const convertedMessages = convertToAnthropicFormat(data.messages);
          // console.log("Anthropic convertedMessages", convertedMessages);
          // return;
          const thinking = data.model.includes("claude-3-7-sonnet")
            ? { thinking: { type: "enabled", budget_tokens: 8000 } }
            : {};
          // console.log("thinking", thinking);
          // const messages = data.messages
          //   .filter((m) => m.role !== "system")
          //   .map((m) => ({
          //     role: m.role,
          //     content: m.content,
          //   }));
          const system = data.messages.filter((m) => m.role === "system")[0];

          // console.log("messages", messages);
          // console.log("system", system);
          const streamResponse = await anthropic.messages.create({
            max_tokens: 8192,
            system: system && system?.content,
            messages: convertedMessages,
            model: data.model,
            stream: true,
            ...thinking,
          });
          let total_tokens = 0;
          // const all_models = await anthropic.models.list({
          //   limit: 20,
          // });
          // console.log("latest anthropic models:", all_models);
          for await (const messageStreamEvent of streamResponse) {
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
  } else if (groqModels.includes(data.model)) {
    const stream = new ReadableStream({
      async start(controller) {
        try {
          const encoder = new TextEncoder();

          // console.log("groq");
          const { convertedMessages, hasImage } = convertToOpenAIFormat(
            data.messages
          );
          const streamResponse = await groq.chat.completions.create({
            messages: convertedMessages,
            model: data.model,
            stream: true,
            stream_options: { include_usage: true },
            max_completion_tokens: 8191,
          });

          for await (const chunk of streamResponse) {
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
  } else if (deepinfraModels.includes(data.model)) {
    console.log("deepinfra");
    const { convertedMessages, hasImage } = convertToOpenAIFormat(
      data.messages
    );

    const modelMeta = allModels.find((m) => m.model === data.model);
    if (!modelMeta.vision && hasImage) {
      // console.log("model does not have vision capabilities", data.model);
      return new Response(
        JSON.stringify({
          error: `${data.model} does not support vision`,
        }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      );
    }

    const stream = new ReadableStream({
      async start(controller) {
        try {
          const encoder = new TextEncoder();
          const result = streamText({
            model: deepinfra(data.model),
            messages: convertedMessages,
            maxTokens: 16384,
          });
          const fullStream = result.fullStream;
          for await (const fullPart of fullStream) {
            // console.log("fullPart", fullPart);
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
  } else if (openaiModels.includes(data.model)) {
    const stream = new ReadableStream({
      async start(controller) {
        try {
          const encoder = new TextEncoder();

          console.log("openai");
          const { convertedMessages, hasImage } = convertToOpenAIFormat(
            data.messages
          );
          const reasoning = data.model.includes("o3-mini")
            ? { reasoning_effort: "high" }
            : {};

          console.log("reasoning", reasoning);
          const streamResponse = await openai.chat.completions.create({
            messages: convertedMessages,
            model: data.model,
            stream: true,
            stream_options: { include_usage: true },
            max_completion_tokens: 16384,
            ...reasoning,
          });

          for await (const chunk of streamResponse) {
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
  } else if (xAIModels.includes(data.model)) {
    const stream = new ReadableStream({
      async start(controller) {
        try {
          const encoder = new TextEncoder();

          // console.log("xAI");
          const { convertedMessages, hasImage } = convertToOpenAIFormat(
            data.messages
          );
          const streamResponse = await xAI.chat.completions.create({
            messages: convertedMessages,
            model: data.model,
            stream: true,
            stream_options: { include_usage: true },
            max_completion_tokens: 16384,
          });

          for await (const chunk of streamResponse) {
            // console.log("chunk", chunk);
            if (chunk.choices[0]?.delta?.content) {
              controller.enqueue(
                encoder.encode(chunk.choices[0]?.delta?.content)
              );
            } else if (chunk?.usage?.total_tokens) {
              // console.log("total tokens", chunk?.usage?.total_tokens);
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
  } else {
    console.log(`Model ${model} not found in any list.`);
  }
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

function convertToOpenAIFormat(messages) {
  let hasImage = false;
  const converted = messages.map((m) => {
    if (m.role === "user") {
      const userM = {
        role: "user",
        content: [{ type: "text", text: m.content.text ? m.content.text : "" }],
      };
      if (m.content.image) {
        userM.content.push({
          type: "image_url",
          image_url: { url: m.content.image },
        });
        hasImage = true;
      }
      return userM;
    } else {
      return m;
    }
  });
  return { convertedMessages: converted, hasImage: hasImage };
}

function convertToAnthropicFormat(messages) {
  return messages.map((m) => {
    if (m.role === "user") {
      const userM = {
        role: "user",
        content: [{ type: "text", text: m.content.text ? m.content.text : "" }],
      };
      if (m.content.image) {
        userM.content.push(formatBase64ImageAnthropic(m.content.image));
      }
      return userM;
    } else {
      return m;
    }
  });
}

function formatBase64ImageAnthropic(base64String) {
  const matches = base64String.match(/^data:(image\/[a-zA-Z]+);base64,(.+)$/);

  if (!matches || matches.length !== 3) {
    throw new Error("Invalid base64 image string");
  }

  const mediaType = matches[1]; // e.g., image/jpeg
  const base64Data = matches[2]; // the actual base64 string

  return {
    type: "image",
    source: {
      type: "base64",
      media_type: mediaType,
      data: base64Data,
    },
  };
}
