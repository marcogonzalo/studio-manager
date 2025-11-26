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
  end_date: string;
  client_id: string;
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
