import { visit } from "unist-util-visit";

export function remarkCustomMath() {
  return (tree) => {
    visit(tree, "text", (node, index, parent) => {
      const value = node.value;

      if (
        !value.includes("%%%BLOCK_MATH%%%") &&
        !value.includes("%%%INLINE_MATH%%%")
      ) {
        return;
      }

      // console.log(
      //   "🎯 Found custom math delimiters in:",
      //   value.substring(0, 100)
      // );

      const newNodes = [];
      let lastIndex = 0;

      const mathRegex =
        /(%%%BLOCK_MATH%%%)([\s\S]*?)(%%%\/BLOCK_MATH%%%)|(%%%INLINE_MATH%%%)(.*?)(%%%\/INLINE_MATH%%%)/g;

      let match;
      while ((match = mathRegex.exec(value)) !== null) {
        // Add text before the math
        if (match.index > lastIndex) {
          newNodes.push({
            type: "text",
            value: value.slice(lastIndex, match.index),
          });
        }

        if (match[1]) {
          // Block math - match remark-math structure exactly
          const mathContent = match[2].trim();
          const codeElement = {
            type: "element",
            tagName: "code",
            properties: { className: ["language-math", "math-display"] },
            children: [{ type: "text", value: mathContent }],
          };

          newNodes.push({
            type: "math",
            meta: null,
            value: mathContent,
            data: {
              hName: "pre",
              hChildren: [codeElement],
            },
          });

          // console.log("🔥 Created block math node:", mathContent);
        } else if (match[4]) {
          // Inline math - match remark-math structure exactly
          const mathContent = match[5].trim();

          newNodes.push({
            type: "inlineMath",
            value: mathContent,
            data: {
              hName: "code",
              hProperties: { className: ["language-math", "math-inline"] },
              hChildren: [{ type: "text", value: mathContent }],
            },
          });

          // console.log("🔥 Created inline math node:", mathContent);
        }

        lastIndex = match.index + match[0].length;
      }

      // Add remaining text
      if (lastIndex < value.length) {
        newNodes.push({
          type: "text",
          value: value.slice(lastIndex),
        });
      }

      if (newNodes.length > 0) {
        // console.log("🚀 Replacing with", newNodes.length, "nodes");
        parent.children.splice(index, 1, ...newNodes);
        return [visit.SKIP, index + newNodes.length];
      }
    });
  };
}
