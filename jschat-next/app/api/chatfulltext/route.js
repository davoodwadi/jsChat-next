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
const searchEndpoint = "papersearch";

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
          }
        : {}),
    };
    // console.log("requestPayload", requestPayload);
    // return new Response(JSON.stringify({}));
    const apiResponse = await anthropic.messages.create(requestPayload);
    // console.log("apiResponse", apiResponse);

    console.log("apiResponse.stop_reason", apiResponse.stop_reason);
    if (apiResponse.stop_reason === "tool_use") {
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
      const apiResponse2 = await anthropic.messages.create(requestPayload);
      //   console.log("apiResponse2", apiResponse2);
      const filteredText = apiResponse2?.content.find((m) => m.type === "text");
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
          ...(data.webSearchOn
            ? {
                tools: [search_for_academic_papers_tool_openai],
              }
            : {}),
        };
        const apiResponse2 = await openai.responses.create(requestPayload2);
        // console.log("apiResponse2", apiResponse2);
        responseText = apiResponse2.output_text;
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

const search_for_academic_papers_tool_openai = {
  type: "function",
  name: "search_for_academic_papers",
  description: `Retrieves an array of academic papers for a given search query using the OpenAlex API. 
  The query must be a search query that would retrieve the most relevant academic papers for the given topic. 
  The tool will return an array of objects containing "doi", "publication_year", "title", "cited_by_count", "authors", and "abstract".
  The "cited_by_count" is the number of citations the paper has received.
  The tool should be used when the user asks you to write academic information. 
  You should use the tool to get the top relevant academic papers to support your argument.
  The tool is not perfect. The search results might be papers that are not relevant for the argument.`,
  parameters: {
    type: "object",
    properties: {
      query: {
        type: "string",
        description:
          "The query to pass to the search engine to find the most relevant academic papers",
      },
    },
    required: ["query"],
  },
};

const search_for_academic_papers_tool = {
  name: "search_for_academic_papers",
  description: `Retrieves an array of academic papers for a given search query using the OpenAlex API. 
The query must be a search query that would retrieve the most relevant academic papers for the given topic. 
The tool will return an array of objects containing "doi", "publication_year", "title", "cited_by_count", "authors", and "abstract".
The "cited_by_count" is the number of citations the paper has received.
The tool should be used when the user asks you to write academic information. 
You should use the tool to get the top relevant academic papers to support your argument.
The tool is not perfect. The search results might be papers that are not relevant for the argument.`,
  input_schema: {
    type: "object",
    properties: {
      query: {
        type: "string",
        description:
          "The query to pass to the search engine to find the most relevant academic papers",
      },
    },
    required: ["query"],
  },
};

async function getSearchResults(query) {
  console.log("query", query);

  const resp = await fetch(
    `${process.env.NEXT_PUBLIC_BASE_URL}/api/${searchEndpoint}`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json", // specify JSON content
      },
      body: JSON.stringify({ query: query }),
    }
  );
  console.log("resp.status", resp.status);

  const results = await resp.json();
  const firstTwo = results.slice(0, 20);
  console.log("length of search", firstTwo.length);
  //   console.log("firstTwo", firstTwo);
  return firstTwo;
}
