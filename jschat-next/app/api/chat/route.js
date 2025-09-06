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

const perplexityClient = new OpenAI({
  apiKey: process.env.PERPLEXITY_API_KEY,
  baseURL: "https://api.perplexity.ai",
});

import {
  groqModels,
  openaiModels,
  deepinfraModels,
  anthropicModels,
  xAIModels,
  geminiModels,
  perplexityModels,
} from "@/app/models";
import { updateGroundingChunksWithActualLinksAndTitles } from "@/components/searchGroundingUtils";
import { allModelsWithoutIcon } from "@/app/models";
import { basic_search } from "@/lib/sample";
// // Allow streaming responses up to 30 seconds
// export const maxDuration = 30
export const runtime = "edge";

export async function POST(req) {
  const data = await req.json();

  console.log("route runtime", process.env.NEXT_RUNTIME);
  // revalidatePath("/", "layout");
  console.log("model server", data.model.model);
  console.log("server deepResearch", data?.modelConfig?.deepResearch);
  console.log("server search", data.modelConfig?.search);
  // return;

  const mutables = { total_tokens: 0, citationNumber: 1 };
  const searchCost = 20000;
  if (anthropicModels.includes(data.model.model)) {
    const { convertedMessages, system } = convertToAnthropicFormat(
      data.messages
    );
    const stream = new ReadableStream({
      async start(controller) {
        try {
          const encoder = new TextEncoder();
          // console.log("Anthropic Model", data.model);

          const thinking = data.model.model.includes("claude-sonnet-4")
            ? { thinking: { type: "enabled", budget_tokens: 8000 } }
            : {};

          // console.log("messages", messages);
          // console.log("system", system);
          const streamResponse = await anthropic.messages.create({
            max_tokens: 8192,
            system: system && system?.content,
            messages: convertedMessages,
            model: data.model.model,
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
              mutables.total_tokens +=
                messageStreamEvent.message.usage.input_tokens; // messageStreamEvent.usage.input_tokens
              mutables.total_tokens +=
                messageStreamEvent.message.usage.output_tokens; // messageStreamEvent.usage.output_tokens
              mutables.total_tokens +=
                messageStreamEvent.message.usage.cache_creation_input_tokens; // messageStreamEvent.usage.cache_creation_input_tokens,
              mutables.total_tokens +=
                messageStreamEvent.message.usage.cache_read_input_tokens; // messageStreamEvent.usage.cache_read_input_tokens
            } else if (messageStreamEvent.type === "message_delta") {
              // console.log("message_delta", messageStreamEvent);
              mutables.total_tokens += messageStreamEvent.usage.output_tokens;
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
          controller.close(); // Close the stream
        } catch (err) {
          if (err.code === "ECONNRESET" || err.name === "AbortError") {
            console.log("🔌 Client disconnected / aborted");
          } else if (err.code === "ERR_INVALID_STATE") {
            console.log("⚠️ Tried writing to closed stream, ignoring");
          } else {
            console.error("❌ Unexpected streaming error:", err);
          }
          try {
            controller.close();
          } catch {}
        } finally {
          console.log("UPDATING TOKEN USAGE");
          console.log("mutables.total_tokens", mutables.total_tokens);
          // UPDATE TOKENS HERE START
          // update usage
          fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/api/tokens`, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              amount: mutables.total_tokens,
              email: data.email,
            }),
          });
          //
          // UPDATE TOKENS HERE END
        }
      },
    });
    return new Response(stream, {
      headers: {
        "Content-Type": "application/json",
      },
    });
  } else if (groqModels.includes(data.model.model)) {
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
            model: data.model.model,
            stream: true,
            stream_options: { include_usage: true },
            max_completion_tokens: 8191,
          });

          for await (const chunk of streamResponse) {
            if (chunk.choices[0]?.delta?.content) {
              controller.enqueue(
                encoder.encode(
                  JSON.stringify({
                    text: chunk.choices[0]?.delta?.content,
                  }) + "\n"
                )
              );
            } else if (chunk.choices[0]?.delta?.reasoning) {
              controller.enqueue(
                encoder.encode(
                  JSON.stringify({
                    text: chunk.choices[0]?.delta?.reasoning,
                  }) + "\n"
                )
              );
            } else if (typeof chunk?.choices[0]?.finish_reason === "string") {
              mutables.total_tokens += chunk?.x_groq?.usage?.total_tokens;
            }
          }
          controller.close(); // Close the stream
        } catch (err) {
          if (err.code === "ECONNRESET" || err.name === "AbortError") {
            console.log("🔌 Client disconnected / aborted");
          } else if (err.code === "ERR_INVALID_STATE") {
            console.log("⚠️ Tried writing to closed stream, ignoring");
          } else {
            console.error("❌ Unexpected streaming error:", err);
          }
          try {
            controller.close();
          } catch {}
        } finally {
          console.log("UPDATING TOKEN USAGE");
          console.log("mutables.total_tokens", mutables.total_tokens);
          // UPDATE TOKENS HERE START
          // update usage
          fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/api/tokens`, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              amount: mutables.total_tokens,
              email: data.email,
            }),
          });
          //
          // UPDATE TOKENS HERE END
        }
      },
    });
    return new Response(stream, {
      headers: {
        "Content-Type": "application/json",
      },
    });
  } else if (deepinfraModels.includes(data.model.model)) {
    console.log("deepinfra");
    const { convertedMessages, hasImage } = convertToDeepInfraFormat(
      data.messages
    );
    const modelMeta = allModelsWithoutIcon.find(
      (m) => m.model === data.model.model
    );
    if (!modelMeta.vision && hasImage) {
      // console.log("model does not have vision capabilities", data.model.model);
      return new Response(
        JSON.stringify({
          error: `${data.model.model} does not support vision`,
        }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      );
    }

    const stream = new ReadableStream({
      async start(controller) {
        try {
          const encoder = new TextEncoder();
          const result = streamText({
            model: deepinfra(data.model.model),
            messages: convertedMessages,
            maxTokens: 16384,
          });
          const fullStream = result.fullStream;
          for await (const fullPart of fullStream) {
            // console.log("fullPart", fullPart);
            if (fullPart.type === "text-delta") {
              const chunk = fullPart.textDelta;
              controller.enqueue(
                encoder.encode(
                  JSON.stringify({
                    text: chunk,
                  }) + "\n"
                )
              );
            } else if (fullPart.type === "finish") {
              mutables.total_tokens += fullPart.usage.totalTokens;
            }
          }
          controller.close(); // Close the stream
        } catch (err) {
          if (err.code === "ECONNRESET" || err.name === "AbortError") {
            console.log("🔌 Client disconnected / aborted");
          } else if (err.code === "ERR_INVALID_STATE") {
            console.log("⚠️ Tried writing to closed stream, ignoring");
          } else {
            console.error("❌ Unexpected streaming error:", err);
          }
          try {
            controller.close();
          } catch {}
        } finally {
          console.log("UPDATING TOKEN USAGE");
          console.log("mutables.total_tokens", mutables.total_tokens);
          // UPDATE TOKENS HERE START
          // update usage
          fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/api/tokens`, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              amount: mutables.total_tokens,
              email: data.email,
            }),
          });
          //
          // UPDATE TOKENS HERE END
        }
      },
    });
    return new Response(stream, {
      headers: {
        "Content-Type": "application/json",
      },
    });
  } else if (openaiModels.includes(data.model.model)) {
    const stream = new ReadableStream({
      async start(controller) {
        try {
          const encoder = new TextEncoder();

          console.log("openai", data.model.model);
          const agentic = data?.modelConfig?.agentic;

          // console.log("key", process.env["OPENAI_KEY"]);
          const { convertedMessages, hasImage } =
            convertToOpenAIResponsesFormat({
              messages: data.messages,
              agentic,
            });
          // const legacyMessages = convertToOpenAIFormat(data.messages);
          // console.log("convertedMessages", convertedMessages);
          // return;
          const reasoning =
            data.model.model.includes("o3-mini") ||
            data.model.model.includes("o4-mini")
              ? { reasoning: { effort: "high" } }
              : {};

          let extraConfigs = { tools: [] };
          if (data?.modelConfig?.search) {
            extraConfigs["tools"].push({
              type: "web_search",
              search_context_size: "high",
            });
            extraConfigs["include"] = ["web_search_call.action.sources"];
          }
          if (agentic) {
            extraConfigs["tools"].push(...openAI_tools);
          }
          // console.log("extraConfigs", extraConfigs);
          // controller.close();
          // return;
          await getOpenAIResponse({
            controller,
            encoder,
            convertedMessages,
            model: data.model.model,
            reasoning,
            extraConfigs,
            search: data?.modelConfig?.search,
            agentic,
            searchCost,
            mutables: mutables,
          });
        } catch (err) {
          if (err.code === "ECONNRESET" || err.name === "AbortError") {
            console.log("🔌 Client disconnected / aborted");
          } else if (err.code === "ERR_INVALID_STATE") {
            console.log("⚠️ Tried writing to closed stream, ignoring");
          } else {
            console.error("❌ Unexpected streaming error:", err);
          }
          try {
            controller.close();
          } catch {}
        } finally {
          console.log("UPDATING TOKEN USAGE");
          console.log("mutables.total_tokens", mutables.total_tokens);
          // UPDATE TOKENS HERE START
          // update usage
          fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/api/tokens`, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              amount: mutables.total_tokens,
              email: data.email,
            }),
          });
          //
          // UPDATE TOKENS HERE END
        }
      },
    });
    return new Response(stream, {
      headers: {
        "Content-Type": "application/json",
      },
    });
  } else if (xAIModels.includes(data.model.model)) {
    console.log("xAI");
    const reasoning = data.model.model.includes("grok-3-mini-latest")
      ? { reasoning_effort: "high" }
      : {};
    const isReasoning = data.model.model.includes("grok-3-mini-latest");
    const { convertedMessages, hasImage } = convertToOpenAIFormat(
      data.messages
    );
    const modelMeta = allModelsWithoutIcon.find(
      (m) => m.model === data.model.model
    );
    if (!modelMeta.vision && hasImage) {
      console.log("model does not have vision capabilities", data.model.model);
      return new Response(
        JSON.stringify({
          error: `${data.model.model} does not support vision`,
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
            model: data.model.model,
            stream: true,
            stream_options: { include_usage: true },
            max_completion_tokens: 16384,
            ...reasoning,
          });
          let firstDelta = true;
          if (isReasoning || data.model.model.includes("grok-4")) {
            // console.log("reasoning xai -> added think token");
            controller.enqueue(
              encoder.encode(
                JSON.stringify({
                  text: "<think>",
                }) + "\n"
              )
            );
          }
          for await (const chunk of streamResponse) {
            console.log("chunk", chunk);
            if (chunk.choices[0]?.delta?.reasoning_content) {
              controller.enqueue(
                encoder.encode(
                  JSON.stringify({
                    text: chunk.choices[0]?.delta?.reasoning_content,
                  }) + "\n"
                )
              );
            } else if (chunk.choices[0]?.delta?.content) {
              if (
                firstDelta &&
                (isReasoning || data.model.model.includes("grok-4"))
              ) {
                firstDelta = false;
                controller.enqueue(
                  encoder.encode(
                    JSON.stringify({
                      text: "</think>",
                    }) + "\n"
                  )
                );
              }
              controller.enqueue(
                encoder.encode(
                  JSON.stringify({
                    text: chunk.choices[0]?.delta?.content,
                  }) + "\n"
                )
              );
            } else if (chunk?.usage?.total_tokens) {
              mutables.total_tokens += chunk?.usage?.total_tokens;
            }
          }
          controller.close(); // Close the stream
        } catch (err) {
          if (err.code === "ECONNRESET" || err.name === "AbortError") {
            console.log("🔌 Client disconnected / aborted");
          } else if (err.code === "ERR_INVALID_STATE") {
            console.log("⚠️ Tried writing to closed stream, ignoring");
          } else {
            console.error("❌ Unexpected streaming error:", err);
          }
          try {
            controller.close();
          } catch {}
        } finally {
          console.log("UPDATING TOKEN USAGE");
          console.log("mutables.total_tokens", mutables.total_tokens);
          // UPDATE TOKENS HERE START
          // update usage
          fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/api/tokens`, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              amount: mutables.total_tokens,
              email: data.email,
            }),
          });
          //
          // UPDATE TOKENS HERE END
        }
      },
    });
    return new Response(stream, {
      headers: {
        "Content-Type": "application/json",
      },
    });
  } else if (geminiModels.includes(data.model.model)) {
    console.log("Gemini model", data.model.model);
    // const modelList = await googleAI.models.list();
    // console.log("Gemini modelList", modelList);

    const { history, newUserMessage, system } = convertToGoogleFormat(
      data.messages
    );
    let streamConfig = {
      config: {
        systemInstruction: system?.content ? system.content : null,
        thinkingConfig: {
          thinkingBudget: 16000,
        },
      },
    };
    streamConfig = data?.modelConfig?.search
      ? {
          ...streamConfig,
          config: { ...streamConfig.config, tools: [{ googleSearch: {} }] },
        }
      : streamConfig;

    // console.log("streamConfig", streamConfig);
    // return;
    const stream = new ReadableStream({
      async start(controller) {
        try {
          const encoder = new TextEncoder();

          const chat = googleAI.chats.create({
            model: data.model.model,
            history: history,
            ...streamConfig,
          });

          const stream = await chat.sendMessageStream({
            message: newUserMessage,
          });
          for await (const chunk of stream) {
            const usageMetadata = chunk?.usageMetadata;
            // console.log("usageMetadata", usageMetadata);
            mutables.total_tokens += usageMetadata?.totalTokenCount;
            try {
              if (chunk?.candidates[0]?.content?.parts[0]?.text) {
                const groundingMetadata =
                  chunk?.candidates[0]?.groundingMetadata;
                const groundingChunks = groundingMetadata?.groundingChunks;
                if (groundingChunks) {
                  // console.log("groundingChunks", groundingChunks);
                  const groundingChunksRedirect =
                    await updateGroundingChunksWithActualLinksAndTitles(
                      groundingChunks
                    );
                  controller.enqueue(
                    encoder.encode(
                      JSON.stringify({
                        groundingChunks: groundingChunksRedirect,
                      }) + "\n"
                    )
                  );
                }
                const groundingSupports = groundingMetadata?.groundingSupports;
                if (groundingSupports) {
                  // console.log("groundingSupports", groundingSupports);
                  controller.enqueue(
                    encoder.encode(
                      JSON.stringify({
                        groundingSupports: groundingSupports,
                      }) + "\n"
                    )
                  );
                }
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
          controller.close(); // Close the stream
        } catch (err) {
          if (err.code === "ECONNRESET" || err.name === "AbortError") {
            console.log("🔌 Client disconnected / aborted");
          } else if (err.code === "ERR_INVALID_STATE") {
            console.log("⚠️ Tried writing to closed stream, ignoring");
          } else {
            console.error("❌ Unexpected streaming error:", err);
          }
          try {
            controller.close();
          } catch {}
        } finally {
          console.log("UPDATING TOKEN USAGE");
          console.log("mutables.total_tokens", mutables.total_tokens);
          // UPDATE TOKENS HERE START
          // update usage
          fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/api/tokens`, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              amount: mutables.total_tokens,
              email: data.email,
            }),
          });
          //
          // UPDATE TOKENS HERE END
        }
      },
    });
    return new Response(stream, {
      headers: {
        "Content-Type": "application/json",
        "Transfer-Encoding": "chunked",
      },
    });
  } else if (perplexityModels.includes(data.model.model)) {
    console.log("perplexity");
    let perplexityModel = "sonar";
    const academic = data?.modelConfig?.academic;
    const deepResearch = data?.modelConfig?.deepResearch;
    const search = data?.modelConfig?.search;

    let extraConfigs = {
      web_search_options: { search_context_size: "low" },
    };
    // search_filter: "academic",
    if (academic) {
      extraConfigs["search_filter"] = "academic";
      perplexityModel = "sonar";
    }
    if (search) {
      extraConfigs["web_search_options"] = { search_context_size: "high" };
      perplexityModel = "sonar-pro";
    }
    if (deepResearch) {
      perplexityModel = "sonar-deep-research";
    }
    // console.log("PERPLEXITY extraConfigs", extraConfigs);
    // return;
    let search_results_sent = false;

    const { convertedMessages, hasImage } = convertToOpenAIFormat(
      data.messages
    );
    let usage;
    const stream = new ReadableStream({
      async start(controller) {
        try {
          const encoder = new TextEncoder();
          const stream = await perplexityClient.chat.completions.create({
            model: perplexityModel,
            messages: convertedMessages,
            stream: true,
            ...extraConfigs,
          });
          let search_results;

          for await (const chunk of stream) {
            const content = chunk.choices?.[0]?.delta?.content;
            if (content) {
              controller.enqueue(
                encoder.encode(
                  JSON.stringify({
                    text: content,
                  }) + "\n"
                )
              );
            }
            if (chunk?.usage) {
              if (!search_results_sent) {
                usage = chunk.usage;
                // add reasoning, citation tokens
                if (usage?.citation_tokens) {
                  mutables.total_tokens += usage?.citation_tokens;
                }
                if (usage?.reasoning_tokens) {
                  mutables.total_tokens += usage?.reasoning_tokens;
                }
              }
              usage = chunk.usage;
              // console.log("usage", usage);
            }
            if (chunk?.search_results && !search_results_sent) {
              search_results = chunk.search_results;
              controller.enqueue(
                encoder.encode(
                  JSON.stringify({
                    search_results: JSON.stringify(search_results),
                  }) + "\n"
                )
              );
              search_results_sent = true;
              console.log("search results sent");
            }
          }
          controller.close(); // Close the stream
        } catch (err) {
          if (err.code === "ECONNRESET" || err.name === "AbortError") {
            console.log("🔌 Client disconnected / aborted");
          } else if (err.code === "ERR_INVALID_STATE") {
            console.log("⚠️ Tried writing to closed stream, ignoring");
          } else {
            console.error("❌ Unexpected streaming error:", err);
          }
          try {
            controller.close();
          } catch {}
        } finally {
          console.log("UPDATING TOKEN USAGE");
          if (usage?.total_tokens) {
            mutables.total_tokens += usage.total_tokens;
          }
          // console.log("extraConfigs", extraConfigs);
          if (search) {
            console.log("added search cost", "high");
            mutables.total_tokens += searchCost * 3;
          } else {
            console.log("added search cost", "low");
            mutables.total_tokens += searchCost * 2;
          }
          if (deepResearch) {
            mutables.total_tokens += searchCost * 5;
          }
          console.log("mutables.total_tokens", mutables.total_tokens);
          // UPDATE TOKENS HERE START
          // update usage
          fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/api/tokens`, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              amount: mutables.total_tokens,
              email: data.email,
            }),
          });
          //
          // UPDATE TOKENS HERE END
        }
      },
    });
    return new Response(stream, {
      headers: {
        "Content-Type": "application/json",
      },
    });
  } else if (data.model.model === "test-llm") {
    console.log("test LLM");
    const search = data.modelConfig?.search;
    const academic = data.modelConfig?.academic;
    const deepResearch = data.modelConfig?.deepResearch;
    const agentic = data.modelConfig?.agentic;
    console.log("data.modelConfig", data.modelConfig);
    await wait(5);

    const stream = new ReadableStream({
      async start(controller) {
        try {
          // console.log("sampleTextWithLink", sampleTextWithLink);
          const encoder = new TextEncoder();

          // "deepResearch: " +
          // data.modelConfig.deepResearch +
          // " " +
          // "search: " +
          // data.modelConfig.search +
          // " " +
          // JSON.stringify(data.messages[data.messages.length - 1]) +
          console.log(data.messages[data.messages.length - 1]);
          // sampleTextWithLink.push(
          //   data.messages[data.messages.length - 1]
          // );
          for (let word of sampleTextWithLink) {
            // try {
            await wait(2);
            controller.enqueue(
              encoder.encode(
                JSON.stringify({
                  text: word,
                }) + "\n"
              )
            );
            mutables.total_tokens += 1;
          }
          controller.close(); // Close the stream
        } catch (err) {
          // console.log("***streaming error***:", err.code);
          // controller.error(error);
          if (err.code === "ECONNRESET" || err.name === "AbortError") {
            console.log("🔌 Client disconnected / aborted");
          } else if (err.code === "ERR_INVALID_STATE") {
            console.log("⚠️ Tried writing to closed stream, ignoring");
          } else {
            console.error("❌ Unexpected streaming error:", err);
          }
          try {
            controller.close();
          } catch {}
        } finally {
          console.log("UPDATING TOKEN USAGE");
          console.log("mutables.total_tokens", mutables.total_tokens);
          // UPDATE TOKENS HERE START
          // update usage
          fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/api/tokens`, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              amount: mutables.total_tokens,
              email: data.email,
            }),
          });
          //
          // UPDATE TOKENS HERE END
        }
      },
    });

    return new Response(stream, {
      headers: {
        "Content-Type": "application/json",
      },
    });
  } else {
    console.log(`Model ${data.model.model} not found in any list.`);
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
async function get_search_results_tavily(query) {
  const res = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/api/tavily`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ query: query }),
  });
  const data = await res.json();
  return data;
}
async function getOpenAIResponse({
  controller,
  encoder,
  convertedMessages,
  model,
  reasoning,
  extraConfigs,
  search,
  agentic,
  searchCost,
  mutables,
}) {
  // console.log("convertedMessages", convertedMessages);
  // return;
  const toolCalls = [];
  let llmResponseText = "";
  if (search) {
    mutables.total_tokens += searchCost * 2;
  }
  const streamResponse = await openai.responses.create({
    input: convertedMessages,
    model: model,
    stream: true,
    // stream_options: { include_usage: true },
    max_output_tokens: 16384,
    ...reasoning,
    ...extraConfigs,
  });

  for await (const chunk of streamResponse) {
    // console.log("chunk", chunk);
    if (chunk.type === "response.output_item.done") {
      convertedMessages.push(chunk?.item);
    }
    if (
      chunk.type === "response.output_item.done" &&
      chunk?.item?.type === "function_call"
    ) {
      if (chunk?.item?.name === "get_search_results") {
        toolCalls.push({
          type: chunk.item?.type,
          arguments: chunk.item?.arguments,
          call_id: chunk.item?.call_id,
          name: chunk.item?.name,
        });
      }
    }
    if (
      chunk.type === "response.output_item.done" &&
      chunk?.item?.action?.query
    ) {
      controller.enqueue(
        encoder.encode(
          JSON.stringify({
            text:
              "\n\n<query>\n\n" +
              chunk?.item?.action?.query +
              "\n\n</query>\n\n",
          }) + "\n"
        )
      );
      // console.log("chunk", chunk);
    }
    if (
      chunk.type === "response.output_item.done" &&
      chunk?.item?.action?.sources
    ) {
      const openAISearchResults = chunk?.item?.action?.sources; // array of {type, url}

      controller.enqueue(
        encoder.encode(
          JSON.stringify({
            openai_search_results: openAISearchResults,
          }) + "\n"
        )
      );
      // console.log("chunk", chunk);
    }
    if (chunk.type == "response.output_text.annotation.added") {
      const citationElement =
        '<sup><a href="' +
        chunk?.annotation?.url +
        '" target="_blank" rel="noopener noreferrer" ' +
        'title="' +
        chunk?.annotation?.title +
        '" ' +
        'class="citation-link" ' +
        ">" +
        mutables.citationNumber +
        "</a></sup>";
      mutables.citationNumber += 1;
      controller.enqueue(
        encoder.encode(
          JSON.stringify({
            text: citationElement,
          }) + "\n"
        )
      );
      // console.log("chunk", chunk);
    }
    if (chunk.type === "response.output_text.delta") {
      // controller.enqueue(encoder.encode(chunk?.delta));
      llmResponseText += chunk?.delta;
      controller.enqueue(
        encoder.encode(
          JSON.stringify({
            text: chunk?.delta,
          }) + "\n"
        )
      );
    }
    if (chunk.type === "response.completed") {
      mutables.total_tokens += chunk?.response?.usage?.total_tokens;
    }
  }
  // if tool called -> call the tools
  if (toolCalls.length > 0) {
    const toolCallResults = await callTheTools({
      toolCalls,
      controller,
      encoder,
      convertedMessages,
      model,
      reasoning,
      extraConfigs,
      search,
      searchCost,
      mutables,
    });
    convertedMessages.push(...toolCallResults);
    // console.log("convertedMessages", convertedMessages);

    // call openAI API again
    await getOpenAIResponse({
      controller,
      encoder,
      convertedMessages,
      model: model,
      reasoning,
      extraConfigs,
      search: search,
      agentic,
      searchCost,
      mutables: mutables,
    });
    //
  }
  // console.log("convertedMessages", convertedMessages);
  controller.close(); // Close the stream
}
async function callTheTools({
  toolCalls,
  controller,
  encoder,
  convertedMessages,
  model,
  reasoning,
  extraConfigs,
  search,
  searchCost,
  mutables,
}) {
  const toolCallResults = [];
  // console.log("toolCalls", toolCalls);

  for (const toolCall of toolCalls) {
    mutables.total_tokens += searchCost;
    try {
      const queryObj = JSON.parse(toolCall?.arguments);
      const query = queryObj?.query;
      controller.enqueue(
        encoder.encode(
          JSON.stringify({
            text: "\n```query\n" + JSON.stringify(query) + "\n```\n",
          }) + "\n"
        )
      );
    } catch {}
    const res = await callTool({ toolCall, controller, encoder });

    // console.log("res", res);
    toolCallResults.push(res);
  }
  // console.log("toolCallResults", toolCallResults);
  return toolCallResults;
}

async function callTool({ toolCall, controller, encoder }) {
  try {
    const queryObj = JSON.parse(toolCall?.arguments);
    const query = queryObj?.query;
    if (!query) {
      console.log("ERROR in callTool");
      return;
    }
    const search_results_tavily = await get_search_results_tavily(query);
    // const search_results_tavily = basic_search;
    // const search_results_tavily =
    // "the temperature in london is 50 degrees celcius";
    // console.log("search_results_tavily", search_results_tavily);

    const minimalResults = search_results_tavily?.results.map((r) => {
      return { url: r.url, title: r.title, content: r.content, score: r.score };
    });

    controller.enqueue(
      encoder.encode(
        JSON.stringify({
          text: "\n```search\n" + JSON.stringify(minimalResults) + "\n```\n",
        }) + "\n"
      )
    );

    const tool_output = {
      type: "function_call_output",
      call_id: toolCall?.call_id,
      output: JSON.stringify(minimalResults),
    };
    return tool_output;
  } catch {}
}
function convertToOpenAIResponsesFormat({ agentic, messages }) {
  let hasImage = false;
  let hasDeveloper = false;
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
    } else if (agentic) {
      const currentDate = new Date().toISOString();
      if (m.role === "developer") {
        const devM = {
          content: "Current date: " + currentDate + "\n" + m.content,
          role: "developer",
        };
        hasDeveloper = true;
        return devM;
      }
    }
    {
      return m;
    }
  });
  if (agentic && !hasDeveloper) {
    const currentDate = new Date().toISOString();
    return {
      convertedMessages: [
        {
          content: "Current date: " + currentDate,
          role: "developer",
        },
        ...converted,
      ],
      hasImage: hasImage,
    };
  } else {
    return { convertedMessages: converted, hasImage: hasImage };
  }
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

const openAI_tools = [
  {
    type: "function",
    name: "get_search_results",
    description: "Retrieves search results for the provided query",
    parameters: {
      type: "object",
      properties: {
        query: {
          type: "string",
          description:
            "The query sent to the search tool. The search tool searches the web using query. query is natural language text.",
        },
      },
      required: ["query"],
      additionalProperties: false,
    },
    strict: true,
  },
];

let sampleTextWithLink = [];
sampleTextWithLink.push("<think> a ");
sampleTextWithLink.push("person lives on. <sup>");
sampleTextWithLink.push("[ Sampling and Data | Introduction to Statistics ");
sampleTextWithLink.push(
  "](https://courses.lumenlearning.com/introstats1/chapter/sampling-and-data/)</sup>"
);
sampleTextWithLink.push(" Quantitative data, samples.</think>");
sampleTextWithLink.push("The main topics are here...\n");
sampleTextWithLink.push("<tool>");
sampleTextWithLink.push("call a tool\n");
sampleTextWithLink.push("</tool>");
sampleTextWithLink.push("# Heading\n\n");
sampleTextWithLink.push("The rest of the text");
