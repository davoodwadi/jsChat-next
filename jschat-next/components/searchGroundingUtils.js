export function addCitationsToContentInlineOpenAI(content, annotations) {
  // 1. Filter for only the 'url_citation' annotations, as other types might exist.
  // console.log("content", content);
  // console.log("addCitationsToContentInlineOpenAI", annotations);
  const citationAnnotations = annotations.filter(
    (ann) => ann.annotation && ann.annotation.type === "url_citation",
  );
  // console.log("citationAnnotations", citationAnnotations);

  // 2. Sort annotations by their start index. This is CRUCIAL to process the
  //    string in the correct order from beginning to end.
  citationAnnotations.sort(
    (a, b) => a.annotation.start_index - b.annotation.start_index,
  );

  let resultParts = [];
  let lastIndex = 0;
  let citationNumber = 1;

  // 3. Loop through the sorted annotations to build the new string.
  citationAnnotations.forEach((ann) => {
    const { start_index, end_index, url, title } = ann.annotation;

    // Add the chunk of text *before* this annotation's cited text
    resultParts.push(content.slice(lastIndex, start_index));

    // Add the original text that is being cited
    const citedText = content.slice(start_index, end_index);
    resultParts.push(citedText);

    // Escape the URL and title to prevent HTML injection or malformed attributes
    const escapedUrl = escapeHtmlAttr(url);
    const escapedTitle = escapeHtmlAttr(title);

    // Create the citation link HTML
    const citationLink = `<sup><a href="${escapedUrl}" target="_blank" rel="noopener noreferrer" title="${escapedTitle}" class="citation-link">${citationNumber}</a></sup>`;

    // Add the citation link
    resultParts.push(citationLink);

    // Update our position in the original string
    lastIndex = end_index;

    // Increment the citation number for the next one
    citationNumber++;
  });

  // 4. After the loop, add any remaining text from the end of the original string.
  resultParts.push(content.slice(lastIndex));

  // 5. Join all the parts together into a single string and return.
  return resultParts.join("");
}

export function addCitationsToContentInlineSuperPerplexity(
  content,
  search_results,
) {
  // console.log("=== Starting citation processing ===");
  // console.log("Original content:", content);
  // console.log("Raw search_results:", search_results);

  // Step 1: Basic validation
  if (!content || !search_results) {
    console.log(
      "Missing content or search_results, returning original content",
    );
    return content;
  }

  // Step 2: Parse the JSON string
  let searchArray;
  try {
    searchArray = JSON.parse(search_results);
    // console.log("Parsed searchArray:", searchArray);
  } catch (error) {
    console.warn("Error parsing search results", error);
    return content;
  }

  // Step 3: Validate parsed array
  if (!searchArray || searchArray.length === 0) {
    console.log("Empty or invalid searchArray, returning original content");
    return content;
  }

  // Step 4: Create and test the regex
  const citationRegex = /\[(\d+)\]/g;

  // Step 6: Process replacements with debugging
  const result = content.replace(citationRegex, (match, citationNumber) => {
    // console.log("Processing match:", match, "Citation number:", citationNumber);

    const index = parseInt(citationNumber, 10) - 1;
    // console.log("Array index:", index, "Array length:", searchArray.length);

    if (index >= 0 && index < searchArray.length) {
      const result = searchArray[index];
      // console.log("Found search result.snippet:", result.snippet);

      const escapedTitle = escapeHtmlAttr(result.title || "");
      const escapedSnippet = escapeHtmlAttr(result.snippet || "");
      const escapedUrl = escapeHtmlAttr(result.url || "");
      const replacement =
        '<sup><a href="' +
        escapedUrl +
        '" target="_blank" rel="noopener noreferrer" ' +
        'title="' +
        escapedTitle +
        '" ' +
        'class="citation-link" ' +
        'data-snippet="' +
        escapedSnippet +
        '"' +
        ">" +
        citationNumber +
        "</a></sup>";

      // console.log("Replacement HTML:", replacement);
      return replacement;
    }

    console.log("No matching search result, keeping original:", match);
    return match;
  });

  // console.log("Final result:", result);
  // console.log("=== Citation processing complete ===");

  return result;
}

