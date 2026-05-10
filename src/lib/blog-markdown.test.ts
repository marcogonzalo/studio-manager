import { describe, expect, it } from "vitest";
import { markdownToHtml } from "@/lib/blog-markdown";

describe("markdownToHtml — base behavior", () => {
  it("renders a basic paragraph with inline emphasis", async () => {
    const html = await markdownToHtml("Hello **world**.");
    expect(html).toBe("<p>Hello <strong>world</strong>.</p>");
  });

  it("trims trailing whitespace/newlines", async () => {
    const html = await markdownToHtml("# Title\n\n");
    expect(html).toBe("<h1>Title</h1>");
  });
});

describe("markdownToHtml — GFM features", () => {
  it("renders a simple GFM table as <table> with thead/tbody/tr/th/td", async () => {
    const markdown = [
      "| Header A | Header B |",
      "| -------- | -------- |",
      "| Cell 1   | Cell 2   |",
      "| Cell 3   | Cell 4   |",
    ].join("\n");

    const html = await markdownToHtml(markdown);

    expect(html).toContain("<table>");
    expect(html).toContain("</table>");
    expect(html).toContain("<thead>");
    expect(html).toContain("<tbody>");
    expect(html).toContain("<th>Header A</th>");
    expect(html).toContain("<th>Header B</th>");
    expect(html).toContain("<td>Cell 1</td>");
    expect(html).toContain("<td>Cell 4</td>");

    // Sanity: counts match a 2-column, 2-data-row table.
    expect((html.match(/<tr>/g) ?? []).length).toBe(3);
    expect((html.match(/<th>/g) ?? []).length).toBe(2);
    expect((html.match(/<td>/g) ?? []).length).toBe(4);
  });

  it("renders GFM strikethrough using <del>", async () => {
    const html = await markdownToHtml("This is ~~outdated~~ text.");
    expect(html).toContain("<del>outdated</del>");
  });

  it("renders GFM autolink literals as anchor tags", async () => {
    const html = await markdownToHtml("Visit https://example.com for info.");
    expect(html).toContain('href="https://example.com"');
    expect(html).toContain(">https://example.com</a>");
  });
});

describe("markdownToHtml — sanitization", () => {
  it("removes raw <script> blocks from markdown", async () => {
    const markdown = [
      "Before",
      "",
      '<script>alert("xss")</script>',
      "",
      "After",
    ].join("\n");

    const html = await markdownToHtml(markdown);

    expect(html).not.toContain("<script");
    expect(html).not.toContain("</script>");
    expect(html).not.toContain('alert("xss")');
    expect(html).toContain("Before");
    expect(html).toContain("After");
  });

  it("removes raw <iframe> blocks from markdown", async () => {
    const markdown = '<iframe src="https://evil.example"></iframe>';
    const html = await markdownToHtml(markdown);

    expect(html).not.toContain("<iframe");
    expect(html).not.toContain("evil.example");
  });

  it("strips inline event handlers from raw HTML anchors", async () => {
    const markdown = '<a href="#" onclick="alert(1)">click</a>';
    const html = await markdownToHtml(markdown);

    expect(html).not.toContain("onclick");
    expect(html).not.toContain("alert(1)");
    expect(html).toContain("<a");
    expect(html).toContain('href="#"');
    expect(html).toContain(">click</a>");
  });

  it("removes javascript: URLs in markdown links", async () => {
    const markdown = "[click me](javascript:alert(1))";
    const html = await markdownToHtml(markdown);

    expect(html).not.toMatch(/href\s*=\s*"javascript:/i);
    expect(html).not.toContain("alert(1)");
    expect(html).toContain("click me");
  });

  it("escapes literal angle brackets entered as text via entities", async () => {
    const html = await markdownToHtml("Show &lt;script&gt; as text.");
    expect(html).toMatch(
      /(?:&lt;|&#x3[cC];|&#0*60;)script(?:&gt;|&#x3[eE];|&#0*62;|>)/
    );
    expect(html).not.toContain("<script");
  });
});
