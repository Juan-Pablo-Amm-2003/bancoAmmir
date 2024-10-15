// types.ts
export interface UserRequest {
  username: string;
  DNI: string;
  pass: string;
}

export interface UserResponse {
  id: number;
  username: string;
  DNI: string;
  createdAt: Date;
  updatedAt: Date;
}
