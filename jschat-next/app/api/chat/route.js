// import { openai } from "@ai-sdk/openai";
import { streamText } from "ai";
import OpenAI from "openai";
const openai = new OpenAI({
  apiKey: process.env["OPENAI_KEY"], // This is the default and can be omitted
});
const xAI = new OpenAI({
  apiKey: process.env["XAI_API_KEY"],
  baseURL: "https://api.x.ai/v1",
});
import { createDeepInfra } from "@ai-sdk/deepinfra";
const deepinfra = createDeepInfra({
  apiKey: process.env.DEEPINFRA_TOKEN,
});

import Groq from "groq-sdk";
const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

import Anthropic from "@anthropic-ai/sdk";
const anthropic = new Anthropic();

import { GoogleGenAI } from "@google/genai";
const googleAI = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

import {
  groqModels,
  openaiModels,
  deepinfraModels,
  anthropicModels,
  xAIModels,
  geminiModels,
} from "@/app/models";
import {
  groqModelsWithMeta,
  openaiModelsWithMeta,
  deepinfraModelsWithMeta,
  anthropicModelsWithMeta,
  xAIModelsWithMeta,
  geminiModelsWithMeta,
} from "@/app/models";

import { allModelsWithoutIcon } from "@/app/models";

// // Allow streaming responses up to 30 seconds
// export const maxDuration = 30
export const runtime = "edge";

