import { getSupabaseClient } from "@/lib/supabase/client";

/**
 * Comprueba si una tabla tiene filas con la columna = value.
 * @returns true si no hay filas (y no hay error); false si hay filas o hay error (seguridad: no permitir borrar).
 */
async function tableHasNoRows(
  table: string,
  column: string,
  value: string,
  logContext: string
): Promise<boolean> {
  try {
    const supabase = getSupabaseClient();
    const { data, error } = await supabase
      .from(table)
      .select("id")
      .eq(column, value)
      .limit(1);

    if (error) {
      console.error(logContext, error);
      return false;
    }
    return !(data && data.length > 0);
  } catch (err) {
    console.error(`Error in tableHasNoRows(${table}):`, err);
    return false;
  }
}

/**
 * Verifica si un proveedor puede ser eliminado.
 * Un proveedor NO puede ser eliminado si:
 * - Tiene productos asociados
 * - Tiene órdenes de compra asociadas
 */
export async function canDeleteSupplier(supplierId: string): Promise<boolean> {
  const noProducts = await tableHasNoRows(
    "products",
    "supplier_id",
    supplierId,
    "Error checking products for supplier:"
  );
  if (!noProducts) return false;

  const noOrders = await tableHasNoRows(
    "purchase_orders",
    "supplier_id",
    supplierId,
    "Error checking purchase orders for supplier:"
  );
  return noOrders;
}

/**
 * Verifica si un producto puede ser eliminado.
 * Un producto NO puede ser eliminado si:
 * - Está asociado a algún project_item
 */
export async function canDeleteProduct(productId: string): Promise<boolean> {
  return tableHasNoRows(
    "project_items",
    "product_id",
    productId,
    "Error checking project items for product:"
  );
}

/**
 * Verifica si un cliente puede ser eliminado.
 * Un cliente NO puede ser eliminado si:
 * - Tiene proyectos asociados
 */
export async function canDeleteClient(clientId: string): Promise<boolean> {
  return tableHasNoRows(
    "projects",
    "client_id",
    clientId,
    "Error checking projects for client:"
  );
}
