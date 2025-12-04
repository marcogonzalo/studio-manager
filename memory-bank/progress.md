# Progress

## Completed Features

- [x] Project Initialization (Vite, React, TS).
- [x] Docker Environment.
- [x] Supabase Setup (Schema, RLS, Auth).
- [x] Authentication UI.
- [x] App Layout (Sidebar, Responsive).
- [x] Clients Module (List, Create, Edit, Delete).
- [x] Suppliers Module.
- [x] Catalog Module.
- [x] Projects Module (List, Create).
- [x] Project Details:
  - [x] General Info.
  - [x] Spaces & Renders.
  - [x] Budgeting & Items.
  - [x] Purchase Orders.
  - [x] Notes.
  - [x] Documents.
- [x] UI Theming (Natural/Pastel).
- [x] Dashboard Implementation.

## Pending Features

- [ ] **Real File Uploads:** Replace URL inputs with file pickers uploading to Supabase Storage.
- [ ] **Advanced PDF Generation:** Server-side or client-side PDF generation for professional quotes.
- [ ] **Email Notifications:** Notify clients/suppliers (via Edge Functions).
- [ ] **Testing:** Unit and E2E tests.
- [ ] **Production Deployment.**

## Issues & Improvements from First Review

### Critical Bugs

- [x] **Purchase Orders RLS Error:** La creación de órdenes de compra da error: `{"code":"42501","details":null,"hint":null,"message":"new row violates row-level security policy for table \"purchase_orders\""}`. Revisar y corregir políticas RLS para `purchase_orders`. **RESUELTO:** Se añadió el campo `user_id` al insert de purchase orders en `project-purchases.tsx`.

### Functionality Improvements

- [ ] **Edit Budget Items:** Una vez incorporado un item al presupuesto, no se puede editar, solo borrar. Debe permitirse editar items del presupuesto.

- [ ] **Add Products to Spaces:** Debe poderse agregar productos directamente en cada espacio y que luego aparezcan automáticamente en el presupuesto. Los productos deben poder agregarse desde ambos lugares: espacio y presupuesto.

- [ ] **Space Products View:** Los espacios deben poder abrirse y ver todos los productos que tienen asociados en una grilla muy visual.

- [ ] **Additional Project Costs:** Un producto puede tener costes adicionales dentro del proyecto (por ejemplo, fletes, entre otros).

- [ ] **Visual Product Selection:** Para agregar productos a un espacio o presupuesto, debe proveerse un listado más visual (una lista por tarjetas con imagen, nombre del producto y proveedor).

- [ ] **Product Image Modal:** En los elementos que muestren un producto en los listados, con imagen, la imagen debe poder abrirse en una modal para verla ampliada. Puede ser una modal que directamente muestre todo el detalle del producto, como una ficha.

- [ ] **Delete Notes:** Las notas deben poder eliminarse.

- [ ] **Archive Notes:** Las notas tendrán todas un check para marcar si ya se pueden archivar. Mostrando siempre primero las no archivadas. Las archivadas estarán en un tono más claro, para que no destaquen tanto.

- [ ] **Product Reference URL:** Un producto debe tener una URL de referencia de donde se ha cogido la información.

- [ ] **Add Supplier from Product Form:** Se debe poder añadir un nuevo proveedor desde el formulario de nuevo producto, para facilitar la usabilidad. Que sea una opción de seleccionar o agregar nuevo y que al agregarlo quede seleccionado como el proveedor de ese producto.

- [ ] **Add Product from Space/Budget:** Se debe poder añadir un nuevo producto directamente desde el espacio o el presupuesto. Que no sea necesario ir a Catálogo para agregar el producto para luego volver al espacio o al presupuesto a agregarlo.

- [ ] **Manageable Purchase Orders:** La orden de compra debe ser gestionable. Al crearla, se debe poder especificar los productos asociados a esa orden de compra, no se debe asumir que son todos los productos registrados hasta el momento. Por lo general estarán, al menos, generadas por proveedor.
