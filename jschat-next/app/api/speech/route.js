import { NextResponse } from "next/server";

export async function GET(req) {
  const apiKey = process.env.OPENAI_KEY;
  try {
    const response = await fetch(
      "https://api.openai.com/v1/realtime/sessions",
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${apiKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: "gpt-4o-mini-realtime-preview",
          voice: "alloy",
          instructions: "Your name is jack.",
          modalities: ["text", "audio"],
        }),
      }
    );

    const data = await response.json();
    console.log("SERVER data", data);

    return new NextResponse(JSON.stringify(data), {
      headers: {
        "Content-Type": "application/json",
      },
    });
  } catch (error) {
    console.error("Token generation error:", error);
    return new NextResponse(
      { error: "Token generation error" },
      {
        headers: {
          "Content-Type": "application/json",
        },
      }
    );
  }
}
