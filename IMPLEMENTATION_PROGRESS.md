# Progreso de Implementación: Planes SaaS

## Estado: Fase 1 Completada (Backend + Frontend Core)

### ✅ Completado

#### Backend (Migraciones y Base de Datos)
- [x] Tabla `account_settings` creada y datos migrados desde `profiles`
- [x] Homologación `plan_feature_modality`: none, basic, full
- [x] Nuevos campos en `plans`: `storage_limit_mb`, `support_level`
- [x] Seeds actualizados: BASE (1 activo, 500MB), PRO (5, 10GB), STUDIO (50, 100GB)
- [x] Columnas `extra_active_projects` y `extra_storage_mb` en `plan_assignments` (default 0)
- [x] `get_effective_plan` actualizado con límites efectivos
- [x] `assign_plan` RPC actualizado con nuevos campos
- [x] Tabla `user_storage_usage` (snapshot) creada
- [x] Columna `file_size_bytes` añadida a `project_documents`
- [x] Estados de proyecto: sin draft, añadido cancelled, default active
- [x] Migración draft → active en proyectos existentes
- [x] Trigger de límite de proyectos activos (cuenta solo status='active')

#### Frontend (Tipos y UI Core)
- [x] Tipos TypeScript: PlanConfig, AccountSettings, ProjectStatus
- [x] `useProfileDefaults` usando `account_settings`
- [x] Página de personalización usando `account_settings`
- [x] Presupuesto PDF usando `account_settings`
- [x] project-dialog: sin draft, con cancelled, confirmaciones para completed/cancelled
- [x] Pricing page actualizada con nuevos límites y características
- [x] Settings > Plan: proyectos activos + almacenamiento con formatBytes

### 🚧 Pendiente (Fase 2)

#### APIs de Upload y Storage Enforcement
- [ ] Actualizar `/api/upload/space-image` para comprobar límite y actualizar snapshot
- [ ] Actualizar `/api/upload/product-image` para comprobar límite y actualizar snapshot
- [ ] Actualizar `/api/upload/document` para comprobar límite y actualizar snapshot
- [ ] Actualizar flujos de borrado para decrementar snapshot
- [ ] Guardar `file_size_bytes` en cada upload

#### Modo Solo Lectura (Completed/Cancelled)
- [ ] Detectar status en vista de detalle de proyecto
- [ ] Deshabilitar/ocultar botones de edición en todas las secciones:
  - [ ] Espacios y renders
  - [ ] Productos/partidas de presupuesto
  - [ ] Costes adicionales
  - [ ] Órdenes de compra
  - [ ] Pagos
  - [ ] Documentos
  - [ ] Notas
- [ ] Mostrar mensaje informativo de "Proyecto en modo solo lectura"

#### Vista de Listado de Proyectos
- [ ] Orden por defecto: Activos → Completados → Cancelados (alfabético dentro de cada grupo)
- [ ] Filtro por estado (Todos, Activos, Completados, Cancelados)
- [ ] Opciones de ordenamiento:
  - [ ] Por estado (default)
  - [ ] Por fecha de creación
  - [ ] Por fecha de cierre

#### Testing y Verificación
- [ ] Probar creación de proyectos con límite activo
- [ ] Probar cambio de estado con confirmaciones
- [ ] Probar upload con límite de almacenamiento
- [ ] Verificar modo solo lectura en completed/cancelled
- [ ] Verificar visualización de uso en Settings > Plan

### 📝 Notas

- **Add-ons/Extensiones**: Diferidos - columnas y lógica en 0 por defecto
- **Límites clientes/proveedores/productos**: Diferidos - mostrados en UI pero no enforced
- **Migraciones**: Todas aplicadas y funcionando en local
- **Build**: Compilación exitosa sin errores TypeScript

### 🔄 Próximos Pasos Sugeridos

1. Implementar enforcement de almacenamiento en APIs de upload
2. Implementar modo solo lectura completo en proyectos
3. Implementar vista de listado con orden y filtros
4. Testing manual de todos los flujos
5. Documentar cambios en memoria-bank/progress.md
