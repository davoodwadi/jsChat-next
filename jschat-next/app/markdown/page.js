import MarkdownComponent from "@/components/MarkdownComponent";
import Markdown from "react-markdown";
import rehypeRaw from "rehype-raw";
import rehypeKatex from "rehype-katex";
import React from "react";

import { test } from "@/lib/testAction";

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
const longMarkdown = `<think>
Sure! Let's break down each part of the code step by step, explaining what each line does.
</think>

### Step 1: Set Up Your Next.js Project

#### Create a New Next.js Project

\`\`\`bash
npx create-next-app my-markdown-app
\`\`\`
- **\`npx\`**: A package runner tool that comes with npm 5.2+.
- **\`create-next-app\`**: A command that sets up a new Next.js application with a default configuration.
- **\`my-markdown-app\`**: The name of the new project directory.

\`\`\`bash
cd my-markdown-app
\`\`\`
- **\`cd\`**: Change directory to the newly created project folder.

#### Install Required Packages

\`\`\`bash
npm install react-markdown remark remark-html
\`\`\`
- **\`npm install\`**: Command to install packages.
- **\`react-markdown\`**: A React component for rendering Markdown.
- **\`remark\`**: A Markdown processor that can be used to parse and transform Markdown.
- **\`remark-html\`**: A plugin for \`remark\` that converts Markdown to HTML.

### Step 2: Create a Markdown File

#### Create a Markdown File

\`\`\`markdown
# Hello World
\`\`\`
- This is a Markdown header. The \`#\` indicates a top-level heading.

\`\`\`markdown
This is a sample Markdown file.
\`\`\`
- A simple paragraph of text.

\`\`\`markdown
- Item 1
- Item 2
- Item 3
\`\`\`
- A list in Markdown format. Each item starts with a \`-\`.

\`\`\`markdown
**Bold Text**
\`\`\`
- This text will be rendered in bold.

### Step 3: Create a Markdown Component

#### Create a Markdown Component

\`\`\`javascript
import React from 'react';
\`\`\`
- Importing React to use JSX and React features.

\`\`\`javascript
import ReactMarkdown from 'react-markdown';
\`\`\`
- Importing the \`ReactMarkdown\` component, which will be used to render Markdown content.

\`\`\`javascript
import remarkGfm from 'remark-gfm';
\`\`\`
- Importing the \`remark-gfm\` plugin to enable GitHub Flavored Markdown features.

\`\`\`javascript
const MarkdownRenderer = ({ content }) => {
\`\`\`
- Defining a functional component named \`MarkdownRenderer\` that takes \`content\` as a prop.

\`\`\`javascript
return (
    <ReactMarkdown 
        children={content} 
        remarkPlugins={[remarkGfm]} 
    />
);
\`\`\`
- The component returns a \`ReactMarkdown\` element.
- **\`children={content}\`**: The Markdown content passed as a prop is rendered inside the \`ReactMarkdown\` component.
- **\`remarkPlugins={[remarkGfm]}\`**: This specifies that the \`remark-gfm\` plugin should be used to process the Markdown.

\`\`\`javascript
export default MarkdownRenderer;
\`\`\`
- Exporting the \`MarkdownRenderer\` component so it can be imported and used in other files.

### Step 4: Fetch and Render Markdown in a Page

#### Fetch Markdown Content

\`\`\`javascript
import fs from 'fs';
import path from 'path';
\`\`\`
- Importing Node.js built-in modules:
  - **\`fs\`**: File system module to read files.
  - **\`path\`**: Module to handle file and directory paths.

\`\`\`javascript
import MarkdownRenderer from '../components/MarkdownRenderer';
\`\`\`
- Importing the \`MarkdownRenderer\` component created earlier.

\`\`\`javascript
const Home = ({ content }) => {
\`\`\`
- Defining a functional component named \`Home\` that takes \`content\` as a prop.

\`\`\`javascript
return (
    <div>
        <h1>Markdown Renderer</h1>
        <MarkdownRenderer content={content} />
    </div>
);
\`\`\`
- The component returns a \`div\` containing:
  - An \`h1\` header with the text "Markdown Renderer".
  - The \`MarkdownRenderer\` component, passing the \`content\` prop to it.

\`\`\`javascript
export async function getStaticProps() {
\`\`\`
- Defining an asynchronous function \`getStaticProps\` that Next.js will call at build time to fetch data.

\`\`\`javascript
const filePath = path.join(process.cwd(), 'content', 'example.md');
\`\`\`
- Using \`path.join\` to create a file path to the \`example.md\` file located in the \`content\` directory. 
- **\`process.cwd()\`**: Returns the current working directory of the Node.js process.

\`\`\`javascript
const content = fs.readFileSync(filePath, 'utf8');
\`\`\`
- Reading the content of the Markdown file synchronously using \`fs.readFileSync\`.
- The second argument \`'utf8'\` specifies the character encoding.

\`\`\`javascript
return {
    props: {
        content,
    },
};
\`\`\`
- Returning an object with a \`props\` key, which contains the \`content\` read from the Markdown file. This will be passed to the \`Home\` component as a prop.

\`\`\`javascript
export default Home;
\`\`\`
- Exporting the \`Home\` component so it can be used as a page in the Next.js application.

### Step 5: Run Your Application

#### Start the Development Server

\`\`\`bash
npm run dev
\`\`\`
- This command starts the Next.js development server, allowing you to view your application in the browser.

#### View Your Application

- Open your browser and navigate to \`http://localhost:3000\` to see the rendered Markdown content.

### Step 6: Customize and Extend

- You can add more features, such as:
  - **Styling**: Create a CSS file to style the Markdown content.
  - **Syntax Highlighting**: Use additional plugins for code highlighting.
  - **Dynamic Routing**: Implement dynamic routes to render different Markdown files based on the URL.

The lift coefficient ($C_L$) is a dimensionless coefficient.

### Conclusion

This step-by-step breakdown explains how to set up a Next.js application that renders Markdown content. Each part of the code is designed to work together to read a Markdown file, convert it to HTML, and display it in a React component. You can further customize and extend this setup based on your needs.
`;
// console.log("partial html", longMarkdown);
const deepSeek = `<think>
Okay, the user asked for a funny joke. Let me think of a good one. They might want something light-hearted and not too complicated.

I should check if they have any preferences, but since they didn't specify, a general joke is safe. Maybe something with a pun or a play on words, those usually work well.

Let me recall some classic jokes. The skeleton one is popular. "Why didn't the skeleton fight? Because he didn't have the guts!" That's a pun on "guts" meaning both courage and internal organs. It's simple and quick.

Wait, did I use that joke before? I need to make sure it's not a repeat. If the user has heard it before, maybe they want a different one. But since I can't check past interactions, I'll go with it. It's a common joke, so even if they've heard it, it's still a good example.

Also, adding an emoji like 😂 can make the response friendlier. Let me make sure the joke is appropriate and not offensive. The skeleton joke is harmless and suitable for all ages. Alright, that should work.
</think>

Sure! Here's a classic:  
Why didn’t the skeleton fight anyone?  
…*Because he didn’t have the guts!* 😂  

Need another? Just ask!`;

