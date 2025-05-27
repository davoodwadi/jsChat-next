export const addCitationsToContentInline = (
  content,
  groundingChunks,
  groundingSupports
) => {
  let result = content;

  // Sort supports by endIndex in descending order to avoid changing indices
  // when we insert content
  const sortedSupports = [...groundingSupports].sort(
    (a, b) => b.segment.endIndex - a.segment.endIndex
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
    console.log("citationTextBrackets", citationTextBrackets);

    // Insert citations at the end of the segment
    const { text } = segment;
    const { startIndex, endIndex } = findTextPositions(result, text);
    result =
      result.slice(0, endIndex) + citationTextBrackets + result.slice(endIndex);
    // console.log("result", result);
  });
  return result;
};

export const addCitationsToContentInlineSuper = (
  content,
  groundingChunks,
  groundingSupports
) => {
  let result = content;

  // Sort supports by endIndex in descending order to avoid changing indices
  // when we insert content
  const sortedSupports = [...groundingSupports].sort(
    (a, b) => b.segment.endIndex - a.segment.endIndex
  );
  // console.log("sortedSupports", sortedSupports);
  // Process each support
  sortedSupports.forEach((support) => {
    const { segment, groundingChunkIndices } = support;

    // Generate citation markers for this segment
    const citationText = groundingChunkIndices
      .map((chunkIndex) => {
        const chunk = groundingChunks[chunkIndex];
        // return `[${chunk.web.title}](${chunk.web.uri})`;
        return `[${chunk.web.title}](${chunk.web.uri})`;
      })
      .join(", ");
    // console.log("citationText", citationText);

    const citationTextBrackets = `<sup> ${citationText} </sup>`;
    // console.log("citationTextBrackets", citationTextBrackets);

    // Insert citations at the end of the segment
    const { text } = segment;
    const { startIndex, endIndex } = findTextPositions(result, text);
    result =
      result.slice(0, endIndex) + citationTextBrackets + result.slice(endIndex);
    // console.log("result", result);
  });
  return result;
};
export const addCitationsToContent = (
  content,
  groundingChunks,
  groundingSupports
) => {
  let result = content;
  const references = new Map(); // Maps chunk indices to their URLs and titles

  // Sort supports by endIndex in descending order to avoid changing indices
  // when we insert content
  const sortedSupports = [...groundingSupports].sort(
    (a, b) => b.segment.endIndex - a.segment.endIndex
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
      ([chunkIndexA], [chunkIndexB]) => chunkIndexA - chunkIndexB
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
  groundingChunks
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
            title: actualTitle,
          },
        };
      } catch (error) {
        console.warn(`Failed fetching or parsing at ${chunk.web.uri}:`, error);
        // Return original if error happens
        return chunk;
      }
    })
  );

  return updatedChunks;
}
