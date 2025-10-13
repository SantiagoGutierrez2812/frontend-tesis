// types/UserLogin.ts
export interface UserLogin {
  id: number;
  app_user_id: number;
  created_at: string;
}

export interface AppUser {
  id: number;
  username: string;
  email: string;
  role: number;
  branch_id?: number;
}
export type UserLoginWithUser = {
  id: number;
  app_user_id: number;
  created_at: string;
  username: string;
  email?: string;
  role?: string;
};