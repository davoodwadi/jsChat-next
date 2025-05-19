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
  geminiModels,
} from "@/app/models";
import {
  getOpenAICitations,
  getSearchResults,
  convertToAnthropicFormat,
  convertToDeepInfraFormat,
  convertToOpenAIFormat,
  convertToOpenAIResponsesFormat,
  convertToGoogleFormat,
  formatBase64ImageAnthropic,
  search_for_academic_papers_tool,
  search_for_academic_papers_tool_grok,
  search_for_academic_papers_tool_openai,
} from "./utils";
export const runtime = "edge";
const searchEndpoint = "papersearch";

import {
  addCitationsToContent,
  updateGroundingChunksWithActualLinksAndTitles,
} from "@/components/searchGroundingUtils";

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

const deepinfra = new OpenAI({
  apiKey: process.env.DEEPINFRA_TOKEN,
  baseURL: "https://api.deepinfra.com/v1/openai",
});

const openai = new OpenAI({
  apiKey: process.env["OPENAI_KEY"], // This is the default and can be omitted
});
const xAI = new OpenAI({
  apiKey: process.env["XAI_API_KEY"],
  baseURL: "https://api.x.ai/v1",
});

const anthropic = new Anthropic();

import { GoogleGenAI } from "@google/genai";
const googleAI = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

