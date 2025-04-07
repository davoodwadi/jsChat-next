import OpenAI from "openai";

export const runtime = "edge";

const openai = new OpenAI({
  apiKey: process.env["OPENAI_KEY"], // This is the default and can be omitted
});

function convertToOpenAIFormat(messages) {
  return messages.map((m) => {
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
      }
      return userM;
    } else {
      return m;
    }
  });
}
export async function POST(req) {
  const data = await req.json();
  //   console.log("SERVER data", data);
  const convertedMessages = convertToOpenAIFormat(data.messages);
  console.log("SERVER convertedMessages", convertedMessages);
  console.log("route runtime", process.env.NEXT_RUNTIME);

  //   return new Response(JSON.stringify({ message: "OK" }), {
  //     headers: {
  //       "Content-Type": "application/json",
  //     },
  //   });
  const stream = new ReadableStream({
    async start(controller) {
      try {
        const encoder = new TextEncoder();
        const reasoning = data.model.includes("o3-mini")
          ? { reasoning_effort: "high" }
          : {};

        const stream = await openai.chat.completions.create({
          messages: convertedMessages,
          model: data.model,
          stream: true,
          stream_options: { include_usage: true },
          max_completion_tokens: 16384,
          ...reasoning,
        });

        for await (const chunk of stream) {
          //   console.log("chunk", chunk);
          if (chunk.choices[0]?.delta?.content) {
            console.log(
              "chunk.choices[0]?.delta?.content",
              chunk.choices[0]?.delta?.content
            );

            controller.enqueue(
              encoder.encode(chunk.choices[0]?.delta?.content)
            );
          } else if (chunk?.usage?.total_tokens) {
            console.log(
              "chunk?.usage?.total_tokens",
              chunk?.usage?.total_tokens
            );
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
    // headers: {
    //   "Content-Type": "application/json",
    // },
  });
}
