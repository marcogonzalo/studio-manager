# Empty states copy table (#214)

Shared component: `src/components/ui/empty-state.tsx` (icon, title, description, optional value line, one primary CTA).

Persona key: **Elena** = control/profitability · **Javi** = speed on site · **Beatriz** = traceability · **Client** = public shared view (no CTA).

| Screen                          | Persona | Title (EN)                    | Value (EN)                                | Primary CTA             |
| ------------------------------- | ------- | ----------------------------- | ----------------------------------------- | ----------------------- |
| Dashboard – recent projects     | Elena   | Start your first project      | One place to see active work…             | Create Project          |
| Dashboard – sample only         | Elena   | Create your first own project | Your real work belongs in a project…      | Create Project          |
| Projects – empty                | Elena   | You have no active projects   | Start one project to track margin…        | New Project             |
| Projects – no results           | Elena   | No search results             | Clear filters to see your full list…      | Clear search            |
| Projects – sample only          | Elena   | Create your first own project | Start a real project to track…            | New Project             |
| Clients                         | Elena   | No clients yet                | Link clients to projects…                 | New Client              |
| Suppliers                       | Elena   | No suppliers yet              | Keep costs and POs tied to vendor…        | New Supplier            |
| Catalog                         | Elena   | No products yet               | Reuse products across budgets…            | New Product             |
| Add item – empty catalog        | Elena   | Your catalog is empty         | Create a product once and reuse…          | Create product          |
| Add item – empty search         | Elena   | No products match that search | Clear the search…                         | Clear search            |
| Project dashboard – budget card | Elena   | No budget lines yet           | See where money goes…                     | Go to quotation         |
| Project dashboard – PO card     | Javi    | No purchase orders yet        | Know what is still pending…               | Go to purchases         |
| Budget – no products            | Elena   | No products added yet         | Build the client budget…                  | Add first product       |
| Cost control                    | Elena   | No budget line items recorded | Compare estimate versus actual…           | Add First Line Item     |
| Additional costs                | Elena   | No additional costs recorded  | Capture every extra cost…                 | Add First Cost          |
| Payments                        | Beatriz | No payments recorded          | Track pending versus received…            | Register First Payment  |
| Purchases                       | Javi    | No purchase orders yet        | Send and track orders…                    | Create First Order      |
| Purchase order – no items       | Javi    | No items in this order        | Add items so supplier gets complete order | Edit order              |
| Spaces                          | Javi    | No spaces registered          | Organize products and renders…            | Add first space         |
| Space images                    | Beatriz | No renders yet                | Share renders with the client…            | Add first image         |
| Documents                       | Beatriz | No documents yet              | Keep every project file easy to find…     | Add first document      |
| Notes                           | Beatriz | No notes yet                  | Keep site decisions… (hint to form)       | — (form adjacent)       |
| Sample banner                   | Elena   | (banner text)                 | —                                         | Create your own project |
| Public – payments               | Client  | No payments yet               | Payments recorded by your designer…       | —                       |
| Public – spaces                 | Client  | No spaces to show yet         | Spaces shared by your designer…           | —                       |
| Public – documents              | Client  | No documents yet              | Documents shared by your designer…        | —                       |
| Public – costs                  | Client  | No budget lines yet           | Budget lines shared by your designer…     | —                       |

Spanish strings live in the matching keys under `src/i18n/messages/es/`.
