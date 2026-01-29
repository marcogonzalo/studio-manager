export interface Client {
  id: string;
  full_name: string;
  email: string;
  phone: string;
  address: string;
}

export type ProjectPhase = 
  | 'diagnosis'      // Diagnóstico
  | 'design'         // Diseño
  | 'executive'      // Proyecto Ejecutivo
  | 'budget'         // Presupuestos
  | 'construction'   // Obra
  | 'delivery';      // Entrega

export interface Project {
  id: string;
  name: string;
  description: string;
  status: string;
  start_date: string;
  end_date: string | null;
  completed_date: string | null;
  client_id: string;
  address?: string;
  phase?: ProjectPhase;
  tax_rate?: number;
  client?: { full_name: string };
}

export interface Supplier {
  id: string;
  name: string;
  contact_name: string;
  email: string;
  phone: string;
  website: string;
}

export interface Product {
  id: string;
  name: string;
  description: string;
  reference_code: string;
  reference_url?: string;
  cost_price: number;
  image_url: string;
  category: string;
  supplier_id: string;
  supplier?: { name: string };
}

export interface Space {
  id: string;
  name: string;
  description: string;
}

export interface AdditionalCost {
  id: string;
  project_id: string;
  cost_type: string;
  description?: string;
  amount: number;
  created_at: string;
  user_id: string;
}

export type PaymentType = 
  | 'fees'              // Honorarios
  | 'purchase_provision' // Provisión de compras
  | 'additional_cost'   // Coste adicional
  | 'other';            // Otro

export interface Payment {
  id: string;
  project_id: string;
  user_id: string;
  amount: number;
  payment_date: string;
  reference_number?: string;
  description?: string;
  payment_type: PaymentType;
  purchase_order_id?: string;
  additional_cost_id?: string;
  phase?: ProjectPhase;
  created_at: string;
}

export interface PurchaseOrder {
  id: string;
  project_id?: string;
  supplier_id?: string;
  order_number?: string;
  order_date?: string;
  status?: string;
  notes?: string;
  delivery_deadline?: string;
  delivery_date?: string;
  user_id?: string;
  created_at: string;
}

// Budget Management Types
export type BudgetCategory = 
  | 'construction'       // Obra
  | 'own_fees'           // Honorarios Propios
  | 'external_services'  // Servicios Externos
  | 'operations';        // Gastos Operativos

export type ConstructionSubcategory =
  | 'demolition'         // Demolición
  | 'masonry'            // Albañilería
  | 'electricity'        // Electricidad
  | 'plumbing'           // Fontanería
  | 'interior_painting'  // Pintura Interior
  | 'exterior_painting'  // Pintura Exterior
  | 'domotics'           // Domótica
  | 'carpentry'          // Carpintería
  | 'locksmithing'       // Cerrajería
  | 'hvac'               // Climatización
  | 'flooring'           // Suelos y Pavimentos
  | 'tiling'             // Alicatados
  | 'other';             // Otros

export type OwnFeesSubcategory =
  | 'design'             // Diseño
  | 'executive_project'  // Proyecto Ejecutivo
  | 'site_supervision'   // Supervisión de Obra
  | 'management'         // Gestión y Coordinación
  | 'other';             // Otros

export type ExternalServicesSubcategory =
  | 'technical_architect' // Arquitecto Técnico
  | 'engineering'         // Ingenierías
  | 'logistics'           // Logística
  | 'permits'             // Gestión de Permisos
  | 'consulting'          // Consultoría
  | 'other';              // Otros

export type OperationsSubcategory =
  | 'shipping'           // Envío
  | 'packaging'          // Embalaje
  | 'transport'          // Transporte
  | 'storage'            // Almacenamiento
  | 'insurance'          // Seguros
  | 'customs'            // Aduanas
  | 'handling'           // Manipulación
  | 'other';             // Otros

export type BudgetSubcategory = 
  | ConstructionSubcategory 
  | OwnFeesSubcategory 
  | ExternalServicesSubcategory 
  | OperationsSubcategory;

export interface ProjectBudgetLine {
  id: string;
  project_id: string;
  category: BudgetCategory;
  subcategory: string;
  description?: string;
  estimated_amount: number;
  actual_amount: number;
  is_internal_cost: boolean;
  phase?: ProjectPhase;
  supplier_id?: string;
  supplier?: { name: string };
  notes?: string;
  user_id: string;
  created_at: string;
}