function escapeHtmlAttr(str) {
  return String(str || "")
    .replace(/&/g, "&amp;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#x27;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/\r?\n|\r/g, " "); // flatten newlines
}

export const addCitationsToContentInline = (
  content,
  groundingChunks,
  groundingSupports,
) => {
  let result = content;

  // Sort supports by endIndex in descending order to avoid changing indices
  // when we insert content
  const sortedSupports = [...groundingSupports].sort(
    (a, b) => b.segment.endIndex - a.segment.endIndex,
  );
  // Process each support
  sortedSupports.forEach((support) => {
    const { segment, groundingChunkIndices } = support;

    // Generate citation markers for this segment
    const citationText = groundingChunkIndices
      .map((chunkIndex) => {
        const chunk = groundingChunks[chunkIndex];
        return `[${chunk.web.title}](${chunk.web.uri})`;
      })
      .join(", ");

    const citationTextBrackets = `[ ${citationText} ]`;
    // console.log("citationTextBrackets", citationTextBrackets);

    // Insert citations at the end of the segment
    const { text } = segment;
    const { startIndex, endIndex } = findTextPositions(result, text);
    result =
      result.slice(0, endIndex) + citationTextBrackets + result.slice(endIndex);
  });
  return result;
};
export const addCitationsToContentInlineSuper = (
  content,
  groundingChunks,
  groundingSupports,
) => {
  let result = content;

  // Sort supports by endIndex in descending order to avoid changing indices
  // when we insert content
  const sortedSupports = [...groundingSupports].sort(
    (a, b) => b.segment.endIndex - a.segment.endIndex,
  );
  // console.log("sortedSupports", sortedSupports);
  // Process each support
  sortedSupports.forEach((support) => {
    const { segment, groundingChunkIndices } = support;

    // Generate citation markers for this segment
    const citationLinks = groundingChunkIndices
      .map((chunkIndex) => {
        const citationNumber = chunkIndex + 1;
        const chunk = groundingChunks[chunkIndex];
        // Safely access data and provide fallbacks
        const url = chunk?.web?.uri || "";
        const title = chunk?.web?.title || "";
        const snippet = chunk?.snippet || "";
        // Escape attributes to ensure the HTML is valid
        const escapedUrl = escapeHtmlAttr(url);
        const escapedTitle = escapeHtmlAttr(title);
        const escapedSnippet = escapeHtmlAttr(snippet);
        // Build the final HTML <a> tag string using a template literal for readability
        // const linkHtml = `<a href="${escapedUrl}" target="_blank" rel="noopener noreferrer" title="${escapedTitle}" class="citation-link" data-snippet="${escapedSnippet}">${citationNumber}</a>`;
        const linkMarkdown = `[${title}](${url})`;
        return linkMarkdown;
      })
      .join(" ");

    if (!citationLinks) {
      return;
    }

    // const citationHtml = `<sup> ${citationLinks} </sup>`;
    const citationHtml = ` ${citationLinks} `;

    // // Insert citations at the end of the segment
    const { text } = segment;
    const { startIndex, endIndex } = findTextPositions(result, text);
    result = result.slice(0, endIndex) + citationHtml + result.slice(endIndex);
  });
  return result;
};
export const _addCitationsToContentInlineSuper = (
  content,
  groundingChunks,
  groundingSupports,
) => {
  let result = content;

  // Sort supports by endIndex in descending order to avoid changing indices
  // when we insert content
  const sortedSupports = [...groundingSupports].sort(
    (a, b) => b.segment.endIndex - a.segment.endIndex,
  );
  // console.log("sortedSupports", sortedSupports);
  // Process each support
  sortedSupports.forEach((support) => {
    const { segment, groundingChunkIndices } = support;

    // Generate citation markers for this segment
    const citationText = groundingChunkIndices
      .map((i, chunkIndex) => {
        // console.log("i", i);
        const chunk = groundingChunks[chunkIndex];
        const escapedTitle = escapeHtmlAttr(chunk.web.title || "");
        const escapedUrl = escapeHtmlAttr(chunk.web.uri || "");
        return `[${escapedTitle}](${escapedUrl})`;
      })
      .join(", ");
    const citationTextBrackets = `<sup> ${citationText} </sup>`;

    // // Insert citations at the end of the segment
    const { text } = segment;
    const { startIndex, endIndex } = findTextPositions(result, text);
    result =
      result.slice(0, endIndex) + citationTextBrackets + result.slice(endIndex);
  });
  return result;
};
export const addCitationsToContent = (
  content,
  groundingChunks,
  groundingSupports,
) => {
  let result = content;
  const references = new Map(); // Maps chunk indices to their URLs and titles

  // Sort supports by endIndex in descending order to avoid changing indices
  // when we insert content
  const sortedSupports = [...groundingSupports].sort(
    (a, b) => b.segment.endIndex - a.segment.endIndex,
  );
  // console.log("sortedSupports", sortedSupports);
  // Process each support
  sortedSupports.forEach((support) => {
    const { segment, groundingChunkIndices } = support;

    // Generate citation markers for this segment
    const citationText = groundingChunkIndices
      .map((chunkIndex) => {
        const chunk = groundingChunks[chunkIndex];

        // Add to references if not already added
        if (!references.has(chunkIndex)) {
          references.set(chunkIndex, {
            url: chunk.web.uri,
            title: chunk.web.title,
          });
        }
        return `[^${chunkIndex + 1}]`;
      })
      .join("");

    // const citationTextBrackets = ` [${citationText}]`;
    const citationTextBrackets = `${citationText}`;
    // console.log("citationTextBrackets", citationTextBrackets);

    // Insert citations at the end of the segment
    const { text } = segment;
    const { startIndex, endIndex } = findTextPositions(result, text);
    // console.log("result", result);
    // console.log(startIndex, endIndex);
    // console.log(segment?.startIndex, segment?.endIndex);
    // console.log(result.slice(startIndex, endIndex));
    result =
      result.slice(0, endIndex) + citationTextBrackets + result.slice(endIndex);
    // console.log("result", result);
  });

  // Add references section at the end
  if (references.size > 0) {
    // console.log("references", references);
    result += "\n\n## References\n\n";
    const sortedReferences = Array.from(references.entries()).sort(
      ([chunkIndexA], [chunkIndexB]) => chunkIndexA - chunkIndexB,
    );
    // Add each reference using Markdown reference-style links
    for (let [chunkIndex, ref] of sortedReferences) {
      // console.log("chunkIndex, ref", chunkIndex, ref);
      // console.log(`[^${chunkIndex + 1}]: ${ref.url} "${ref.title}"\n`);
      // result += `[^${chunkIndex + 1}]: "${ref.title}" ${ref.url}\n`;
      result += `[^${chunkIndex + 1}]: [${ref.title}](${ref.url})\n\n`;
    }
  }
  return result;
};
function findTextPositions(bigText, searchText) {
  const startIndex = bigText.indexOf(searchText);
  if (startIndex === -1) {
    return null; // text not found
  }
  const endIndex = startIndex + searchText.length;
  return { startIndex, endIndex };
}
export async function updateGroundingChunksWithActualLinksAndTitles(
  groundingChunks,
) {
  // Helper to extract <title> from HTML string
  function extractTitle(html) {
    const match = html.match(/<title>(.*?)<\/title>/i);
    return match ? match[1] : "Untitled";
  }

  // Process each chunk sequentially or in parallel — here parallel with Promise.all
  const updatedChunks = await Promise.all(
    groundingChunks.map(async (chunk) => {
      try {
        // Step 1: Follow redirect to get the final url
        const redirectResponse = await fetch(chunk.web.uri, {
          method: "HEAD",
          redirect: "follow",
        });
        const actualUrl = redirectResponse.url;

        // Step 2: Fetch actual page and extract title
        const pageResponse = await fetch(actualUrl);
        const pageText = await pageResponse.text();
        const actualTitle = extractTitle(pageText);

        // Update the same keys in groundingChunk
        return {
          web: {
            uri: actualUrl,
            // title: actualTitle,
            title: chunk.web.title,
          },
        };
      } catch (error) {
        console.warn(`Failed fetching or parsing at ${chunk.web.uri}:`, error);
        // Return original if error happens
        return chunk;
      }
    }),
  );

  return updatedChunks;
}
