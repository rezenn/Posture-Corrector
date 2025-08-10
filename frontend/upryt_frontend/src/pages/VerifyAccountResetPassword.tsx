"use client";
import { useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { AxiosError } from "axios";
import type { ApiResponse } from "../types/ApiResponse";
import * as z from "zod";
import { verifyAccountResetPasswordSchema } from './../schemas/auth/verifyAccountResetPasswordSchema.ts';
import { InputOTP, InputOTPGroup, InputOTPSlot } from "../components/ui/input-otp";
import { Button } from "../components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "../components/ui/form";;
import { useNavigate, useParams } from "react-router-dom"
import { verifyAccountForResetPassword } from '../api/Api.js';
import { Loader2 } from "lucide-react";

const VerifyAccountResetPassword = () => {
    const [isVerifying, setIsVerifying] = useState(false);
    const navigate = useNavigate();
    const params = useParams<{ email: string }>();

    const form = useForm<z.infer<typeof verifyAccountResetPasswordSchema>>({
        resolver: zodResolver(verifyAccountResetPasswordSchema),
        defaultValues: {
            code: ""
        }
    });

    const onSubmit = async (data: z.infer<typeof verifyAccountResetPasswordSchema>) => {
        setIsVerifying(true);
        try {
            const response = await verifyAccountForResetPassword({
                email: params.email,
                code: data.code
            });

            toast('Success', {
                description: response.data.message
            });

            navigate(`/reset-password/${params.email}`);
        }
        catch (error) {
            console.error("Error in verifying OTP", error);
            const axiosError = error as AxiosError<ApiResponse>;

            toast('Failed to verify OTP', {
                description: axiosError.response?.data.message
            });
        }
        finally {
            setIsVerifying(false);
        }
    };

    return (
        <div className="flex justify-center items-center min-h-screen bg-gray-100 px-4">
            <div className="w-full max-w-md p-8 bg-white rounded-lg shadow-md">
                <h1 className="text-2xl font-bold text-center mb-6">Enter Verification Code</h1>
                <p className="text-center text-sm text-gray-600 mb-6">
                    Please check your email for a 6-digit code.
                </p>
                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                        <FormField
                            name="code"
                            control={form.control}
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Email Address</FormLabel>
                                    <FormControl>
                                        <div className="flex justify-center mb-6">
                                            <InputOTP
                                                maxLength={6}
                                                value={field.value}
                                                onChange={field.onChange}
                                            >
                                                <InputOTPGroup>
                                                    {[...Array(6)].map((_, i) => (
                                                        <InputOTPSlot key={i} index={i} />
                                                    ))}
                                                </InputOTPGroup>
                                            </InputOTP>
                                        </div>
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <div className="flex items-center justify-center">
                            <Button type="submit" disabled={isVerifying} className="w-full">
                                {isVerifying ? (
                                    <>
                                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                        Verifying...
                                    </>
                                ) : (
                                    "Verify Code"
                                )}
                            </Button>
                        </div>
                    </form>
                </Form>
            </div>
        </div>
    );
};

export default VerifyAccountResetPassword;
