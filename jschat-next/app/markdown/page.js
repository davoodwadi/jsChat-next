import MarkdownComponent from "@/components/MarkdownComponent";

const markdownSample = `The \`MLPClassifier\` from the \`scikit-learn\` library.
\`<!DOCTYPE html>\`

\`\`\`html
<!DOCTYPE html>
<html>
<head>
<title>Page Title</title>
</head>
<body>

<h1>This is a Heading</h1>
<p>This is a paragraph.</p>

</body>
</html>


\`\`\`

> A block quote with ~strikethrough~ and a URL: https://reactjs.org.

lksdfjlsadkfjsdfksdflgjhfjfadfsdbjghfkdgdflskdsfjslksdfjlsadkfjsdfksdflgjhfjfadfsdbjghfkdgdflskdsfjslksdfjlsadkfjsdfksdflgjhfjfadfsdbjghfkdgdflskdsfjslksdfjlsadkfjsdfksdflgjhfjfadfsdbjghfkdgdflskdsfjslksdfjlsadkfjsdfksdflgjhfjfadfsdbjghfkdgdflskdsfjslksdfjlsadkfjsdfksdflgjhfjfadfsdbjghfkdgdflskdsfjs

\`\`\`html
<!DOCTYPE html>
<html>
<head>
<title>Page Title</title>
</head>
<body>

<h1>This is a Heading</h1>
<p>This is a paragraph.</p>

</body>
</html>


\`\`\`

* Lists
* [ ] todo
* [x] done

A table:

| a | b |
| - | - |

poem by Shakespear
\`\`\`
People talk a location
\`\`\`
`;

const partialHtml = `
cikit-learn\` library.
\`<!DOCTYPE html>\`

\`\`\`html
<!DOCTYPE html>
<html>
<head>
<title>Page Title</title>



`;
// const partialHtml = markdownSample.slice(0, 650);
console.log("partial html", partialHtml);

export default async function MarkdownPage() {
  return (
    <>
      {/* <div dangerouslySetInnerHTML={{ __html: result }} /> */}
      {/* <Markdown remarkPlugins={[remarkGfm]}>{markdownSample}</Markdown> */}

      <div className="break-words max-w-[85vw] mx-auto">
        <MarkdownComponent model="gpt-4o-mini">{partialHtml}</MarkdownComponent>
      </div>
    </>
  );
}