export async function POST(req) {
  const data = await req.json();

  console.log("route runtime", process.env.NEXT_RUNTIME);
  // revalidatePath("/", "layout");
  console.log("model server", data.model);
  let total_tokens = 0;

  if (anthropicModels.includes(data.model)) {
    const { convertedMessages, system } = convertToAnthropicFormat(
      data.messages
    );
    const stream = new ReadableStream({
      async start(controller) {
        try {
          const encoder = new TextEncoder();
          // console.log("Anthropic Model", data.model);

          const thinking = data.model.includes("claude-3-7-sonnet")
            ? { thinking: { type: "enabled", budget_tokens: 8000 } }
            : {};

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
              // controller.enqueue(encoder.encode("<think>\n"));
              controller.enqueue(
                encoder.encode(
                  JSON.stringify({
                    text: "<think>\n",
                  }) + "\n"
                )
              );
            } else if (messageStreamEvent?.delta?.type === "signature_delta") {
              // controller.enqueue(encoder.encode("\n\n</think>\n\n"));
              controller.enqueue(
                encoder.encode(
                  JSON.stringify({
                    text: "\n\n</think>\n\n",
                  }) + "\n"
                )
              );
            } else if (messageStreamEvent.type === "content_block_delta") {
              // messageStreamEvent.delta.text
              if (messageStreamEvent?.delta?.type === "thinking_delta") {
                // controller.enqueue(
                //   encoder.encode(messageStreamEvent?.delta?.thinking)
                // );
                controller.enqueue(
                  encoder.encode(
                    JSON.stringify({
                      text: messageStreamEvent?.delta?.thinking,
                    }) + "\n"
                  )
                );
              } else {
                // controller.enqueue(
                //   encoder.encode(messageStreamEvent?.delta?.text)
                // );
                controller.enqueue(
                  encoder.encode(
                    JSON.stringify({
                      text: messageStreamEvent?.delta?.text,
                    }) + "\n"
                  )
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
              // controller.enqueue(
              //   encoder.encode(chunk.choices[0]?.delta?.content)
              // );
              controller.enqueue(
                encoder.encode(
                  JSON.stringify({
                    text: chunk.choices[0]?.delta?.content,
                  }) + "\n"
                )
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
    const { convertedMessages, hasImage } = convertToDeepInfraFormat(
      data.messages
    );

    const modelMeta = allModelsWithoutIcon.find((m) => m.model === data.model);
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
              // controller.enqueue(encoder.encode(chunk));
              controller.enqueue(
                encoder.encode(
                  JSON.stringify({
                    text: chunk,
                  }) + "\n"
                )
              );
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

          // controller.enqueue(
          //   encoder.encode(
          //     JSON.stringify({
          //       text: "Hello\n",
          //     }) + "\n"
          //   )
          // );

          // controller.enqueue(
          //   encoder.encode(
          //     JSON.stringify({
          //       text: "Here is a joke:\n\n",
          //     }) + "\n"
          //   )
          // );
          // controller.enqueue(
          //   encoder.encode(
          //     JSON.stringify({
          //       text: "Hahaha\n",
          //     }) + "\n"
          //   )
          // );
          // return;

          console.log("openai", data.model);
          // console.log("key", process.env["OPENAI_KEY"]);
          const { convertedMessages, hasImage } =
            convertToOpenAIResponsesFormat(data.messages);
          const legacyMessages = convertToOpenAIFormat(data.messages);
          const reasoning =
            data.model.includes("o3-mini") || data.model.includes("o4-mini")
              ? { reasoning: { effort: "high" } }
              : {};

          console.log("reasoning", reasoning);
          const streamResponse = await openai.responses.create({
            input: convertedMessages,
            model: data.model,
            stream: true,
            // stream_options: { include_usage: true },
            max_output_tokens: 16384,
            ...reasoning,
          });

          for await (const chunk of streamResponse) {
            // console.log("chunk", chunk);
            if (chunk.type === "response.output_text.delta") {
              // controller.enqueue(encoder.encode(chunk?.delta));
              controller.enqueue(
                encoder.encode(
                  JSON.stringify({
                    text: chunk?.delta,
                  }) + "\n"
                )
              );
            } else if (chunk.type === "response.completed") {
              // console.log("total tokens", chunk?.response?.usage?.total_tokens);
              fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/api/tokens`, {
                method: "POST",
                headers: {
                  "Content-Type": "application/json",
                },
                body: JSON.stringify({
                  amount: chunk?.response?.usage?.total_tokens,
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
    console.log("xAI");
    const reasoning = data.model.includes("grok-3-mini-latest")
      ? { reasoning_effort: "high" }
      : {};
    const isReasoning = data.model.includes("grok-3-mini-latest");
    const { convertedMessages, hasImage } = convertToOpenAIFormat(
      data.messages
    );
    const modelMeta = allModelsWithoutIcon.find((m) => m.model === data.model);
    if (!modelMeta.vision && hasImage) {
      console.log("model does not have vision capabilities", data.model);
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

          const streamResponse = await xAI.chat.completions.create({
            messages: convertedMessages,
            model: data.model,
            stream: true,
            stream_options: { include_usage: true },
            max_completion_tokens: 16384,
            ...reasoning,
          });
          let firstDelta = true;
          if (isReasoning) {
            // controller.enqueue(encoder.encode("<think>"));
            controller.enqueue(
              encoder.encode(
                JSON.stringify({
                  text: "<think>",
                }) + "\n"
              )
            );
          }
          for await (const chunk of streamResponse) {
            // console.log("chunk", chunk);
            if (chunk.choices[0]?.delta?.reasoning_content) {
              // controller.enqueue(
              //   encoder.encode(chunk.choices[0]?.delta?.reasoning_content)
              // );
              controller.enqueue(
                encoder.encode(
                  JSON.stringify({
                    text: chunk.choices[0]?.delta?.reasoning_content,
                  }) + "\n"
                )
              );
            } else if (chunk.choices[0]?.delta?.content) {
              if (firstDelta && isReasoning) {
                firstDelta = false;
                // controller.enqueue(encoder.encode("</think>"));
                controller.enqueue(
                  encoder.encode(
                    JSON.stringify({
                      text: "</think>",
                    }) + "\n"
                  )
                );
              }
              // controller.enqueue(
              //   encoder.encode(chunk.choices[0]?.delta?.content)
              // );
              controller.enqueue(
                encoder.encode(
                  JSON.stringify({
                    text: chunk.choices[0]?.delta?.content,
                  }) + "\n"
                )
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
  } else if (geminiModels.includes(data.model)) {
    console.log("Gemini model", data.model);
    const { history, newUserMessage, system } = convertToGoogleFormat(
      data.messages
    );
    const streamConfig = {
      config: {
        systemInstruction: system?.content ? system.content : null,
        thinkingConfig: {
          thinkingBudget: 16000,
        },
        tools: [{ googleSearch: {} }],
      },
    };
    const stream = new ReadableStream({
      async start(controller) {
        try {
          const encoder = new TextEncoder();

          // return;
          const chat = googleAI.chats.create({
            model: data.model,
            history: history,
            ...streamConfig,
          });
          // console.log("getHistory", chat.getHistory());
          // return;

          const stream = await chat.sendMessageStream({
            message: newUserMessage,
          });
          for await (const chunk of stream) {
            // console.log(chunk);
            const usageMetadata = chunk?.usageMetadata;
            total_tokens += usageMetadata?.totalTokenCount;
            try {
              if (chunk?.candidates[0]?.content?.parts[0]?.text) {
                const groundingMetadata =
                  chunk?.candidates[0]?.groundingMetadata;
                const groundingChunks = groundingMetadata?.groundingChunks;
                if (groundingChunks) {
                  console.log("groundingChunks", groundingChunks);
                }
                controller.enqueue(
                  encoder.encode(
                    JSON.stringify({
                      groundingChunks: groundingChunks,
                    }) + "\n"
                  )
                );
                const groundingSupports = groundingMetadata?.groundingSupports;
                if (groundingSupports) {
                  console.log("groundingSupports", groundingSupports);
                  controller.enqueue(
                    encoder.encode(
                      JSON.stringify({
                        groundingSupports: groundingSupports,
                      }) + "\n"
                    )
                  );
                }
                // controller.enqueue(
                //   encoder.encode(chunk?.candidates[0]?.content?.parts[0]?.text)
                // );
                controller.enqueue(
                  encoder.encode(
                    JSON.stringify({
                      text: chunk?.candidates[0]?.content?.parts[0]?.text,
                    }) + "\n"
                  )
                );
              }
            } catch (e) {
              console.log(e);
            }
          }
          // return;

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
        "Transfer-Encoding": "chunked",
      },
    });
  } else {
    console.log(`Model ${data.model} not found in any list.`);
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

function convertToOpenAIResponsesFormat(messages) {
  let hasImage = false;
  const converted = messages.map((m) => {
    if (m.role === "user") {
      const userM = {
        role: "user",
        content: [
          { type: "input_text", text: m.content.text ? m.content.text : "" },
        ],
      };
      if (m.content.image) {
        userM.content.push({
          type: "input_image",
          image_url: m.content.image,
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

function convertToDeepInfraFormat(messages) {
  let hasImage = false;
  const converted = messages.map((m) => {
    if (m.role === "user") {
      const userM = {
        role: "user",
        content: [{ type: "text", text: m.content.text ? m.content.text : "" }],
      };
      if (m.content.image) {
        userM.content.push({
          type: "image",
          image: m.content.image,
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

function convertToGoogleFormat(messages) {
  const convertedMessages = messages
    .filter((m) => m.role !== "system")
    .map((m) => {
      if (m.role === "user") {
        const userM = {
          role: "user",
          parts: [{ text: m.content.text ? m.content.text : "" }],
        };
        // if (m.content.image) {
        //   userM.content.push(formatBase64ImageAnthropic(m.content.image));
        // }
        return userM;
      } else if (m.role === "assistant") {
        return {
          role: "model",
          parts: [{ text: m.content ? m.content : "" }],
        };
      }
    });
  const history = convertedMessages.slice(0, -1); // all elements except the last
  const newUserMessage = convertedMessages[convertedMessages.length - 1]; // the last element

  const system = messages.find((m) => m.role === "system");
  // console.log("messages", messages);
  // console.log("history", history);
  // console.log("newUserMessage", newUserMessage);
  // console.log("system", system);
  return { history, newUserMessage, system };
}

function convertToAnthropicFormat(messages) {
  const convertedMessages = messages
    .filter((m) => m.role !== "system")
    .map((m) => {
      if (m.role === "user") {
        const userM = {
          role: "user",
          content: [
            { type: "text", text: m.content.text ? m.content.text : "" },
          ],
        };
        if (m.content.image) {
          userM.content.push(formatBase64ImageAnthropic(m.content.image));
        }
        return userM;
      } else if (m.role === "assistant") {
        return m;
      }
    });
  const system = messages.find((m) => m.role === "system");
  return { convertedMessages, system };
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
