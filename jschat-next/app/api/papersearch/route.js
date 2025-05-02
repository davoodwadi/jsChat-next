export async function POST(req) {
  const requestData = await req.json();
  const query = requestData.query;
  console.log("papersearch query:", query);
  const baseUrl = "https://api.openalex.org/works";
  const params = new URLSearchParams({
    search: query,
    //   filter: 'has_abstract:true',
    select:
      "doi,title,display_name,authorships,publication_year,cited_by_count,abstract_inverted_index",
  });

  const url = `${baseUrl}?${params.toString()}`;
  try {
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`API request failed with status ${response.status}`);
    }
    const data = await response.json();
    const results = data?.results;
    if (!results) {
      JSON.stringify({ status: "ERROR in fetching openalex.org" });
    }
    // console.log("results", results);
    const modifiedResults = results.map((item) => {
      const { abstract_inverted_index, authorships, ...rest } = item;
      const authorsArray = authorships.map((author) => author?.raw_author_name);
      const transformedAbstract = abstract_inverted_index
        ? invertedToAbstract(abstract_inverted_index)
        : null;
      return {
        doi: item.doi,
        publication_year: item.publication_year,
        title: item.title,
        cited_by_count: item.cited_by_count,
        authors: authorsArray,
        abstract: transformedAbstract,
      };
    });
    return new Response(JSON.stringify(modifiedResults));
  } catch (error) {
    console.error("Failed to fetch works:", error);
    return new Response(
      JSON.stringify({ status: "ERROR in fetching openalex.org" })
    );
  }
}

function invertedToAbstract(abstract_inverted_index) {
  const tuples = [];
  for (const [word, index] of Object.entries(abstract_inverted_index)) {
    for (const i of index) {
      tuples.push([word, i]);
    }
  }
  const sorted_tuples = tuples.sort((a, b) => a[1] - b[1]);
  const final = sorted_tuples.map((item) => item[0]).join(" ");
  // console.log(final);
  return final;
}

// https://api.openalex.org/works?search=human hybrid AI marketing&filter=has_abstract:true&select=doi,title,display_name,publication_year,cited_by_count
// https://api.openalex.org/works?search=QUERY&filter=has_abstract:true&select=doi,title,display_name,publication_year,cited_by_count

// get cited by:
// https://api.openalex.org/works?filter=cites:W4401448427
