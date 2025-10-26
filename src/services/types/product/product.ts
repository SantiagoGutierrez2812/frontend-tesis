export interface product_id_record {
  id?: number;          // <-- agrega esto
  name: string;
  size: string;
  price: number;
  description: string;
  is_active?: boolean;
}
