// /schemas/user-schemas/verifyCodeResetPasswordSchema.ts
import * as z from "zod";

export const verifyAccountResetPasswordSchema = z
    .object({
        code: z.string().length(6, { message: "Verification code must be 6 characters long" }).regex(/^[0-9]+$/, { message: "Verification code must contain only digits" })
    });
