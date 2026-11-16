import { api } from "@/shared/api/client";
import type { User } from "@/shared/types/api";

export interface RegisterData {
  username: string;
  full_name: string;
  email: string;
  password: string;
}

export async function registerUser(data: RegisterData): Promise<User> {
  const res = await api.post<User>("/auth/register", data);
  return res.data;
}