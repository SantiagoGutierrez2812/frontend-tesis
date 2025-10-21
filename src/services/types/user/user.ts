export interface UserTransformed {
    id?: number;
    branch_id: number | string | null | undefined;
    branch_name?: string;
    name: string;
    document_id: string;
    email: string;
    phone_number: string;
    role: string;
    cargo: string;
    username: string;
    deleted_at: string | null;
}

export interface NewUserPayload {
    name: string;
    email: string;
    username: string;
    hashed_password: string;
    document_id: number;
    phone_number: number;
    role_id: number;
    branch_id: number;
}
