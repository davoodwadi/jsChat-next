"use server";
import Anthropic from "@anthropic-ai/sdk";

export async function fetchAnthropicModels() {
  try {
    const client = new Anthropic({
      apiKey: process.env.ANTHROPIC_API_KEY,
    });
    const response = await client.models.list();
    return { success: true, data: response.data };
  } catch (error) {
    console.error("Error fetching Anthropic models:", error);
    return { success: false, error: error.message };
  }
}

export async function fetchGeminiModels() {
  try {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) throw new Error("GEMINI_API_KEY is missing");

    const url = `https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey}`;
    const res = await fetch(url);
    if (!res.ok) {
      throw new Error(`Google API responded with status: ${res.status}`);
    }

    const json = await res.json();

    // Transform shape to match the UI expectations (id and display_name)
    const normalizedData = (json.models || []).map((model) => {
      return {
        ...model,
        id: model.name.replace("models/", ""),
        display_name: model.displayName || model.name.replace("models/", ""),
        created_at: null, // Gemini doesn't currently return created_at in the root list
        type: "model",
      };
    });

    return { success: true, data: normalizedData };
  } catch (error) {
    console.error("Error fetching Gemini models:", error);
    return { success: false, error: error.message };
  }
}
export async function fetchOpenAIModels() {
  try {
    const apiKey = process.env.OPENAI_API_KEY || process.env.OPENAI_KEY;
    if (!apiKey) throw new Error("OPENAI_API_KEY or OPENAI_KEY is missing");

    const url = "https://api.openai.com/v1/models";
    const res = await fetch(url, {
      headers: {
        Authorization: `Bearer ${apiKey}`,
      },
    });

    if (!res.ok) {
      throw new Error(`OpenAI API responded with status: ${res.status}`);
    }

    const json = await res.json();

    // Filter for text/chat models and transform to match UI expectations
    const normalizedData = (json.data || [])
      .filter(
        (model) =>
          model.id.includes("gpt") ||
          model.id.startsWith("o1") ||
          model.id.startsWith("o3"),
      )
      .map((model) => {
        return {
          ...model,
          display_name: model.id,
          // Convert UNIX timestamp to standard ISO or millisecond format expectations
          created_at: model.created
            ? new Date(model.created * 1000).toISOString()
            : null,
          type: "model",
        };
      })
      // Sort alphabetically for easier scanning
      .sort((a, b) => a.id.localeCompare(b.id));

    return { success: true, data: normalizedData };
  } catch (error) {
    console.error("Error fetching OpenAI models:", error);
    return { success: false, error: error.message };
  }
}
