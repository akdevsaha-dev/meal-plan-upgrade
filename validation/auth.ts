import { z } from "zod";

export const RegisterSchema = z.object({
  name: z
    .string({ error: "Name is required" })
    .trim()
    .min(1, "Name cannot be empty")
    .max(100, "Name must be at most 100 characters"),

  email: z
    .string({ error: "Email is required" })
    .trim()
    .toLowerCase()
    .email("Must be a valid email address")
    .max(255, "Email must be at most 255 characters"),

  password: z
    .string({ error: "Password is required" })
    .min(8, "Password must be at least 8 characters")
    .max(128, "Password must be at most 128 characters"),
});

export const LoginSchema = z.object({
  email: z
    .string({ error: "Email is required" })
    .trim()
    .toLowerCase()
    .email("Must be a valid email address"),

  password: z
    .string({ error: "Password is required" })
    .min(1, "Password cannot be empty"),
});

export const ForgotPasswordSchema = z.object({
  email: z
    .string({ error: "Email is required" })
    .trim()
    .toLowerCase()
    .email("Must be a valid email address")
    .max(255, "Email must be at most 255 characters"),
});

export const ResetPasswordSchema = z.object({
  password: z
    .string({ error: "Password is required" })
    .min(8, "Password must be at least 8 characters")
    .max(128, "Password must be at most 128 characters"),
  confirmPassword: z
    .string({ error: "Confirm password is required" }),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords do not match",
  path: ["confirmPassword"],
});

export type RegisterInput = z.infer<typeof RegisterSchema>;
export type LoginInput = z.infer<typeof LoginSchema>;
export type ForgotPasswordInput = z.infer<typeof ForgotPasswordSchema>;
export type ResetPasswordInput = z.infer<typeof ResetPasswordSchema>;
