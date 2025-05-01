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

export const runtime = "edge";

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

export async function POST(req) {
  const data = await req.json();
  console.log("data.webSearchOn", data.webSearchOn);
  console.log("model server", data.model);
  //   return;

  let usageTokens;
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
    const apiResponse = await anthropic.messages.create({
      max_tokens: 8192,
      system: system && system?.content,
      messages: convertedMessages,
      model: data.model,
      ...thinking,
    });
    // console.log("apiResponse", apiResponse);

    usageTokens = apiResponse?.usage?.output_tokens;
    const filteredText = apiResponse?.content.find((m) => m.type === "text");
    responseText = filteredText?.text;
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

    console.log("reasoning", reasoning);
    const requestPayload = {
      input: convertedMessages,
      model: data.model,
      max_output_tokens: 16384,
      ...reasoning,
      ...(data.webSearchOn
        ? {
            tools: [{ type: "web_search_preview" }],
            tool_choice: { type: "web_search_preview" },
          }
        : {}),
    };
    // console.log("requestPayload", requestPayload);
    // return new Response(JSON.stringify(requestPayload));
    const apiResponse = await openai.responses.create(requestPayload);
    responseText = apiResponse.output_text;
    usageTokens = apiResponse?.usage?.total_tokens;
    if (data.webSearchOn) {
      usageTokens += 10000;
      const citations = getOpenAICitations(apiResponse);
      //   console.log("citations", citations);
      //   responseText += `\n\nReferences\n\n${citations}`;
      citationsArray = citations.citationsArray;
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
    console.log("convertedMessages", convertedMessages);

    const apiResponse = await xAI.chat.completions.create({
      messages: convertedMessages,
      model: data.model,
      max_completion_tokens: 16384,
      ...reasoning,
    });
    usageTokens = apiResponse?.usage?.total_tokens;
    responseText = apiResponse?.choices[0]?.message?.content;
    // console.log("usageTokens", usageTokens);
    // console.log("apiResponse", apiResponse?.choices[0]?.message?.content);
  } else {
    console.log(`Model ${data.model} not found in any list.`);
  }
  // deduct usage
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

function getOpenAICitations(apiResponse) {
  const citations = [];

  if (!apiResponse || !Array.isArray(apiResponse.output)) return "";

  for (const outputItem of apiResponse.output) {
    // We are interested in items of type 'message' with 'content' array
    if (outputItem.type === "message" && Array.isArray(outputItem.content)) {
      for (const contentItem of outputItem.content) {
        // Look for annotations array in contentItem
        if (Array.isArray(contentItem.annotations)) {
          // Filter only url_citation types and push them to citations list
          contentItem.annotations.forEach((annotation) => {
            if (annotation.type === "url_citation") {
              citations.push(annotation);
            }
          });
        }
      }
    }
  }
  const citationsString = citations
    .map((c) => `${c.title}; ${c.url}`)
    .join("\n");
  return { citationsString, citationsArray: citations };
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
  const convertedFiltered = converted.filter(
    (m) => !(m.role === "system" && m.content === "")
  );
  return { convertedMessages: convertedFiltered, hasImage: hasImage };
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
  const convertedFiltered = converted.filter(
    (m) => !(m.role === "system" && m.content === "")
  );
  return { convertedMessages: convertedFiltered, hasImage: hasImage };
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
