/**
 * Google Tag Manager (GTM) + GA4 dataLayer helpers for marketing funnel tracking.
 * Use with GTM container; configure GA4 tags in GTM to consume these events.
 */

export const GTM_ID = process.env.NEXT_PUBLIC_GTM_ID ?? "";

export function isGtmEnabled(): boolean {
  return typeof window !== "undefined" && Boolean(GTM_ID);
}

/** GA4 recommended + custom event names for funnel and engagement */
export const GTM_EVENTS = {
  PAGE_VIEW: "page_view",
  VIEW_ITEM_LIST: "view_item_list",
  SELECT_ITEM: "select_item",
  BEGIN_CHECKOUT: "begin_checkout",
  SIGN_UP: "sign_up",
  LOGIN: "login",
  CONTACT: "contact",
  /** Custom: CTA click (header, hero, etc.) */
  CTA_CLICK: "cta_click",
  /** Custom: plan selected on pricing (plan code + billing) */
  SELECT_PLAN: "select_plan",
  /** Custom: pricing page viewed */
  VIEW_PRICING: "view_pricing",
  /** Custom: scroll / section view (engagement) */
  VIEW_SECTION: "view_section",
} as const;

export type PlanCode = "BASE" | "PRO" | "STUDIO";
export type BillingPeriod = "monthly" | "annual";

/** DataLayer event payloads for GA4 and custom dimensions */
export interface DataLayerPageView {
  event: typeof GTM_EVENTS.PAGE_VIEW;
  page_path?: string;
  page_title?: string;
  page_location?: string;
}

export interface DataLayerViewItemList {
  event: typeof GTM_EVENTS.VIEW_ITEM_LIST;
  item_list_id?: string;
  item_list_name?: string;
  items?: Array<{
    item_id: string;
    item_name: string;
    price?: number;
    index?: number;
  }>;
}

export interface DataLayerSelectPlan {
  event: typeof GTM_EVENTS.SELECT_PLAN;
  plan_code: PlanCode;
  billing_period: BillingPeriod;
  plan_name: string;
  cta_text?: string;
}

export interface DataLayerBeginCheckout {
  event: typeof GTM_EVENTS.BEGIN_CHECKOUT;
  plan_code?: PlanCode;
  billing_period?: BillingPeriod;
  value?: number;
  currency?: string;
}

export interface DataLayerCtaClick {
  event: typeof GTM_EVENTS.CTA_CLICK;
  cta_location: string;
  cta_text: string;
  destination_url?: string;
}

export interface DataLayerViewPricing {
  event: typeof GTM_EVENTS.VIEW_PRICING;
  page_location?: string;
}

export interface DataLayerContact {
  event: typeof GTM_EVENTS.CONTACT;
  page_location?: string;
}

export interface DataLayerViewSection {
  event: typeof GTM_EVENTS.VIEW_SECTION;
  section_name: string;
  section_id?: string;
}

export interface DataLayerSignUp {
  event: typeof GTM_EVENTS.SIGN_UP;
  method?: string;
  plan_code?: PlanCode;
}

export interface DataLayerLogin {
  event: typeof GTM_EVENTS.LOGIN;
  method?: string;
}

export type DataLayerEvent =
  | DataLayerPageView
  | DataLayerViewItemList
  | DataLayerSelectPlan
  | DataLayerBeginCheckout
  | DataLayerCtaClick
  | DataLayerViewPricing
  | DataLayerContact
  | DataLayerViewSection
  | DataLayerSignUp
  | DataLayerLogin
  | { event: string; [key: string]: unknown };

declare global {
  interface Window {
    dataLayer: DataLayerEvent[];
  }
}

/** Push an event to the GTM dataLayer. Safe to call in SSR (no-op). */
export function pushToDataLayer(event: DataLayerEvent): void {
  if (typeof window === "undefined") return;
  window.dataLayer = window.dataLayer ?? [];
  window.dataLayer.push(event);
}

/** Push page_view (path, title, location). Call on client when route changes. */
export function pushPageView(params: {
  path: string;
  title?: string;
  location?: string;
}): void {
  const location =
    params.location ??
    (typeof window !== "undefined" ? window.location.href : undefined);
  pushToDataLayer({
    event: GTM_EVENTS.PAGE_VIEW,
    page_path: params.path,
    page_title: params.title ?? undefined,
    page_location: location,
  });
}

/** Push select_plan when user clicks a plan CTA on pricing. */
export function pushSelectPlan(params: {
  plan_code: PlanCode;
  billing_period: BillingPeriod;
  plan_name: string;
  cta_text?: string;
}): void {
  pushToDataLayer({
    event: GTM_EVENTS.SELECT_PLAN,
    ...params,
  });
  pushToDataLayer({
    event: GTM_EVENTS.BEGIN_CHECKOUT,
    plan_code: params.plan_code,
    billing_period: params.billing_period,
    currency: "EUR",
  });
}

/** Push CTA click for header/hero CTAs. */
export function pushCtaClick(params: {
  cta_location: string;
  cta_text: string;
  destination_url?: string;
}): void {
  pushToDataLayer({
    event: GTM_EVENTS.CTA_CLICK,
    ...params,
  });
}

/** Push view_pricing when pricing page is viewed. */
export function pushViewPricing(): void {
  pushToDataLayer({
    event: GTM_EVENTS.VIEW_PRICING,
    page_location:
      typeof window !== "undefined" ? window.location.href : undefined,
  });
}

/** Push contact when contact form is submitted successfully. */
export function pushContact(): void {
  pushToDataLayer({
    event: GTM_EVENTS.CONTACT,
    page_location:
      typeof window !== "undefined" ? window.location.href : undefined,
  });
}

/** Push sign_up when user completes sign-up flow (e.g. magic link sent). */
export function pushSignUp(params?: {
  method?: string;
  plan_code?: PlanCode;
}): void {
  pushToDataLayer({
    event: GTM_EVENTS.SIGN_UP,
    method: params?.method ?? "magic_link",
    ...(params?.plan_code && { plan_code: params.plan_code }),
  });
}

/** Push login when user initiates login (e.g. magic link sent). */
export function pushLogin(params?: { method?: string }): void {
  pushToDataLayer({
    event: GTM_EVENTS.LOGIN,
    method: params?.method ?? "magic_link",
  });
}
