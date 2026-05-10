import { remark } from "remark";
import remarkGfm from "remark-gfm";
import remarkHtml from "remark-html";

// Sanitize the output (default schema from hast-util-sanitize). The default
// schema still allows GFM table elements (<table>, <thead>, <tbody>, <tr>,
// <th>, <td>) while stripping unsafe constructs such as <script>, <iframe>,
// inline event handlers, and `javascript:` URLs. Required because the rendered
// `contentHtml` is injected with `dangerouslySetInnerHTML` in the blog page.
export async function markdownToHtml(markdown: string): Promise<string> {
  const file = await remark().use(remarkGfm).use(remarkHtml).process(markdown);
  return String(file).trim();
}