export async function POST(req) {
  const data = await req.json();
  console.log("data.webSearchOn", data.webSearchOn);
  console.log("model server", data.model);
  //   return;

  let usageTokens = 0;
  let responseText;
  let citationsArray;

  if (anthropicModels.includes(data.model)) {
    console.log("Anthropic Model", data.model);
    const thinking = data.model.includes("claude-3-7-sonnet")
      ? { thinking: { type: "enabled", budget_tokens: 8000 } }
      : {};
    const { convertedMessages, system } = convertToAnthropicFormat(
      data.messages
    );
    const systemCitation =
      system && data.webSearchOn
        ? system?.content +
          "Make sure you provide citations in APA style at the end of your response"
        : system?.content;
    const requestPayload = {
      model: data.model,
      system: systemCitation,
      messages: convertedMessages,
      max_tokens: 8192,
      ...thinking,
      ...(data.webSearchOn
        ? {
            tools: [search_for_academic_papers_tool],
            // tool_choice: { type: "tool", name: "search_for_academic_papers" },
          }
        : {}),
    };
    // console.log("requestPayload", requestPayload);
    // return new Response(JSON.stringify({}));
    const apiResponse = await anthropic.messages.create(requestPayload);
    // console.log("apiResponse", apiResponse);
    console.log("apiResponse.stop_reason", apiResponse.stop_reason);
    if (!data.webSearchOn) {
      // no web search -> just output the text
      const filteredText = apiResponse?.content.find((m) => m.type === "text");
      responseText = filteredText?.text;
      usageTokens += apiResponse?.usage?.input_tokens;
      usageTokens += apiResponse?.usage?.output_tokens;
    } else if (apiResponse.stop_reason === "tool_use") {
      usageTokens += apiResponse?.usage?.input_tokens;
      usageTokens += apiResponse?.usage?.output_tokens;
      const toolUse = apiResponse.content.find((r) => r.type === "tool_use");
      convertedMessages.push({
        role: "assistant",
        content: apiResponse.content,
      });
      //   console.log("toolUse", toolUse);
      //   console.log("toolUse.id", toolUse.id);
      //   console.log("toolUse?.input?.query", toolUse?.input?.query);
      if (!toolUse?.input?.query) return new Response(JSON.stringify({}));
      const query = toolUse.input.query;
      const search_results = await getSearchResults(query);
      convertedMessages.push({
        role: "user",
        content: [
          {
            type: "tool_result",
            tool_use_id: toolUse.id,
            content: JSON.stringify(search_results),
          },
        ],
      });
      //   console.log("convertedMessages", convertedMessages);
      //   console.log("search_results", search_results);
      const requestPayload2 = {
        model: data.model,
        system: systemCitation,
        messages: convertedMessages,
        max_tokens: 8192,
        ...thinking,
        ...(data.webSearchOn
          ? {
              tools: [search_for_academic_papers_tool],
              // tool_choice: { type: "tool", name: "search_for_academic_papers" },
            }
          : {}),
      };
      // console.log("requestPayload2", requestPayload2);
      const apiResponse2 = await anthropic.messages.create(requestPayload2);
      // console.log("apiResponse2", apiResponse2);
      const filteredText = apiResponse2?.content.find((m) => m.type === "text");
      if (!filteredText) {
        const response2 = apiResponse2?.content.find(
          (m) => m.type === "tool_use"
        );
        console.log("response2", response2);
      }
      responseText = filteredText?.text;
      usageTokens += apiResponse2?.usage?.input_tokens;
      usageTokens += apiResponse2?.usage?.output_tokens;
    }

    // console.log("responseText", responseText);
    // console.log("usageTokens", usageTokens);
    // console.log("email", data.email);
  } else if (groqModels.includes(data.model)) {
    console.log("groq");

    const { convertedMessages, hasImage } = convertToOpenAIFormat(
      data.messages
    );
    const apiResponse = await groq.chat.completions.create({
      messages: convertedMessages,
      model: data.model,
      max_completion_tokens: 8191,
    });
    usageTokens = apiResponse?.usage?.total_tokens;
    responseText = apiResponse?.choices[0]?.message?.content;
    // console.log("responseText", responseText);
    // console.log("usageTokens", usageTokens);
    // console.log("email", data.email);
    // console.log("apiResponse", apiResponse);
    if (data.webSearchOn) {
      usageTokens += 10000;
      // const citations = getOpenAICitations(apiResponse);
      //   console.log("citations", citations);
      // citationsArray = citations.citationsArray;
    }
  } else if (deepinfraModels.includes(data.model)) {
    const { convertedMessages, hasImage } = convertToDeepInfraFormat(
      data.messages
    );
    const apiResponse = await deepinfra.chat.completions.create({
      messages: convertedMessages,
      model: data.model,
      max_completion_tokens: 16384,
    });
    usageTokens = apiResponse?.usage?.total_tokens;
    responseText = apiResponse?.choices[0]?.message?.content;
    // console.log("responseText", responseText);
    // console.log("usageTokens", usageTokens);
    // console.log("email", data.email);
    // console.log("apiResponse", apiResponse);
  } else if (openaiModels.includes(data.model)) {
    const { convertedMessages, hasImage } = convertToOpenAIResponsesFormat(
      data.messages
    );

    const legacyMessages = convertToOpenAIFormat(data.messages);
    const reasoning =
      data.model.includes("o3-mini") || data.model.includes("o4-mini")
        ? { reasoning: { effort: "high" } }
        : {};

    if (data.model !== "gpt-4.1-mini" && data.model !== "gpt-4.1") {
      // o4-mini
      console.log("openai model manual web search");
      if (data.webSearchOn) {
        const requestPayload = {
          input: convertedMessages,
          model: data.model,
          max_output_tokens: 16384,
          ...reasoning,
          ...(data.webSearchOn
            ? {
                tools: [search_for_academic_papers_tool_openai],
                tool_choice: {
                  type: "function",
                  name: "search_for_academic_papers",
                },
              }
            : {}),
        };
        //
        const apiResponse = await openai.responses.create(requestPayload);
        usageTokens += apiResponse?.usage?.total_tokens;

        //   console.log("apiResponse", apiResponse);
        const toolCall = apiResponse.output.find(
          (o) => o.type === "function_call"
        );
        const args = JSON.parse(toolCall.arguments);
        const search_results = await getSearchResults(args.query);
        //   console.log("apiResponse.output", apiResponse.output);
        const convertedMessages2 = convertedMessages.concat(apiResponse.output); // append model's function call message
        convertedMessages2.push({
          // append result message
          type: "function_call_output",
          call_id: toolCall.call_id,
          output: JSON.stringify(search_results),
        });
        //   console.log("convertedMessages2", convertedMessages2);

        const requestPayload2 = {
          input: convertedMessages2,
          model: data.model,
          max_output_tokens: 16384,
          ...reasoning,
        };
        const apiResponse2 = await openai.responses.create(requestPayload2);
        responseText = apiResponse2.output_text;
        if (!responseText) {
          console.log("apiResponse2", apiResponse2);
        }
        usageTokens += apiResponse2?.usage?.total_tokens;
        usageTokens += 10000;
      } else {
        const requestPayload = {
          input: convertedMessages,
          model: data.model,
          max_output_tokens: 16384,
          ...reasoning,
        };
        //
        const apiResponse = await openai.responses.create(requestPayload);
        usageTokens += apiResponse?.usage?.total_tokens;
        responseText = apiResponse.output_text;
      }
    } else {
      console.log("openai no reasoning");
      const requestPayload = {
        input: convertedMessages,
        model: data.model,
        max_output_tokens: 16384,
        ...reasoning,
        ...(data.webSearchOn
          ? {
              tools: [
                { type: "web_search_preview", search_context_size: "high" },
              ],
              tool_choice: { type: "web_search_preview" },
            }
          : {}),
      };
      // console.log("requestPayload", requestPayload);
      // return new Response(JSON.stringify(requestPayload));
      const apiResponse = await openai.responses.create(requestPayload);
      responseText = apiResponse.output_text;
      usageTokens += apiResponse?.usage?.total_tokens;
      if (data.webSearchOn) {
        usageTokens += 10000;
        const citations = getOpenAICitations(apiResponse);
        //   console.log("citations", citations);
        //   responseText += `\n\nReferences\n\n${citations}`;
        citationsArray = citations.citationsArray;
        console.log("citationsArray", citationsArray);
        console.log("apiResponse", apiResponse);
      }
    }

    // console.log("responseText", responseText);
    // console.log("usageTokens", usageTokens);
    // console.log("email", data.email);
    // console.log("apiResponse", apiResponse);
  } else if (xAIModels.includes(data.model)) {
    console.log("xAI");
    const reasoning = data.model.includes("grok-3-mini-latest")
      ? { reasoning_effort: "high" }
      : {};
    const isReasoning = data.model.includes("grok-3-mini-latest");
    const { convertedMessages, hasImage } = convertToOpenAIFormat(
      data.messages
    );
    // console.log("convertedMessages", convertedMessages);
    const requestPayload = {
      messages: convertedMessages,
      model: data.model,
      max_completion_tokens: 16384,
      ...reasoning,
      ...(data.webSearchOn
        ? {
            tools: [search_for_academic_papers_tool_grok],
            tool_choice: {
              type: "function",
              function: { name: "search_for_academic_papers" },
            },
          }
        : {}),
    };
    const apiResponse = await xAI.chat.completions.create(requestPayload);
    // console.log("apiResponse", apiResponse);
    if (!data.webSearchOn) {
      usageTokens += apiResponse?.usage?.total_tokens;
      responseText = apiResponse?.choices[0]?.message?.content;
    } else {
      usageTokens += apiResponse?.usage?.total_tokens;
      const assistantResponse = apiResponse?.choices[0]?.message;
      // console.log("assistantResponse", assistantResponse);
      const toolCalls = assistantResponse?.tool_calls;
      if (toolCalls) {
        const toolCall = toolCalls[0];
        // console.log("toolCall", toolCall);
        const tool_call_id = toolCall?.id;
        // console.log("tool_call_id", tool_call_id);
        const argsString = toolCall?.function?.arguments;
        // console.log("argsString", argsString);
        const args = JSON.parse(argsString);
        const query = args?.query;
        console.log("QUERY:", query);
        const papers_results = await getSearchResults(query);
        const papers_results_json = JSON.stringify(papers_results);
        convertedMessages.push(assistantResponse);
        convertedMessages.push({
          role: "tool",
          content: papers_results_json,
          tool_call_id: tool_call_id,
        });
        const requestPayload2 = {
          messages: convertedMessages,
          model: data.model,
          max_completion_tokens: 16384,
          ...reasoning,
          ...(data.webSearchOn
            ? {
                tools: [search_for_academic_papers_tool_grok],
              }
            : {}),
        };
        // console.log("requestPayload2", requestPayload2);
        const apiResponse2 = await xAI.chat.completions.create(requestPayload2);
        // console.log("apiResponse2", apiResponse2);
        usageTokens += apiResponse2?.usage?.total_tokens;
        responseText = apiResponse2?.choices[0]?.message?.content;
      }
    }
    // console.log("usageTokens", usageTokens);
    // console.log("apiResponse", apiResponse?.choices[0]?.message?.content);
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
    const chat = googleAI.chats.create({
      model: data.model,
      history: history,
      ...streamConfig,
    });
    const response = await chat.sendMessage({
      message: newUserMessage,
    });
    // console.log(response);
    const groundingMetadata = response?.candidates[0]?.groundingMetadata;
    // console.log("groundingMetadata", groundingMetadata);
    // console.log(
    // "groundingMetadata?.groundingSupports",
    // groundingMetadata?.groundingSupports
    // );
    responseText = response?.candidates[0]?.content?.parts[0]?.text;
    if (groundingMetadata?.groundingSupports) {
      const groundingChunksRedirected =
        await updateGroundingChunksWithActualLinksAndTitles(
          groundingMetadata?.groundingChunks
        );
      const contentWithCitations = addCitationsToContent(
        responseText,
        groundingChunksRedirected,
        groundingMetadata?.groundingSupports
      );
      // console.log("contentWithCitations", contentWithCitations);
      responseText = contentWithCitations;
    }
    usageTokens = response?.usageMetadata?.totalTokenCount;
    console.log("usageTokens", usageTokens);
  } else {
    console.log(`Model ${data.model} not found in any list.`);
  }
  // deduct usage
  console.log("TOTAL USAGE:", usageTokens);
  fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/api/tokens`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      amount: usageTokens,
      email: data.email,
    }),
  });
  //
  return new Response(
    JSON.stringify({
      model: data.model,
      text: responseText,
      ...(citationsArray ? { citationsArray: citationsArray } : {}),
    })
  );
}
