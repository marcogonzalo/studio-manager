-- Rename plan display name from "Prueba" to "Base" (plan code remains BASE)
update plans
set name = 'Base', updated_at = now()
where code = 'BASE';
