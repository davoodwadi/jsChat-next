import MarkdownComponent from "../components/MarkdownComponent"

import remarkHtml from "remark-html"
import remarkParse from "remark-parse"
// import { read } from "to-vfile"
import { unified } from "unified"
import remarkGfm from "remark-gfm"

// import { getSampleDb } from "@/lib/db"
// import { connectToDatabase } from "@/lib/db"
// import { useState, useEffect } from "react"

const markdownSample = `The \`MLPClassifier\` from the \`scikit-learn\` library.

\`\`\`python
import numpy as np

def train_mlp(hidden_layer_sizes=(100,), activation='relu', solver='adam', alpha=0.0001, batch_size='auto', learning_rate='constant', learning_rate_init=0.001, max_iter=200):
    # Generate a synthetic dataset for classification
    X, y = make_classification(n_samples=1000, n_features=20, n_informative=10, n_redundant=10, random_state=42)
    
    return mlp

# Example usage
trained_mlp = train_mlp()
\`\`\`

### Explanation:
1. **Data Generation**: Uses \`make_classification\` to create a synthetic dataset.
2. **Data Splitting**: Splits the data into training and testing sets.

You can customize the parameters of the \`MLPClassifier\`. OK?

A paragraph with *emphasis* and **strong importance**.

\`\`\`html
<body>
    <p id="output"></p>
    <script type='module' src="testAPI.js"></script>
</body>
\`\`\`

> A block quote with ~strikethrough~ and a URL: https://reactjs.org.

lksdfjlsadkfjsdfksdflgjhfjfadfsdbjghfkdgdflskdsfjslksdfjlsadkfjsdfksdflgjhfjfadfsdbjghfkdgdflskdsfjslksdfjlsadkfjsdfksdflgjhfjfadfsdbjghfkdgdflskdsfjslksdfjlsadkfjsdfksdflgjhfjfadfsdbjghfkdgdflskdsfjslksdfjlsadkfjsdfksdflgjhfjfadfsdbjghfkdgdflskdsfjslksdfjlsadkfjsdfksdflgjhfjfadfsdbjghfkdgdflskdsfjs

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
`

export default async function MarkdownPage() {
  const email = "davoodwadi@gmail.com"
  const response = await fetch("http://localhost:3000/api/users", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ email: email }),
  })
  console.log("response status", response.status)
  const userJson = await response.json()
  const user = userJson.user

  console.log("user", user)
  console.log("Object.entries(user)", Object.entries(user))

  return (
    <>
      {/* <div dangerouslySetInnerHTML={{ __html: result }} /> */}
      {/* <Markdown remarkPlugins={[remarkGfm]}>{markdownSample}</Markdown> */}
      <ol className="grid grid-cols-2 mx-auto">
        {Object.entries(user).map(([key, value]) => (
          <li key={key}>
            {key}: {value}
          </li>
        ))}
      </ol>
      <div className="break-words max-w-[85vw] mx-auto">
        <MarkdownComponent model="gpt-4o-mini">
          {markdownSample}
        </MarkdownComponent>
      </div>
    </>
  )
}
