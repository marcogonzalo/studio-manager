"use client";

import {
  forwardRef,
  useState,
  useEffect,
  type ComponentPropsWithoutRef,
} from "react";
import { ChevronDown, Menu } from "lucide-react";
import { useLocale, useTranslations } from "next-intl";
import { Link } from "@/i18n/routing";
import { pushCtaClick } from "@/lib/gtm";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/theme-toggle";
import { VetaLogo } from "@/components/veta-logo";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { cn } from "@/lib/utils";
import { LanguageToggle } from "@/components/language-toggle";
import {
  MARKETING_PRIMARY_NAV,
  clientViewBlogHref,
  type MarketingHref,
  type MarketingNavBranch,
  type MarketingNavItem,
  type MarketingNavLeaf,
} from "@/lib/marketing-nav";

function isBranch(
  item: MarketingNavLeaf | MarketingNavBranch
): item is MarketingNavBranch {
  return "children" in item && Array.isArray(item.children);
}

function resolveHref(
  href: MarketingHref,
  id: string,
  locale: string
): MarketingHref {
  if (id === "client-view") return clientViewBlogHref(locale);
  return href;
}

type NavLinkProps = {
  href: MarketingHref;
  className?: string;
  onClick?: ComponentPropsWithoutRef<"a">["onClick"];
  children: React.ReactNode;
};

/** Must forwardRef — Radix DropdownMenuItem asChild calls .focus() on the child. */
const NavLink = forwardRef<HTMLAnchorElement, NavLinkProps>(function NavLink(
  { href, className, onClick, children },
  ref
) {
  return (
    <Link ref={ref} href={href} className={className} onClick={onClick}>
      {children}
    </Link>
  );
});

type HeaderT = (key: string) => string;

function DesktopMenuItem({
  item,
  locale,
  t,
}: {
  item: MarketingNavLeaf | MarketingNavBranch;
  locale: string;
  t: HeaderT;
}) {
  if (isBranch(item)) {
    return (
      <DropdownMenuSub>
        <DropdownMenuSubTrigger>{t(item.labelKey)}</DropdownMenuSubTrigger>
        <DropdownMenuSubContent className="min-w-[14rem]">
          {item.href ? (
            <DropdownMenuItem asChild>
              <NavLink href={resolveHref(item.href, item.id, locale)}>
                {t(item.labelKey)}
              </NavLink>
            </DropdownMenuItem>
          ) : null}
          {item.children.map((child) => (
            <DropdownMenuItem key={child.id} asChild>
              <NavLink href={resolveHref(child.href, child.id, locale)}>
                {t(child.labelKey)}
                {child.comingSoon ? (
                  <span className="text-muted-foreground ml-auto text-xs">
                    {t("comingSoon")}
                  </span>
                ) : null}
              </NavLink>
            </DropdownMenuItem>
          ))}
        </DropdownMenuSubContent>
      </DropdownMenuSub>
    );
  }

  return (
    <DropdownMenuItem asChild>
      <NavLink href={resolveHref(item.href, item.id, locale)}>
        {t(item.labelKey)}
        {item.comingSoon ? (
          <span className="text-muted-foreground ml-auto text-xs">
            {t("comingSoon")}
          </span>
        ) : null}
      </NavLink>
    </DropdownMenuItem>
  );
}

