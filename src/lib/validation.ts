import { getSupabaseClient } from "@/lib/supabase/client";

/**
 * Verifica si un proveedor puede ser eliminado.
 * Un proveedor NO puede ser eliminado si:
 * - Tiene productos asociados
 * - Tiene órdenes de compra asociadas
 */
export async function canDeleteSupplier(supplierId: string): Promise<boolean> {
  try {
    const supabase = getSupabaseClient();

    // Verificar si hay productos asociados
    const { data: products, error: productsError } = await supabase
      .from("products")
      .select("id")
      .eq("supplier_id", supplierId)
      .limit(1);

    if (productsError) {
      console.error("Error checking products for supplier:", productsError);
      return false; // En caso de error, no permitir eliminación por seguridad
    }

    if (products && products.length > 0) {
      return false;
    }

    // Verificar si hay órdenes de compra asociadas
    const { data: purchaseOrders, error: poError } = await supabase
      .from("purchase_orders")
      .select("id")
      .eq("supplier_id", supplierId)
      .limit(1);

    if (poError) {
      console.error("Error checking purchase orders for supplier:", poError);
      return false; // En caso de error, no permitir eliminación por seguridad
    }

    if (purchaseOrders && purchaseOrders.length > 0) {
      return false;
    }

    return true;
  } catch (error) {
    console.error("Error in canDeleteSupplier:", error);
    return false; // En caso de error, no permitir eliminación por seguridad
  }
}

/**
 * Verifica si un producto puede ser eliminado.
 * Un producto NO puede ser eliminado si:
 * - Está asociado a algún project_item
 */
export async function canDeleteProduct(productId: string): Promise<boolean> {
  try {
    const supabase = getSupabaseClient();

    // Verificar si hay project_items asociados
    const { data: projectItems, error: itemsError } = await supabase
      .from("project_items")
      .select("id")
      .eq("product_id", productId)
      .limit(1);

    if (itemsError) {
      console.error("Error checking project items for product:", itemsError);
      return false; // En caso de error, no permitir eliminación por seguridad
    }

    if (projectItems && projectItems.length > 0) {
      return false;
    }

    return true;
  } catch (error) {
    console.error("Error in canDeleteProduct:", error);
    return false; // En caso de error, no permitir eliminación por seguridad
  }
}

/**
 * Verifica si un cliente puede ser eliminado.
 * Un cliente NO puede ser eliminado si:
 * - Tiene proyectos asociados
 */
export async function canDeleteClient(clientId: string): Promise<boolean> {
  try {
    const supabase = getSupabaseClient();

    // Verificar si hay proyectos asociados
    const { data: projects, error: projectsError } = await supabase
      .from("projects")
      .select("id")
      .eq("client_id", clientId)
      .limit(1);

    if (projectsError) {
      console.error("Error checking projects for client:", projectsError);
      return false; // En caso de error, no permitir eliminación por seguridad
    }

    if (projects && projects.length > 0) {
      return false;
    }

    return true;
  } catch (error) {
    console.error("Error in canDeleteClient:", error);
    return false; // En caso de error, no permitir eliminación por seguridad
  }
}
