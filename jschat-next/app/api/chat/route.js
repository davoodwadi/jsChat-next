// import { openai } from "@ai-sdk/openai";
import { streamText } from "ai";
import OpenAI from "openai";
const openai = new OpenAI({
  apiKey: process.env["OPENAI_KEY"],
  timeout: 3600 * 1000,
});
const xAI = new OpenAI({
  apiKey: process.env["XAI_API_KEY"],
  baseURL: "https://api.x.ai/v1",
  timeout: 360000, // Override default timeout with longer timeout for reasoning models
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

const alibabaClient = new OpenAI({
  // If environment variables are not configured, replace the following line with: apiKey: "sk-xxx",
  apiKey: process.env.DASHSCOPE_API_KEY,
  baseURL: "https://dashscope-intl.aliyuncs.com/compatible-mode/v1",
});

import {
  groqModels,
  openaiModels,
  deepinfraModels,
  anthropicModels,
  xAIModels,
  geminiModels,
  perplexityModels,
  alibabaModels,
} from "@/app/models";

import { updateGroundingChunksWithActualLinksAndTitles } from "@/components/searchGroundingUtils";
import { allModelsWithoutIcon } from "@/app/models";
import { headers } from "next/headers";
// import { host } from "@/auth";

// // Allow streaming responses up to 30 seconds
// export const maxDuration = 30
// export const runtime = "edge";

export async function POST(req) {
  const data = await req.json();

  // 1. Get the host from headers
  const head = await headers();
  const host = head.get("host");
  const protocol = host.includes("local") ? "http://" : "https://";

  const baseUrl = protocol + host;
  // console.log("baseUrl", baseUrl);
  // if (baseUrl.includes("spreed")) {
  //   console.log("EdgeRuntime", EdgeRuntime);
  // }

  // console.log(data.model)
  // console.log("route runtime", process.env.NEXT_RUNTIME);
  // revalidatePath("/", "layout");
  // console.log("model server", data.model.model);
  // console.log("server deepResearch", data?.modelConfig?.deepResearch);
  // console.log("server search", data.modelConfig?.search);
  // return;

  const mutables = { total_tokens: 0 };
  const searchCost = 20000;
  if (anthropicModels.includes(data.model.model)) {
    const { convertedMessages, system } = convertToAnthropicFormat(
      data.messages,
    );
    const stream = new ReadableStream({
      async start(controller) {
        try {
          const encoder = new TextEncoder();
          const thinking =
            data.model.hasReasoning && data.modelConfig.reasoning
              ? { thinking: { type: "enabled", budget_tokens: 16000 } }
              : {};

          // console.log("thinking", thinking);

          // console.log("messages", messages);
          // console.log("system", system);
          const streamResponse = await anthropic.messages.create({
            max_tokens: 64000,
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
            } else if (messageStreamEvent.type === "content_block_delta") {
              // messageStreamEvent.delta.text
              if (messageStreamEvent?.delta?.type === "thinking_delta") {
                // controller.enqueue(
                //   encoder.encode(messageStreamEvent?.delta?.thinking)
                // );
                controller.enqueue(
                  encoder.encode(
                    JSON.stringify({
                      think: messageStreamEvent?.delta?.thinking,
                    }) + "\n",
                  ),
                );
              } else {
                // controller.enqueue(
                //   encoder.encode(messageStreamEvent?.delta?.text)
                // );
                controller.enqueue(
                  encoder.encode(
                    JSON.stringify({
                      text: messageStreamEvent?.delta?.text,
                    }) + "\n",
                  ),
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
          fetch(`${baseUrl}/api/tokens`, {
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
            data.messages,
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
                  }) + "\n",
                ),
              );
            } else if (chunk.choices[0]?.delta?.reasoning) {
              controller.enqueue(
                encoder.encode(
                  JSON.stringify({
                    text: chunk.choices[0]?.delta?.reasoning,
                  }) + "\n",
                ),
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
          fetch(`${baseUrl}/api/tokens`, {
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
      data.messages,
    );
    const modelMeta = allModelsWithoutIcon.find(
      (m) => m.model === data.model.model,
    );
    if (!modelMeta.vision && hasImage) {
      // console.log("model does not have vision capabilities", data.model.model);
      return new Response(
        JSON.stringify({
          error: `${data.model.model} does not support vision`,
        }),
        { status: 400, headers: { "Content-Type": "application/json" } },
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
                  }) + "\n",
                ),
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
          fetch(`${baseUrl}/api/tokens`, {
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
          const agentic = data?.modelConfig?.agentic && data.model.hasAgentic;
          const search = data?.modelConfig?.search && data.model.hasSearch;
          const isDeepResearchModel = data?.model.hasDeepResearch;

          let reasoning = {};
          let extraConfigs = {
            tools: [],
            max_output_tokens: 16384,
            include: [],
          };
          // console.log("key", process.env["OPENAI_KEY"]);
          const { convertedMessages, hasImage } =
            convertToOpenAIResponsesFormat({
              messages: data.messages,
              agentic,
            });
          // console.dir(convertedMessages, { depth: null });
          // return;
          // const legacyMessages = convertToOpenAIFormat(data.messages);
          // console.log("data.model", data.model);
          if (data.model.name.includes("5.2")) {
            extraConfigs.max_output_tokens = 127000;
          }
          // return;
          if (data.modelConfig.reasoning && data.model.hasReasoning) {
            if (data.model.name.includes("5.2")) {
              if (baseUrl.includes("spreed")) {
                // prevent 5 minute timeout on spreed
                reasoning = { reasoning: { effort: "high" } };
              } else {
                reasoning = { reasoning: { effort: "xhigh" } };
              }
            } else {
              reasoning = { reasoning: { effort: "high" } };
            }
            extraConfigs.include.push("reasoning.encrypted_content");
          }

          // console.log("data.model", data.model);
          // console.log("reasoning", reasoning);
          // return;

          if (search) {
            extraConfigs["tools"].push({
              type: "web_search",
              search_context_size: "high",
            });
            extraConfigs["include"].push("web_search_call.action.sources");
          } else if (isDeepResearchModel) {
            // Deep research models require at least one of 'web_search_preview', 'mcp', or 'file_search' tools.
            // Deep research models only support search_context_size \'medium\'.
            extraConfigs["tools"].push({
              type: "web_search",
              search_context_size: "medium",
            });
            extraConfigs["include"].push("web_search_call.action.sources");
            //  'high' is not supported with the 'o4-mini-deep-research' model. Supported values are: 'medium'.
            reasoning = { reasoning: { effort: "medium" } };
          }
          controller.enqueue(
            encoder.encode(
              JSON.stringify({
                signal: JSON.stringify(reasoning),
              }) + "\n",
            ),
          );
          controller.enqueue(
            encoder.encode(
              JSON.stringify({
                signal: JSON.stringify(extraConfigs),
              }) + "\n",
            ),
          );
          if (agentic) {
            extraConfigs["tools"].push(...openAI_tools);
          }
          // console.log("extraConfigs", extraConfigs);
          // controller.close();
          // return;
          // const response = await openai.responses.inputTokens.count({
          //   model: data.model.model,
          //   input: convertedMessages,
          // });
          // console.log("response.input_tokens", response.input_tokens);

          await getOpenAIResponse({
            controller,
            encoder,
            convertedMessages,
            model: data.model.model,
            reasoning,
            extraConfigs,
            search,
            agentic,
            isDeepResearchModel,
            searchCost,
            mutables: mutables,
          });
        } catch (err) {
          if (err.code === "ECONNRESET" || err.name === "AbortError") {
            console.log("🔌 Client disconnected / aborted");
          } else if (err.code === "ERR_INVALID_STATE") {
            console.log("⚠️ Tried writing to closed stream, ignoring");
          } else {
            console.log("❌ Unexpected streaming error:", err);
          }
          try {
            controller.close();
          } catch {}
        } finally {
          console.log("UPDATING TOKEN USAGE");
          console.log("mutables.total_tokens", mutables.total_tokens);
          // UPDATE TOKENS HERE START
          // update usage
          fetch(`${baseUrl}/api/tokens`, {
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
    // console.log(data);
    // return;
    const isReasoning = data.modelConfig.reasoning;
    const reasoning = isReasoning ? { reasoning_effort: "high" } : {};

    const { convertedMessages, hasImage } = convertToOpenAIResponsesFormatXAI({
      messages: data.messages,
      agentic: false,
    });

    const modelMeta = allModelsWithoutIcon.find(
      (m) => m.model === data.model.model,
    );
    if (!modelMeta.vision && hasImage) {
      console.log("model does not have vision capabilities", data.model.model);
      return new Response(
        JSON.stringify({
          error: `${data.model.model} does not support vision`,
        }),
        { status: 400, headers: { "Content-Type": "application/json" } },
      );
    }
    // console.log("reasoning", reasoning);
    // return;
    const stream = new ReadableStream({
      async start(controller) {
        try {
          const encoder = new TextEncoder();

          const streamResponse = await xAI.responses.create({
            model: data.model.model,
            input: convertedMessages,
            stream: true,
            ...reasoning,
            // include: ["reasoning.encrypted_content"],
          });

          for await (const chunk of streamResponse) {
            // console.log("chunk", chunk);
            if (chunk.type === "response.reasoning_summary_text.delta") {
              controller.enqueue(
                encoder.encode(
                  JSON.stringify({
                    think: chunk?.delta,
                  }) + "\n",
                ),
              );
            }
            if (chunk.type === "response.output_text.delta") {
              controller.enqueue(
                encoder.encode(
                  JSON.stringify({
                    text: chunk?.delta,
                  }) + "\n",
                ),
              );
            }
            if (chunk.type === "response.completed") {
              mutables.total_tokens += chunk?.response?.usage?.total_tokens;
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
          fetch(`${baseUrl}/api/tokens`, {
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
      data.messages,
    );
    let streamConfig = {
      config: {
        systemInstruction: system?.content ? system.content : null,
      },
    };

    const isGemini3 = data.model.model.includes("gemini-3");
    if (isGemini3) {
      if (data.modelConfig.reasoning && data.model.hasReasoning) {
        streamConfig.config["thinkingConfig"] = {
          thinkingLevel: "high",
          includeThoughts: true,
          // thinkingBudget: -1,
        };
      } else if (!data.modelConfig.reasoning) {
        // console.log("no reasoning");
        if (data.model.model.includes("gemini-3-flash-preview")) {
          streamConfig.config["thinkingConfig"] = {
            thinkingLevel: "minimal",
            includeThoughts: true,
            // thinkingBudget: 0,
          };
        } else {
          streamConfig.config["thinkingConfig"] = {
            thinkingLevel: "low",
            includeThoughts: true,
            // thinkingBudget: 0,
          };
        }
      }
    } else {
      if (data.modelConfig.reasoning && data.model.hasReasoning) {
        streamConfig.config["thinkingConfig"] = {
          includeThoughts: true,
        };
      } else {
        streamConfig.config["thinkingConfig"] = {
          includeThoughts: true,
          thinkingBudget: 0,
        };
      }
    }
    streamConfig = data?.modelConfig?.search
      ? {
          ...streamConfig,
          config: { ...streamConfig.config, tools: [{ googleSearch: {} }] },
        }
      : streamConfig;

    if (data?.modelConfig?.search) {
      mutables.total_tokens += searchCost;
      console.log("adding searchCost", mutables.total_tokens);
    }
    // console.log(streamConfig);
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
          // console.dir(history, { depth: null, colors: true });

          const stream = await chat.sendMessageStream({
            message: newUserMessage,
          });
          for await (const chunk of stream) {
            // console.log(
            //   "chunk.candidates[0]?.content",
            //   chunk.candidates[0]?.content,
            // );
            // console.dir(chunk, { depth: null, colors: true });

            if (chunk?.candidates[0]?.finishReason === "STOP") {
              const usageMetadata = chunk?.usageMetadata;
              mutables.total_tokens += usageMetadata?.totalTokenCount;
            }
            // console.log("usageMetadata", usageMetadata);
            try {
              if (chunk?.candidates[0]?.content?.parts[0]?.text) {
                if (chunk?.candidates[0]?.content?.parts[0]?.thought) {
                  // thinking tokens
                  controller.enqueue(
                    encoder.encode(
                      JSON.stringify({
                        think: chunk?.candidates[0]?.content?.parts[0]?.text,
                      }) + "\n",
                    ),
                  );
                } else {
                  // text tokens
                  controller.enqueue(
                    encoder.encode(
                      JSON.stringify({
                        text: chunk?.candidates[0]?.content?.parts[0]?.text,
                      }) + "\n",
                    ),
                  );
                }
              }
              // send thoughtSignature
              if (chunk?.candidates[0]?.content?.parts[0]?.thoughtSignature) {
                controller.enqueue(
                  encoder.encode(
                    JSON.stringify({
                      thoughtSignature:
                        chunk?.candidates[0]?.content?.parts[0]
                          ?.thoughtSignature,
                    }) + "\n",
                  ),
                );
              }

              const groundingMetadata = chunk?.candidates[0]?.groundingMetadata;

              if (groundingMetadata?.webSearchQueries) {
                for (const query of groundingMetadata?.webSearchQueries) {
                  controller.enqueue(
                    encoder.encode(
                      JSON.stringify({
                        query: query,
                      }) + "\n",
                    ),
                  );
                }
              }
              if (groundingMetadata?.groundingChunks) {
                // console.log(
                //   "groundingMetadata?.groundingChunks",
                //   groundingMetadata?.groundingChunks,
                // );
                const groundingChunksRedirect =
                  await updateGroundingChunksWithActualLinksAndTitles(
                    groundingMetadata?.groundingChunks,
                  );
                controller.enqueue(
                  encoder.encode(
                    JSON.stringify({
                      groundingChunks: groundingChunksRedirect,
                    }) + "\n",
                  ),
                );
              }

              if (groundingMetadata?.groundingSupports) {
                // console.log("groundingMetadata?.groundingSupports", groundingMetadata?.groundingSupports);
                controller.enqueue(
                  encoder.encode(
                    JSON.stringify({
                      groundingSupports: groundingMetadata?.groundingSupports,
                    }) + "\n",
                  ),
                );
              }
            } catch (e) {
              console.log(e);
            }
          }

          // console.dir(chat.getHistory(), { depth: null, colors: true });

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
          fetch(`${baseUrl}/api/tokens`, {
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
      data.messages,
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
                  }) + "\n",
                ),
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
                  }) + "\n",
                ),
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
          fetch(`${baseUrl}/api/tokens`, {
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
  } else if (alibabaModels.includes(data.model.model)) {
    console.log("alibaba cloud", data.model.model);

    // let extraConfigs = {
    //   web_search_options: { search_context_size: "low" },
    // };
    const extraConfigs = data.model.reasoning ? { enable_thinking: true } : {};
    // console.log("extraConfigs", extraConfigs);
    // console.log("data.model", data.model);

    // console.log("data.model.model", data.model.model);
    // return;

    const { convertedMessages, hasImage } = convertToOpenAIFormat(
      data.messages,
    );
    let usage;
    const stream = new ReadableStream({
      async start(controller) {
        try {
          const encoder = new TextEncoder();
          const stream = await alibabaClient.chat.completions.create({
            model: data.model.model,
            messages: convertedMessages,
            stream: true,
            stream_options: { include_usage: true },
            ...extraConfigs,
          });

          for await (const chunk of stream) {
            // console.log("chunk", chunk);
            // await wait(2000);
            const content = chunk.choices?.[0]?.delta?.content;
            const reasoning_content =
              chunk.choices?.[0]?.delta?.reasoning_content;
            if (reasoning_content) {
              controller.enqueue(
                encoder.encode(
                  JSON.stringify({
                    think: reasoning_content,
                  }) + "\n",
                ),
              );
            }
            if (content) {
              controller.enqueue(
                encoder.encode(
                  JSON.stringify({
                    text: content,
                  }) + "\n",
                ),
              );
            }
            if (chunk?.usage) {
              usage = chunk.usage;
              // console.log("usage", usage);
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

          console.log("mutables.total_tokens", mutables.total_tokens);
          // UPDATE TOKENS HERE START
          // update usage
          fetch(`${baseUrl}/api/tokens`, {
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
    const reasoning = data.modelConfig?.reasoning;

    console.log(
      "data.modelConfig.reasoning && data.model.hasReasoning",
      data.modelConfig.reasoning && data.model.hasReasoning,
    );

    const { convertedMessages, hasImage } = convertToOpenAIResponsesFormat({
      messages: data.messages,
      agentic: false,
    });

    const stream = new ReadableStream({
      async start(controller) {
        try {
          const encoder = new TextEncoder();

          // console.log(data.messages[data.messages.length - 1]);

          for (let chunk of sampleEvents) {
            await wait(5);
            console.log("waited 5 seconds");
            controller.enqueue(
              encoder.encode(
                JSON.stringify({
                  signal: "",
                }) + "\n",
              ),
            );
            // console.log("chunk", chunk);
            // try {
            if (chunk.type === "response.output_text.delta") {
              controller.enqueue(
                encoder.encode(
                  JSON.stringify({
                    text: chunk.delta,
                  }) + "\n",
                ),
              );
            }
            if (chunk.type === "response.output_item.done") {
              // console.log("chunk", chunk);
              // add item to message history
              convertedMessages.push(chunk?.item);

              if (
                chunk?.item?.type === "function_call" &&
                chunk?.item?.name === "get_search_results"
              ) {
                toolCalls.push({
                  type: chunk.item?.type,
                  arguments: chunk.item?.arguments,
                  call_id: chunk.item?.call_id,
                  name: chunk.item?.name,
                });
              }
              if (chunk?.item?.type === "web_search_call") {
                // add search cost
                mutables.total_tokens += searchCost * 2;

                if (chunk?.item?.action?.type === "search") {
                  // add the search query
                  controller.enqueue(
                    encoder.encode(
                      JSON.stringify({
                        query: chunk?.item?.action?.query,
                      }) + "\n",
                    ),
                  );

                  // add the search sources
                  const openAISearchResults = chunk?.item?.action?.sources; // array of {type, url}
                  controller.enqueue(
                    encoder.encode(
                      JSON.stringify({
                        openai_search_results: openAISearchResults,
                      }) + "\n",
                    ),
                  );
                }

                // deep research model
                if (
                  chunk?.item?.action?.type === "open_page" ||
                  chunk?.item?.action?.type === "find"
                ) {
                  // add the open_page details
                  // chunk?.item?.action: {type, url}
                  controller.enqueue(
                    encoder.encode(
                      JSON.stringify({
                        query: chunk?.item?.action,
                      }) + "\n",
                    ),
                  );
                }
              }
            }
            if (chunk.type === "response.completed") {
              // console.log("final chunk", chunk);
              mutables.total_tokens += chunk?.response?.usage?.total_tokens;
            }
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
          fetch(`${baseUrl}/api/tokens`, {
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
  const res = await fetch(`${baseUrl}/api/tavily`, {
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
  isDeepResearchModel,
  searchCost,
  mutables,
}) {
  // console.log("convertedMessages", convertedMessages);
  // return;
  const toolCalls = [];
  let llmResponseText = "";
  // if (search) {
  //   mutables.total_tokens += searchCost * 2;
  // }
  // if (isDeepResearchModel) {
  //   mutables.total_tokens += searchCost * 2;
  // }
  // console.log(extraConfigs);
  // return;
  const streamResponse = await openai.responses.create({
    input: convertedMessages,
    model: model,
    stream: true,
    // stream_options: { include_usage: true },
    // max_output_tokens: isDeepResearchModel ? 100000 : 16384,
    ...reasoning,
    ...extraConfigs,
  });

  controller.enqueue(
    encoder.encode(
      JSON.stringify({
        signal: true,
      }) + "\n",
    ),
  );

  for await (const chunk of streamResponse) {
    // console.dir(chunk, { depth: null });
    if (chunk.type === "response.created") {
      controller.enqueue(
        encoder.encode(
          JSON.stringify({
            signal: true,
          }) + "\n",
        ),
      );
    }
    if (chunk.type === "response.output_text.delta") {
      // controller.enqueue(encoder.encode(chunk?.delta));
      llmResponseText += chunk?.delta;
      controller.enqueue(
        encoder.encode(
          JSON.stringify({
            text: chunk?.delta,
          }) + "\n",
        ),
      );
    } else if (chunk.type === "response.output_item.done") {
      // console.log("chunk", chunk);
      // add item to message history
      convertedMessages.push(chunk?.item);

      if (
        chunk?.item?.type === "function_call" &&
        chunk?.item?.name === "get_search_results"
      ) {
        toolCalls.push({
          type: chunk.item?.type,
          arguments: chunk.item?.arguments,
          call_id: chunk.item?.call_id,
          name: chunk.item?.name,
        });
      }
      if (chunk?.item?.type === "web_search_call") {
        // add search cost
        mutables.total_tokens += searchCost * 2;
        // console.log("chunk", chunk);
        if (chunk?.item?.action?.type === "search") {
          // add the search query
          controller.enqueue(
            encoder.encode(
              JSON.stringify({
                query: chunk?.item?.action?.query,
              }) + "\n",
            ),
          );

          // add the search sources
          const openAISearchResults = chunk?.item?.action?.sources; // array of {type, url}
          controller.enqueue(
            encoder.encode(
              JSON.stringify({
                openai_search_results: openAISearchResults,
              }) + "\n",
            ),
          );
        } else {
          // deep research model
          // find_in_page, open_page, etc.
          // chunk?.item?.action: {type, url}
          controller.enqueue(
            encoder.encode(
              JSON.stringify({
                query: chunk?.item?.action,
              }) + "\n",
            ),
          );
        }
      }
    } else if (chunk.type == "response.output_text.annotation.added") {
      // console.log("annotation chunk:", chunk);
      controller.enqueue(
        encoder.encode(
          JSON.stringify({
            annotation_item: chunk,
          }) + "\n",
        ),
      );
    } else if (chunk.type === "response.completed") {
      mutables.total_tokens += chunk?.response?.usage?.total_tokens;

      controller.enqueue(
        encoder.encode(
          JSON.stringify({
            openaiResponseOutput: JSON.stringify(chunk.response.output),
          }) + "\n",
        ),
      );
    } else if (chunk.type === "response.incomplete") {
      controller.enqueue(
        encoder.encode(
          JSON.stringify({
            signal: JSON.stringify(chunk),
          }) + "\n",
        ),
      );
      console.log("INCOMPLETE");
      console.log(chunk);
    } else {
      controller.enqueue(
        encoder.encode(
          JSON.stringify({
            signal: chunk.type,
          }) + "\n",
        ),
      );
    }
  }
  // if tool called -> call the tools
  if (toolCalls.length > 0) {
    // console.log("model called tools");
    // console.log(toolCalls);
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
      search,
      agentic,
      isDeepResearchModel,
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
            query: query,
          }) + "\n",
        ),
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
          search: JSON.stringify(minimalResults),
        }) + "\n",
      ),
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
  // console.log("messages", messages);
  const converted = [];
  for (const m of messages) {
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
      converted.push(userM);
    } else if (agentic && m.role === "developer") {
      const currentDate = new Date().toISOString();
      const devM = {
        content: "Current date: " + currentDate + "\n" + m.content,
        role: "developer",
      };
      hasDeveloper = true;
      converted.push(devM);
    } else if (m.role === "assistant" && m?.openaiResponseOutput) {
      const openaiResponseOutput = JSON.parse(m.openaiResponseOutput);
      // console.log("openaiResponseOutput", openaiResponseOutput);
      converted.push(...openaiResponseOutput);
    } else {
      converted.push(m);
    }
  }

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

function convertToOpenAIResponsesFormatXAI({ agentic, messages }) {
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
  // console.log("messages", messages);
  const convertedMessages = [];
  // const convertedMessages = messages
  // .filter((m) => m.role !== "system")
  for (const msg of messages) {
    // console.log(msg);
    if (msg.role === "user") {
      const userM = {
        role: "user",
        parts: [],
      };
      if (msg.content.image) {
        userM.parts.push(formatBase64ImageGoogle(msg.content.image));
      }
      userM.parts.push({ text: msg.content.text ? msg.content.text : "" });
      convertedMessages.push(userM);
    } else if (msg.role === "assistant") {
      const modelM = {
        role: "model",
        parts: [{ text: msg.content ? msg.content : "" }],
      };
      convertedMessages.push(modelM);

      if (msg?.thoughtSignature) {
        const thoughtSignaturePart = {
          role: "model",
          parts: [{ text: "", thoughtSignature: msg.thoughtSignature }],
        };
        convertedMessages.push(thoughtSignaturePart);
      }
    }
  }

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

function formatBase64ImageGoogle(base64String) {
  const matches = base64String.match(/^data:(image\/[a-zA-Z]+);base64,(.+)$/);

  if (!matches || matches.length !== 3) {
    throw new Error("Invalid base64 image string");
  }

  const mediaType = matches[1]; // e.g., image/jpeg
  const base64Data = matches[2]; // the actual base64 string
  return {
    inlineData: {
      mimeType: mediaType,
      data: base64Data,
    },
  };
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

let sampleEvents = [];
sampleEvents.push({
  type: "response.output_text.delta",
  item_id: "msg_123",
  output_index: 0,
  content_index: 0,
  delta: "1\n\n",
  sequence_number: 1,
});

sampleEvents.push({
  type: "response.output_text.delta",
  item_id: "msg_123",
  output_index: 0,
  content_index: 0,
  delta: "2\n\n",
  sequence_number: 1,
});

sampleEvents.push({
  type: "response.output_text.delta",
  item_id: "msg_123",
  output_index: 0,
  content_index: 0,
  delta: "3\n\n",
  sequence_number: 1,
});

sampleEvents.push({
  type: "response.output_item.done",
  item_id: "msg_123",
  output_index: 0,
  content_index: 0,
  item: {
    type: "web_search_call",
    action: {
      type: "search",
      query: "question 1",
      sources: [
        { type: "url", url: "https://some-address.com" },
        { type: "url", url: "https://some-address.com" },
      ],
    },
  },
  sequence_number: 1,
});

sampleEvents.push({
  type: "response.output_item.done",
  item_id: "msg_123",
  output_index: 0,
  content_index: 0,
  item: {
    type: "web_search_call",
    action: {
      type: "open_page",
      url: "https://some-address.com",
    },
  },
  sequence_number: 1,
});

sampleEvents.push({
  type: "response.output_item.done",
  item_id: "msg_123",
  output_index: 0,
  content_index: 0,
  item: {
    type: "web_search_call",
    action: {
      type: "find",
      pattern: "some search PATTERN",
      url: "https://some-address.com",
    },
  },
  sequence_number: 1,
});

sampleEvents.push({
  type: "response.completed",
  response: {
    id: "resp_123",
    status: "completed",
    output: [
      {
        id: "msg_123",
        type: "message",
        role: "assistant",
        content: [
          {
            type: "output_text",
            text: "In a shimmering forest under a sky full of stars, a lonely unicorn named Lila discovered a hidden pond that glowed with moonlight. Every night, she would leave sparkling, magical flowers by the water's edge, hoping to share her beauty with others. One enchanting evening, she woke to find a group of friendly animals gathered around, eager to be friends and share in her magic.",
            annotations: [],
          },
        ],
      },
    ],
    text: {
      format: {
        type: "text",
      },
    },
    usage: {
      input_tokens: 0,
      output_tokens: 0,
      output_tokens_details: {
        reasoning_tokens: 0,
      },
      total_tokens: 33,
    },
  },
  sequence_number: 1,
});

let sampleTextWithLink = [];
sampleTextWithLink.push("<think> a ");
sampleTextWithLink.push("person lives on. <sup>");
sampleTextWithLink.push("[ Sampling and Data | Introduction to Statistics ");
sampleTextWithLink.push(
  "](https://courses.lumenlearning.com/introstats1/chapter/sampling-and-data/)</sup>",
);
sampleTextWithLink.push(" Quantitative data, samples.</think>");
sampleTextWithLink.push(
  "The main topics are here...klsfjsdlkfjsadfkjsadfksad;fkjasdfklsjadfl;ksadjfl;ksadjflkslkdfjsdklghdfjnvmcxvsadfjsfsdfhgksdjfs;dfjsadkfsad;lkfjsdl;fksajf;lksdjflskdfjsdlkfjsdflksdjf;lsdkfjsdlkfsdjflksdj\n",
);
sampleTextWithLink.push("\n```tool\n");
sampleTextWithLink.push("call a tool\n");
sampleTextWithLink.push("\n```");
sampleTextWithLink.push("# Heading\n\n");
sampleTextWithLink.push("The rest of the text");
