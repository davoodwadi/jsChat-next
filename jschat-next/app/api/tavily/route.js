import { NextResponse } from "next/server";
// import { tavily } from "@tavily/core";

// const tvly = tavily({ apiKey: "TAVILY_API_KEY" });
const token = process.env.TAVILY_API_KEY;

const baseUrl = "https://api.tavily.com";
const search_endpoint = "/search";

export const runtime = "edge";

export async function POST(req) {
  const { query } = await req.json();
  console.log("query", query);

  const body = {
    query: query,
    // auto_parameters: false,
    topic: "general",
    search_depth: "advanced",
    chunks_per_source: 3,
    // max_results: 1,
    // time_range: null,
    // days: 7,
    // start_date: "2025-02-09",
    // end_date: "2000-01-28",
    // include_answer: true,
    include_raw_content: true,
    include_images: false,
    include_image_descriptions: false,
    include_favicon: false,
    // include_domains: [],
    // exclude_domains: [],
    // country: null,
  };
  try {
    const res = await fetch(baseUrl + search_endpoint, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
    });

    const data = await res.json();
    // console.log("data", data);

    return NextResponse.json(data);
  } catch (error) {
    console.error("Error:", error);
    return NextResponse.json(
      { error: `Something went wrong ${error}` },
      { status: 500 }
    );
  }
}
