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

- [x] **Edit Budget Items:** Una vez incorporado un item al presupuesto, no se puede editar, solo borrar. Debe permitirse editar items del presupuesto. **RESUELTO:** Se añadió funcionalidad de edición en `AddItemDialog` y botón de editar en la tabla de `project-budget.tsx`.

- [x] **Add Products to Spaces:** Debe poderse agregar productos directamente en cada espacio y que luego aparezcan automáticamente en el presupuesto. Los productos deben poder agregarse desde ambos lugares: espacio y presupuesto. **RESUELTO:** Se creó `SpaceProductsDialog` que permite añadir productos directamente desde un espacio. Los productos se vinculan automáticamente al espacio y aparecen en el presupuesto.

- [x] **Space Products View:** Los espacios deben poder abrirse y ver todos los productos que tienen asociados en una grilla muy visual. **RESUELTO:** Se implementó una grilla visual de productos con imágenes en `SpaceProductsDialog`, accesible desde el botón "Productos" en cada tarjeta de espacio.

- [x] **Additional Project Costs:** Un proyecto puede tener costes adicionales dentro del proyecto (por ejemplo, envío, embalaje, instalación, entre otros costes). **RESUELTO:** Se creó la tabla `additional_project_costs` con migración, se implementó `AdditionalCostDialog` para añadir/editar costes, se creó `ProjectAdditionalCosts` component que agrupa costes por tipo, y se añadió la pestaña en el detalle del proyecto.

- [x] **Visual Product Selection:** Para agregar productos a un espacio o presupuesto, debe proveerse un listado más visual (una lista por tarjetas con imagen, nombre del producto y proveedor). **RESUELTO:** Se implementó un sistema de pestañas con búsqueda en tiempo real y grid visual de productos en tarjetas. Incluye búsqueda por nombre, descripción o referencia, y separación clara entre seleccionar del catálogo y crear nuevo producto.

- [x] **Product Image Modal:** En los elementos que muestren un producto en los listados, con imagen pequeña, la imagen debe poder abrirse en una modal para verla ampliada. Puede ser una modal que directamente muestre todo el detalle del producto, como una ficha. **RESUELTO:** Se creó `ProductDetailModal` que muestra imagen ampliada y todos los detalles del producto (nombre, descripción, referencia, categoría, proveedor, costos, precios). Integrado en SpaceProductsDialog, project-budget, catalog page y add-item-dialog. Las imágenes son clickeables en todos los lugares donde se muestran productos.

- [x] **Delete Notes:** Las notas deben poder eliminarse. **RESUELTO:** Se añadió botón de eliminar en cada nota con confirmación y política RLS para delete.

- [x] **Archive Notes:** Las notas tendrán todas un check para marcar si ya se pueden archivar. Mostrando siempre primero las no archivadas. Las archivadas estarán en un tono más claro, para que no destaquen tanto. **RESUELTO:** Se añadió campo `archived` a la tabla, checkbox para archivar/desarchivar, ordenamiento (no archivadas primero), estilo con opacidad reducida para archivadas, y atajo de teclado Ctrl/Cmd + Enter para guardar notas.

- [x] **Product Reference URL:** Un producto debe tener una URL de referencia de donde se ha cogido la información. **RESUELTO:** Se añadió campo `reference_url` a la tabla `products` mediante migración. El campo está disponible en `product-dialog` y `add-item-dialog` (pestaña nuevo producto). Se muestra como enlace clickeable en `ProductDetailModal` cuando existe.

- [x] **Add Supplier from Product Form:** Se debe poder añadir un nuevo proveedor desde el formulario de nuevo producto, para facilitar la usabilidad. Que sea una opción de seleccionar o agregar nuevo y que al agregarlo quede seleccionado como el proveedor de ese producto. **RESUELTO:** Se añadió botón con icono de Plus junto al selector de proveedor en `product-dialog.tsx` y `add-item-dialog.tsx` (pestaña nuevo producto). Al crear un nuevo proveedor, se actualiza la lista y se selecciona automáticamente. Se modificó `SupplierDialog` para retornar el ID del proveedor creado en el callback `onSuccess`.

- [x] **Add Product from Space/Budget:** Se debe poder añadir un nuevo producto directamente desde el espacio o el presupuesto. Que no sea necesario ir a Catálogo para agregar el producto para luego volver al espacio o al presupuesto a agregarlo. **RESUELTO:** El `AddItemDialog` permite crear productos personalizados que se añaden automáticamente al catálogo. Funciona tanto desde `SpaceProductsDialog` como desde `project-budget.tsx`.

- [x] **Manageable Purchase Orders:** La orden de compra debe ser gestionable. Al crearla, se debe poder especificar los productos asociados a esa orden de compra, no se debe asumir que son todos los productos registrados hasta el momento. Por lo general estarán, al menos, generadas por proveedor. **RESUELTO:** Se creó `PurchaseOrderDialog` que permite crear y editar órdenes de compra con selección manual de ítems. Los ítems se filtran por proveedor y se pueden seleccionar mediante checkboxes. Se añadió funcionalidad de edición y eliminación de órdenes. La visualización muestra los ítems en una tabla con totales calculados. Se creó componente `Checkbox` para la UI.
