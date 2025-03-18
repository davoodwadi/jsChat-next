import rehypeKatex from "rehype-katex";
import rehypeStringify from "rehype-stringify";
// import remarkMath from "@/remark-math/packages/remark-math";
import remarkMath from "remark-math";
import remarkParse from "remark-parse";
import remarkRehype from "remark-rehype";
import { unified } from "unified";
// import { codes, types } from "micromark-util-symbol";

export default async function () {
  //   console.log("codes", codes);
  const file = await unified()
    .use(remarkParse)
    .use(remarkMath, { singleDollarTextMath: true })
    .use(remarkRehype)
    // .use(rehypeKatex)
    .use(rehypeStringify)

    .process("OK $\\frac{1}{22}\n\n$$\n4\n$$\n\n");

  console.log(String(file));
  return <div>{String(file)}</div>;
}
