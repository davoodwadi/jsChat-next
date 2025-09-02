import { NextResponse } from "next/server";

const SEMANTIC_SCHOLAR_API =
  "https://api.semanticscholar.org/graph/v1/paper/search";

export async function POST(req) {
  try {
    const body = await req.json();
    const { query } = body;

    if (!query) {
      return NextResponse.json(
        { error: "Missing 'query' parameter" },
        { status: 400 }
      );
    }

    const apiKey = process.env.SEMANTIC_SCHOLAR_API_KEY;
    const headers = {};
    if (apiKey) {
      headers["x-api-key"] = apiKey;
    }

    const pagesToFetch = 1;
    const limit = 100;
    const fieldsStr = "title,abstract,year,citationCount,journal,authors,tldr";

    let allResults = [];

    // Loop over multiple pages just like Python version
    for (let p = 0; p < pagesToFetch; p++) {
      const url = new URL(SEMANTIC_SCHOLAR_API);
      url.searchParams.set("query", query);
      url.searchParams.set("fields", fieldsStr);
      url.searchParams.set("limit", limit.toString());
      url.searchParams.set("offset", (p * limit).toString());
      console.log("headers", headers);
      console.log("url.toString()", url.toString());
      const res = await fetch(url.toString(), { headers });

      if (!res.ok) {
        console.error("Semantic Scholar API failed", await res.text());
        continue;
      }

      const data = await res.json();
      if (data?.data) {
        allResults.push(...data.data);
      }

      // Delay to respect Semantic Scholar API limits
      await new Promise((resolve) => setTimeout(resolve, 1100));
    }

    // Clean up results into the shape you want
    const allResultsClean = allResults.map((r) => ({
      title: r.title || null,
      abstract: r.abstract || null,
      year: r.year || null,
      citationCount: r.citationCount || null,
      journal: r.journal || null,
      authors: getAuthorsNameSS(r.authors) || null,
      tldr: getTldrText(r.tldr) || null,
    }));

    // TODO: Ranking logic would go here if you add embeddings (like in Python).
    // For now, return unsorted results.
    return NextResponse.json({ results: allResultsClean });
  } catch (err) {
    console.error(err);
    return NextResponse.json(
      { error: "Internal Server Error", details: err.message },
      { status: 500 }
    );
  }
}

// Utilities
function getAuthorsNameSS(authorsList) {
  try {
    return authorsList.map((a) => a?.name);
  } catch (err) {
    return "";
  }
}

function getTldrText(tldr) {
  if (tldr) {
    return tldr.text;
  }
  return null;
}
