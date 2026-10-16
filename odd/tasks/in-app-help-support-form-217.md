# In-app help / shared support form (#217)

Objective: Shared support form (reason, subject, name, email, message); in-app help CTA first 14 days after `confirmed_at`; email via MailerSend. Branch: `feat/in-app-help-support-form-217`. Delivery: ask-on-risk. Runner: Vitest in Docker.

## Specs

- S1: Shared form fields: reason, subject (prefilled from reason label), name, email, message. Reason codes: need_help, report_error, request_feature, other.
- S2: Entry marks reason via prop/query (`reason=`). Help CTA → need_help; report bug menu → report_error.
- S3: Email subject `[Veta] Contact: (<reason tag>) <subject>`; Reply-To name+email; From display `Name via Veta`; body has collected fields except name/email in headers.
- S4: Prominent help CTA on `/veta-app/*` for 14 days from `user.confirmed_at`; after that only user menu. Hide demo (`demo@veta.pro`). Not on `/view-project/*`.
- S5: ES/EN i18n; rate limit + honeypot + min submit time; toast success/error; `help_clicked` event.
- S6: Marketing `/contact` uses same form; optional `?reason=`.

## Tasks

- T1 S1,S3,S6 — support lib + submit action + contact migrate — inline — done
- T2 S2,S4,S5 — app shell CTA/dialog + trackEvent + i18n — inline — done
- T3 — focused Vitest — inline — done (25 passed)

## Log

- L1: User: implement (form shared; confirmed_at; reason from entry; subject prefilled; email headers for name/email/reply-to).
- L2: Implemented shared SupportForm, submitSupportForm, app-layout CTA/dialog, marketing contact migrate.
