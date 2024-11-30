import { z } from "zod";

export interface User {
  id: number,
  email: string,
  firstName: string,
  lastName: string,
  birthday: Date,
  location: string,
  createdAt: Date,
  updatedAt: Date,
}

export interface SaveUser {
  email: string,
  firstName: string,
  lastName: string,
  birthday: Date,
  location: string,
}

export const SaveUserSchema = z.object({
  email: z.string().email(),
  firstName: z.string(),
  lastName: z.string(),
  birthday: z.coerce.date(),
  location: z.string(),
});
