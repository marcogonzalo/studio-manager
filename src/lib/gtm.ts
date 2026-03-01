/**
 * Google Tag Manager (GTM) + GA4 dataLayer helpers for marketing funnel tracking.
 * Event names and parameters follow GA4 recommended events where applicable:
 * https://developers.google.com/analytics/devguides/collection/ga4/reference/events
 * Use with GTM container; configure GA4 tags in GTM to consume these events.
 */

export const GTM_ID = process.env.NEXT_PUBLIC_GTM_ID ?? "";

export function isGtmEnabled(): boolean {
  return typeof window !== "undefined" && Boolean(GTM_ID);
}

/** Generate a unique event_id for GA4 deduplication. Same event_id = GA4 counts once. */
function generateEventId(): string {
  if (typeof window === "undefined") return "";
  if (typeof crypto !== "undefined" && crypto.randomUUID) {
    return crypto.randomUUID();
  }
  return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 11)}`;
}

/** GA4 recommended + custom event names for funnel and engagement */
export const GTM_EVENTS = {
  PAGE_VIEW: "page_view",
  VIEW_ITEM_LIST: "view_item_list",
  SELECT_ITEM: "select_item",
  BEGIN_CHECKOUT: "begin_checkout",
  SIGN_UP: "sign_up",
  /** When user completes registration by using the confirmation link (custom, use with sign_up) */
  SIGN_UP_CONFIRMED: "sign_up_confirmed",
  LOGIN: "login",
  /** When user completes login by using the magic link */
  LOGIN_CONFIRMED: "login_confirmed",
  CONTACT: "contact",
  /** GA4 recommended: lead generation (e.g. contact form submit) */
  GENERATE_LEAD: "generate_lead",
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

/** GA4 recommended: begin_checkout with items array (item_id/item_name, quantity, optional price). */
export interface DataLayerBeginCheckout {
  event: typeof GTM_EVENTS.BEGIN_CHECKOUT;
  currency: string;
  items: Array<{
    item_id: string;
    item_name: string;
    quantity: number;
    price?: number;
  }>;
  value?: number;
  plan_code?: PlanCode;
  billing_period?: BillingPeriod;
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

/** GA4 recommended: contact event (e.g. form submit). Params: currency/value for key events, lead_status. */
export interface DataLayerContact {
  event: typeof GTM_EVENTS.CONTACT;
  page_location?: string;
  currency?: string;
  value?: number;
  lead_status?: string;
}

/** GA4 recommended: generate_lead. Params: currency, value (recommended for key events), lead_source. */
export interface DataLayerGenerateLead {
  event: typeof GTM_EVENTS.GENERATE_LEAD;
  page_location?: string;
  currency?: string;
  value?: number;
  lead_source?: string;
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
  billing_period?: BillingPeriod;
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
  | DataLayerGenerateLead
  | DataLayerViewSection
  | DataLayerSignUp
  | DataLayerLogin
  | { event: string; [key: string]: unknown };

declare global {
  interface Window {
    dataLayer: DataLayerEvent[];
  }
}

/** Push an event to the GTM dataLayer. Safe to call in SSR (no-op). Adds event_id for GA4 deduplication when not provided. */
export function pushToDataLayer(event: DataLayerEvent): void {
  if (typeof window === "undefined") return;
  window.dataLayer = window.dataLayer ?? [];
  const payload = event as Record<string, unknown>;
  const withEventId =
    payload.event_id !== undefined
      ? event
      : { ...payload, event_id: generateEventId() };
  window.dataLayer.push(withEventId as DataLayerEvent);
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

/** Push select_plan (custom) + begin_checkout (GA4) when user clicks a plan CTA on pricing. */
export function pushSelectPlan(params: {
  plan_code: PlanCode;
  billing_period: BillingPeriod;
  plan_name: string;
  cta_text?: string;
  value?: number;
}): void {
  pushToDataLayer({
    event: GTM_EVENTS.SELECT_PLAN,
    ...params,
  });
  const items = [
    {
      item_id: params.plan_code,
      item_name: params.plan_name,
      quantity: 1,
      ...(params.value != null && { price: params.value }),
    },
  ];
  pushToDataLayer({
    event: GTM_EVENTS.BEGIN_CHECKOUT,
    currency: "EUR",
    items,
    ...(params.value != null && { value: params.value }),
    plan_code: params.plan_code,
    billing_period: params.billing_period,
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

/** Push contact + generate_lead (GA4 recommended) when contact form is submitted successfully. */
export function pushContact(params?: {
  lead_source?: string;
  lead_status?: string;
  value?: number;
  currency?: string;
}): void {
  const location =
    typeof window !== "undefined" ? window.location.href : undefined;
  const currency = params?.currency ?? "EUR";
  const value = params?.value ?? 0;
  pushToDataLayer({
    event: GTM_EVENTS.CONTACT,
    page_location: location,
    currency,
    value,
    lead_status: params?.lead_status ?? "Form submitted",
  });
  pushToDataLayer({
    event: GTM_EVENTS.GENERATE_LEAD,
    page_location: location,
    currency,
    value,
    lead_source: params?.lead_source ?? "contact_form",
  });
}

/** Push sign_up when user submits registration form (magic link requested). */
export function pushSignUp(params?: {
  method?: string;
  plan_code?: PlanCode;
  billing_period?: BillingPeriod;
}): void {
  pushToDataLayer({
    event: GTM_EVENTS.SIGN_UP,
    method: params?.method ?? "magic_link",
    ...(params?.plan_code && { plan_code: params.plan_code }),
    ...(params?.billing_period && { billing_period: params.billing_period }),
  });
}

/** Push login when user requests magic link (sign-in form submit). */
export function pushLogin(params?: { method?: string }): void {
  pushToDataLayer({
    event: GTM_EVENTS.LOGIN,
    method: params?.method ?? "magic_link",
  });
}

/** Push when user completes registration by using the confirmation link (account effective in DB). */
export function pushSignUpConfirmed(params?: {
  method?: string;
  plan_code?: PlanCode;
  billing_period?: BillingPeriod;
}): void {
  const method = params?.method ?? "magic_link";
  const location =
    typeof window !== "undefined" ? window.location.href : undefined;
  pushToDataLayer({
    event: GTM_EVENTS.SIGN_UP_CONFIRMED,
    method,
    page_location: location,
    ...(params?.plan_code && { plan_code: params.plan_code }),
    ...(params?.billing_period && { billing_period: params.billing_period }),
  });
  pushToDataLayer({
    event: GTM_EVENTS.SIGN_UP,
    method,
    confirmed: true,
    ...(params?.plan_code && { plan_code: params.plan_code }),
    ...(params?.billing_period && { billing_period: params.billing_period }),
  });
}

/** Push when user completes login by using the magic link. */
export function pushLoginConfirmed(): void {
  pushToDataLayer({
    event: GTM_EVENTS.LOGIN_CONFIRMED,
    method: "magic_link",
    page_location:
      typeof window !== "undefined" ? window.location.href : undefined,
  });
  pushToDataLayer({
    event: GTM_EVENTS.LOGIN,
    method: "magic_link",
    confirmed: true,
  });
}