function DesktopNavItem({
  item,
  locale,
  t,
}: {
  item: MarketingNavItem;
  locale: string;
  t: HeaderT;
}) {
  if (item.type === "link") {
    return (
      <NavLink
        href={item.href}
        className="text-muted-foreground hover:text-foreground text-sm font-medium transition-colors"
      >
        {t(item.labelKey)}
      </NavLink>
    );
  }

  return (
    <DropdownMenu modal={false}>
      <DropdownMenuTrigger
        type="button"
        className="text-muted-foreground hover:text-foreground inline-flex items-center gap-1 text-sm font-medium transition-colors outline-none"
      >
        {t(item.labelKey)}
        <ChevronDown className="size-3.5 opacity-70" aria-hidden />
      </DropdownMenuTrigger>
      <DropdownMenuContent
        align="start"
        className="min-w-[16rem]"
        onCloseAutoFocus={(event) => event.preventDefault()}
      >
        {item.items.map((entry) => (
          <DesktopMenuItem key={entry.id} item={entry} locale={locale} t={t} />
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

function MobileAccordion({
  item,
  locale,
  t,
  onNavigate,
}: {
  item: Extract<MarketingNavItem, { type: "menu" }>;
  locale: string;
  t: HeaderT;
  onNavigate: () => void;
}) {
  const [open, setOpen] = useState(false);

  return (
    <Collapsible open={open} onOpenChange={setOpen}>
      <CollapsibleTrigger className="text-foreground flex w-full items-center justify-between py-2 text-left text-lg font-medium">
        {t(item.labelKey)}
        <ChevronDown
          className={cn("size-4 transition-transform", open && "rotate-180")}
          aria-hidden
        />
      </CollapsibleTrigger>
      <CollapsibleContent>
        <ul className="border-border mb-2 ml-2 space-y-2 border-l pl-3">
          {item.items.map((entry) => {
            if (isBranch(entry)) {
              return (
                <li key={entry.id} className="space-y-2">
                  {entry.href ? (
                    <NavLink
                      href={resolveHref(entry.href, entry.id, locale)}
                      onClick={onNavigate}
                      className="text-muted-foreground hover:text-foreground block text-base font-medium"
                    >
                      {t(entry.labelKey)}
                    </NavLink>
                  ) : (
                    <p className="text-muted-foreground text-base font-medium">
                      {t(entry.labelKey)}
                    </p>
                  )}
                  <ul className="ml-2 space-y-2">
                    {entry.children.map((child) => (
                      <li key={child.id}>
                        <NavLink
                          href={resolveHref(child.href, child.id, locale)}
                          onClick={onNavigate}
                          className="text-muted-foreground hover:text-foreground block text-sm"
                        >
                          {t(child.labelKey)}
                          {child.comingSoon ? (
                            <span className="text-muted-foreground ml-2 text-xs">
                              {t("comingSoon")}
                            </span>
                          ) : null}
                        </NavLink>
                      </li>
                    ))}
                  </ul>
                </li>
              );
            }

            return (
              <li key={entry.id}>
                <NavLink
                  href={resolveHref(entry.href, entry.id, locale)}
                  onClick={onNavigate}
                  className="text-muted-foreground hover:text-foreground block text-base"
                >
                  {t(entry.labelKey)}
                  {entry.comingSoon ? (
                    <span className="text-muted-foreground ml-2 text-xs">
                      {t("comingSoon")}
                    </span>
                  ) : null}
                </NavLink>
              </li>
            );
          })}
        </ul>
      </CollapsibleContent>
    </Collapsible>
  );
}

export function MarketingHeader() {
  const tRaw = useTranslations("Header");
  const t: HeaderT = (key) => tRaw(key as Parameters<typeof tRaw>[0]);
  const tCommon = useTranslations("Common");
  const locale = useLocale();
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    handleScroll();
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const closeSheet = () => setOpen(false);

  return (
    <header
      className={cn(
        "sticky top-0 z-50 w-full transition-all duration-300",
        scrolled
          ? "border-border/40 bg-background/95 supports-[backdrop-filter]:bg-background/60 border-b shadow-sm backdrop-blur"
          : "border-b border-transparent bg-transparent"
      )}
    >
      <div className="container mx-auto flex h-16 max-w-7xl items-center gap-4 px-4">
        <Link href="/" className="flex shrink-0 items-center" aria-label="Veta">
          <VetaLogo height={28} />
        </Link>

        <nav className="hidden flex-1 items-center gap-5 lg:flex">
          {MARKETING_PRIMARY_NAV.map((item) => (
            <DesktopNavItem key={item.id} item={item} locale={locale} t={t} />
          ))}
        </nav>

        <div className="ml-auto flex items-center gap-2 sm:gap-3">
          <div className="hidden items-center gap-2 lg:flex">
            <LanguageToggle />
            <ThemeToggle />
            <Button variant="ghost" asChild>
              <Link
                href="/sign-in"
                onClick={() =>
                  pushCtaClick({
                    cta_location: "header",
                    cta_text: t("signIn"),
                    destination_url: "/sign-in",
                  })
                }
              >
                {t("signIn")}
              </Link>
            </Button>
            <Button variant="secondary" asChild>
              <Link
                href="/demo"
                onClick={() =>
                  pushCtaClick({
                    cta_location: "header",
                    cta_text: t("viewDemo"),
                    destination_url: "/demo",
                  })
                }
              >
                {t("viewDemo")}
              </Link>
            </Button>
            <Button asChild>
              <Link
                href="/sign-up"
                onClick={() =>
                  pushCtaClick({
                    cta_location: "header",
                    cta_text: t("startFree"),
                    destination_url: "/sign-up",
                  })
                }
              >
                {t("startFree")}
              </Link>
            </Button>
          </div>

          <Button asChild className="lg:hidden">
            <Link
              href="/sign-up"
              onClick={() =>
                pushCtaClick({
                  cta_location: "header_mobile",
                  cta_text: t("startFree"),
                  destination_url: "/sign-up",
                })
              }
            >
              {t("startFree")}
            </Link>
          </Button>

          <Sheet open={open} onOpenChange={setOpen}>
            <SheetTrigger asChild className="lg:hidden">
              <Button
                variant="ghost"
                size="icon"
                aria-label={tCommon("openMenu")}
              >
                <Menu className="h-5 w-5" />
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-[min(100%,20rem)]">
              <SheetHeader className="sr-only">
                <SheetTitle>{tCommon("menuTitle")}</SheetTitle>
              </SheetHeader>
              <nav className="mt-8 flex flex-col gap-1">
                {MARKETING_PRIMARY_NAV.map((item) => {
                  if (item.type === "link") {
                    return (
                      <NavLink
                        key={item.id}
                        href={item.href}
                        onClick={closeSheet}
                        className="text-foreground py-2 text-lg font-medium"
                      >
                        {t(item.labelKey)}
                      </NavLink>
                    );
                  }
                  return (
                    <MobileAccordion
                      key={item.id}
                      item={item}
                      locale={locale}
                      t={t}
                      onNavigate={closeSheet}
                    />
                  );
                })}

                <div className="border-border mt-4 flex flex-col gap-3 border-t pt-4">
                  <Button variant="secondary" asChild className="justify-start">
                    <Link
                      href="/demo"
                      onClick={() => {
                        pushCtaClick({
                          cta_location: "header_mobile",
                          cta_text: t("viewDemo"),
                          destination_url: "/demo",
                        });
                        closeSheet();
                      }}
                    >
                      {t("viewDemo")}
                    </Link>
                  </Button>
                  <Button variant="ghost" asChild className="justify-start">
                    <Link
                      href="/sign-in"
                      onClick={() => {
                        pushCtaClick({
                          cta_location: "header_mobile",
                          cta_text: t("signIn"),
                          destination_url: "/sign-in",
                        });
                        closeSheet();
                      }}
                    >
                      {t("signIn")}
                    </Link>
                  </Button>
                  <div className="flex items-center gap-3 px-1">
                    <LanguageToggle />
                    <ThemeToggle />
                  </div>
                </div>
              </nav>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  );
}
