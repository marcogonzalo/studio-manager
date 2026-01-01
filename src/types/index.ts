export interface Client {
  id: string;
  full_name: string;
  email: string;
  phone: string;
  address: string;
}

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
