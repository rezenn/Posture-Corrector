"use client"
import { toast } from "sonner";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { AxiosError } from "axios";
import type { ApiResponse } from "../types/ApiResponse";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "../components/ui/form";
import { Input } from "../components/ui/input";
import { Button } from "../components/ui/button";
import { useNavigate, useParams } from "react-router-dom"
import { verifyAccountRegistrationSchema } from './../schemas/auth/verifyAccountRegistrationSchema.ts';
import { verifyAccountForRegistration } from './../api/Api.ts';


const VerifyAccountRegistration = () => {
    const navigate = useNavigate();
    const params = useParams<{ username: string }>();

    const form = useForm<z.infer<typeof verifyAccountRegistrationSchema>>({
        resolver: zodResolver(verifyAccountRegistrationSchema),
        defaultValues: {
            code: ""
        }
    });

    const onSubmit = async (data: z.infer<typeof verifyAccountRegistrationSchema>) => {
        try {
            const response = await verifyAccountForRegistration({
                username: params.username,
                code: data.code
            });

            toast.success('Success', {
                description: response.data.message
            });

            navigate("/login");
        }
        catch (error) {
            console.error("Error in verifying user", error);
            const axiosError = error as AxiosError<ApiResponse>;

            toast.error('Verify user failed', {
                description: axiosError.response?.data.message
            });
        }

    }

    return (
        <div className="flex justify-center items-center min-h-screen bg-gray-100">
            <div className="w-full max-w-md p-8 space-y-8 bg-white rounded-lg shadow-md">
                <div className="text-center">
                    <h1 className="text-4xl font-extrabold tracking-tight lg:text-5xl mb-6">
                        Verify Your Account
                    </h1>
                    <p className="mb-4">
                        Enter the verification code sent to your email
                    </p>
                </div>
                <div>
                    <Form {...form}>
                        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                            <FormField
                                name="code"
                                control={form.control}
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Verification Code</FormLabel>
                                        <FormControl>
                                            <Input placeholder="Enter the code" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <div className="flex items-center justify-center">
                                <Button type="submit" className="cursor-pointer">Submit</Button>
                            </div>
                        </form>
                    </Form>
                </div>
            </div>
        </div>
    );
};

export default VerifyAccountRegistration;
