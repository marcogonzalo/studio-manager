# Draft GitHub issue: Project creation wizard

> Approve before creating on GitHub.

## Title

Project creation wizard (identity + billing, optional client, budget start with import)

## Body

### Context

Replaces the create mode of the project modal with a progressive wizard. Edit mode stays a dialog. Depends on budget import (#215 / #219) because step 3 embeds `ImportFlow`.

### Flow

1. **Project + billing (required):** name, currency, tax / multitax (prefilled from account defaults). Optional collapsed: address, description, phase, dates. Status always `active` (not asked). Project is inserted on Next (`project_created` with `source: "wizard"`).
2. **Client (optional / Skip):** pick or create client.
3. **Start budget (optional):** import Excel/CSV via ImportFlow, add from catalog later, or skip.
4. **Summary** → open project Budget tab.

### Acceptance criteria

- [ ] New project CTAs (projects list, onboarding `?onboarding=project`) open the wizard.
- [ ] Step 1 blocks without name, currency, and tax.
- [ ] Status not shown; always inserted as active.
- [ ] Client and budget steps skippable.
- [ ] ImportFlow embedded; spaces/suppliers created from file.
- [ ] Edit project still uses the existing dialog.
- [ ] ES/EN copy; light/dark; mobile layout.
- [ ] Plan active-project limit checked on step 1.
- [ ] Unit tests for step gating and single create on back/next.

### Related

- #215, #219
