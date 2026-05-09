import { NextResponse, type NextRequest } from "next/server";
import { z } from "zod";
import { resolveBlogLocaleSwitchPath } from "@/lib/blog-data";

const querySchema = z.object({
  from: z.enum(["en", "es"]),
  to: z.enum(["en", "es"]),
  path: z
    .string()
    .max(512)
    .transform((s) => (s.startsWith("/") ? s : `/${s}`))
    .refine(
      (p) => p === "/blog" || /^\/blog\/[a-zA-Z0-9_-]+$/.test(p),
      "path must be /blog or /blog/{slug}"
    ),
});

export async function GET(request: NextRequest) {
  const parsed = querySchema.safeParse({
    from: request.nextUrl.searchParams.get("from"),
    to: request.nextUrl.searchParams.get("to"),
    path: request.nextUrl.searchParams.get("path") ?? "",
  });

  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid query" }, { status: 400 });
  }

  const { from, to, path } = parsed.data;
  const targetPath = await resolveBlogLocaleSwitchPath(from, to, path);

  return NextResponse.json({ path: targetPath });
}