const deepSeekPartial = `<think>
Okay, the user asked for a funny joke. Let me think of a good one. They might want something light-hearted and not too complicated.

I should check if they have any preferences, but since they didn't specify, a general joke is safe. Maybe something with a pun or a play on words, those usually work well.

Let me recall some classic jokes. The skeleton one is popular. "Why didn't the skeleton fight? Because he didn't have the guts!" That's a pun on "guts" meaning both courage and internal organs. It's simple and quick.

Wait, did I use that joke before? I need to make sure it's not a repeat. If the user has heard it before, maybe they want a different one. But since I can't check past interactions, I'll go with it. It's a common joke, so even if they've heard it, it's still a good example.`;

const math = `
### Mathematical Formula for Gradient Descent

Gradient descent is an optimization algorithm used to minimize a function \( f(\mathbf{x}) \). The basic idea is to iteratively update the parameters in the direction of the steepest descent, which is given by the negative of the gradient.

The update rule for gradient descent can be expressed mathematically as:

\[
\mathbf{x}_{k+1} = \mathbf{x}_k - \eta \nabla f(\mathbf{x}_k)
\]

Where:
- \( \mathbf{x}_{k} \) is the current point in the parameter space.
- \( \mathbf{x}_{k+1} \) is the next point after the update.
- \( \eta \) is the learning rate, a positive scalar that determines the step size.
- \( \nabla f(\mathbf{x}_k) \) is the gradient of the function \( f \) at the point \( \mathbf{x}_k \).

### Proof of Convergence of Gradient Descent (Under Certain Conditions)

Let's prove that under certain conditions, gradient descent converges to a local minimum of a convex function.

**Assumptions:**
1. The function \( f \) is convex.
2. The gradient \( \nabla f(\mathbf{x}) \) is Lipschitz continuous with constant \( L > 0\):
   \[
   \|\nabla f(\mathbf{x}) - \nabla f(\mathbf{y})\| \leq L \|\mathbf{x} - \mathbf{y}\| \quad \forall \mathbf{x}, \mathbf{y}
   \]

**Proof Steps:**

1. **Gradient Descent Update:**
   Starting with the update rule:
   \[
   \mathbf{x}_{k+1} = \mathbf{x}_k - \eta \nabla f(\mathbf{x}_k)
   \]

2. **Using the Taylor Expansion:**
   We can approximate \( f(\mathbf{x}_{k+1}) \) using the Taylor expansion about \( \mathbf{x}_k \):
   \[
   f(\mathbf{x}_{k+1}) = f(\mathbf{x}_k - \eta \nabla f(\mathbf{x}_k)) \approx f(\mathbf{x}_k) + \nabla f(\mathbf{x}_k)^T(-\eta \nabla f(\mathbf{x}_k)) + \frac{L}{2} \|-\eta \nabla f(\mathbf{x}_k)\|^2
   \]
   Simplifying this yields:
   \[
   f(\mathbf{x}_{k+1}) \leq f(\mathbf{x}_k) - \eta \|\nabla f(\mathbf{x}_k)\|^2 + \frac{L \eta^2}{2} \|\nabla f(\mathbf{x}_k)\|^2
   \]

3. **Rearranging the Inequality:**
   Therefore, we have:
   \[
   f(\mathbf{x}_{k+1}) \leq f(\mathbf{x}_k) - \left( \eta - \frac{L \eta^2}{2} \right) \|\nabla f(\mathbf{x}_k)\|^2
   \]

4. **Choosing a Suitable \( \eta \):**
   If we choose \( \eta \) such that:
   \[
   0 < \eta < \frac{2}{L}
   \]
   then \( \eta - \frac{L \eta^2}{2} > 0 \) and it follows that:
   \[
   f(\mathbf{x}_{k+1}) < f(\mathbf{x}_k)
   \]
   indicating that the function value is decreasing.

5. **Convergence Argument:**
   As \\( k \\) goes to infinity, the updates cause \\( \\mathbf{x}_k \\) to approach a point where the gradient \\( \\nabla f(\\mathbf{x}) \\) approaches zero. Given \\( f \\) is convex and the updates always provide a non-increasing sequence of function values, the algorithm converges to a local minimum.

### Conclusion
It is $200 that you need to pay.

$E=\\alpha$

$$
L = \\frac{1}{2} \\rho v^2 S C_L
$$

The lift coefficient ($C_L$) is a dimensionless coefficient.

Gradient descent is guaranteed to converge to a local minimum for a convex function under the assumptions of Lipschitz continuity of the gradient and a suitably chosen learning rate. This demonstration outlines the theoretical foundation of gradient descent. In practice, additional considerations such as learning rate schedules and second-order methods might be necessary to ensure convergence in complex scenarios.
`;
export default async function MarkdownPage() {
  console.log("Markdown Page");
  console.log("page runtime", process.env.NEXT_RUNTIME);

  await test();
  return (
    <>
      {/* <div dangerouslySetInnerHTML={{ __html: result }} /> */}
      {/* <Markdown remarkPlugins={[remarkGfm]}>{markdownSample}</Markdown> */}

      <div className="break-words max-w-[85vw] mx-auto">
        <MarkdownComponent model="gpt-4o-mini">{math}</MarkdownComponent>
      </div>
    </>
  );
  // return (
  //   <Markdown
  //     rehypePlugins={[rehypeKatex, rehypeRaw]}
  //     children={longMarkdown}
  //     components={{
  //       think: CustomThink, // Handle <think> tags separately
  //     }}
  //   />
  // );
}
