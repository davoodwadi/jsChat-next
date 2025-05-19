export function getOpenAICitations(apiResponse) {
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

export function convertToGoogleFormat(messages) {
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
export function convertToOpenAIResponsesFormat(messages) {
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

export function convertToOpenAIFormat(messages) {
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

export function convertToDeepInfraFormat(messages) {
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

export function convertToAnthropicFormat(messages) {
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

export function formatBase64ImageAnthropic(base64String) {
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

export const search_for_academic_papers_tool_openai = {
  type: "function",
  name: "search_for_academic_papers",
  description: `Retrieves an array of academic papers for a given search query using the OpenAlex API. 
The query must be a search query that would retrieve the most relevant academic papers for the given topic. 
The tool will return an array of objects containing "doi", "publication_year", "title", "cited_by_count", "authors", and "abstract".
The "cited_by_count" is the number of citations the paper has received.
The tool should be used when the user asks you to write academic information. 
You should use the tool to get the top relevant academic papers to support your argument.
The tool is not perfect. The search results might be papers that are not relevant for the argument.
If the academic papers returned by the tool do not support your query, you MUST output "The search results were not relevant."`,
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

export const search_for_academic_papers_tool = {
  name: "search_for_academic_papers",
  description: `Retrieves an array of academic papers for a given search query using the OpenAlex API. 
The query must be a search query that would retrieve the most relevant academic papers for the given topic. 
The tool will return an array of objects containing "doi", "publication_year", "title", "cited_by_count", "authors", and "abstract".
The "cited_by_count" is the number of citations the paper has received.
The tool should be used when the user asks you to write academic information. 
You should use the tool to get the top relevant academic papers to support your argument.
The tool is not perfect. The search results might be papers that are not relevant for the argument.
If the academic papers returned by the tool do not support your query, you MUST output "The search results were not relevant."`,
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
export const search_for_academic_papers_tool_grok = {
  type: "function",
  function: {
    name: "search_for_academic_papers",
    description: `Retrieves an array of academic papers for a given search query using the OpenAlex API. 
The query must be a search query that would retrieve the most relevant academic papers for the given topic. 
The tool will return an array of objects containing "doi", "publication_year", "title", "cited_by_count", "authors", and "abstract".
The "cited_by_count" is the number of citations the paper has received.
The tool should be used when the user asks you to write academic information. 
You should use the tool to get the top relevant academic papers to support your argument.
The tool is not perfect. The search results might be papers that are not relevant for the argument.
If the academic papers returned by the tool do not support your query, you MUST output "The search results were not relevant."`,
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
  },
};

export async function getSearchResults(query) {
  // console.log("query", query);
  if (process.env.NEXT_PUBLIC_BASE_URL === "http://localhost:3000") {
    console.log("using the local flask server");
    const resp = await fetch(`http://127.0.0.1:5000`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json", // specify JSON content
      },
      body: JSON.stringify({ query: query }),
    });
    // console.log("resp.status", resp.status);

    const results = await resp.json();
    const firstTwo = results.slice(0, 20);
    console.log("length of search", firstTwo.length);
    // console.log("firstTwo", firstTwo);
    firstTwo.map((item) => {
      console.log("paper:", item.title);
    });
    return firstTwo;
  }
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
  // console.log("firstTwo", firstTwo);
  firstTwo.map((item) => {
    console.log("paper:", item.title);
  });
  return firstTwo;
}
