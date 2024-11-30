import {z} from "zod";

export interface SendEmail {
  email: string,
  message: string,
}

export const SendEmailSchema = z.object({
  email: z.string().email(),
  message: z.string(),
});
