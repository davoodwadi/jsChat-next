import { visit } from "unist-util-visit";

export function remarkLLMLatexMath() {
  return (tree) => {
    // Visit both inline code (backticks) and code blocks (fences)
    visit(tree, ["inlineCode", "code"], (node, index, parent) => {
      if (!parent || index === null) return;

      const value = node.value;
      let match;

      // Handle Inline Math: check for tokens inside `inlineCode` nodes
      if (node.type === "inlineCode") {
        const regex = /⟪INLINEMATH⟪(.*?)⟫INLINEMATH⟫/;
        match = value.match(regex);

        if (match) {
          const mathContent = match[1];
          const newMathNode = {
            type: "inlineMath",
            value: mathContent,
            data: {
              hName: "code",
              hProperties: { className: ["language-math", "math-inline"] },
              hChildren: [{ type: "text", value: mathContent }],
            },
          };
          // Replace the inlineCode node with our new inlineMath node
          parent.children[index] = newMathNode;
        }
      }

      // Handle Block Math: check for tokens inside `code` nodes
      if (node.type === "code" && node.lang === "math-token") {
        const regex = /⟪DISPLAYMATH⟪([\s\S]*?)⟫DISPLAYMATH⟫/;
        match = value.match(regex);

        if (match) {
          const mathContent = match[1];
          const codeElement = {
            type: "element",
            tagName: "code",
            properties: { className: ["language-math", "math-display"] },
            children: [{ type: "text", value: mathContent }],
          };
          const newMathNode = {
            type: "math",
            meta: null,
            value: mathContent,
            data: {
              hName: "pre",
              hChildren: [codeElement],
            },
          };
          // Replace the code node with our new math node
          parent.children[index] = newMathNode;
        }
      }
    });
  };
}
