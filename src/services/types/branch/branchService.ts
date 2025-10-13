export interface Branch {
    address: string;
    company_id: number;
    created_at: string;
    deleted_at: string | null;
    email: string;
    id: number;
    is_active: boolean;
    name: string; 
    phone_number: string;
    updated_at: string;

}

export interface BranchesResponse {
    ok: boolean;
    branches: Branch[];
}
