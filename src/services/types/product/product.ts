export interface product_id_record {
  name: string;
  size: string;
  price: number;        // ✅ antes era string, ahora debe ser number
  description: string;
  is_active?: boolean;
}
