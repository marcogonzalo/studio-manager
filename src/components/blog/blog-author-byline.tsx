import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/routing";
import type { BlogAuthor } from "@/lib/blog-author";

const linkClassName =
  "text-foreground hover:text-primary font-medium underline-offset-4 transition-colors hover:underline";

export async function BlogAuthorByline({ author }: { author: BlogAuthor }) {
  const t = await getTranslations("Blog");

  return (
    <p className="text-muted-foreground text-sm">
      {t("authorBylinePrefix")}{" "}
      {author.url ? (
        <a
          href={author.url}
          className={linkClassName}
          rel="author noopener noreferrer"
          target="_blank"
        >
          {author.name}
        </a>
      ) : (
        <span className="text-foreground font-medium">{author.name}</span>
      )}
      {" · "}
      <Link href="/" className={linkClassName}>
        {t("authorRole")}
      </Link>
    </p>
  );
}
