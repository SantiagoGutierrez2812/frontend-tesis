export interface Proveedor {
    id: number;
    name: string;
    nit: string;
    email: string;
    contact_name: string;
    phone_number: string;
    address: string;
    description: string;
    city?: string;
}