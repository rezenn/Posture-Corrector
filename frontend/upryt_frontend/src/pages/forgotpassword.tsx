"use client"

import { useForm } from "react-hook-form"
import { Link, useNavigate } from "react-router-dom"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { Button } from "../components/ui/button"
import { Input } from "../components/ui/input"
import { Form, FormField, FormItem, FormLabel, FormControl, FormMessage } from "../components/ui/form"
import WidthWrapper from "../components/WidthWrapper"
import UprytLogo from '../assets/uprytwhite.png'
import { forgotPassword } from "../api/Api"
import { toast } from "sonner"
import type { AxiosError } from "axios"
import type { ApiResponse } from "../types/ApiResponse"
import { useState } from "react"
import { Loader2 } from "lucide-react"


const forgotSchema = z.object({
  email: z.string().email({ message: "Enter a valid email address" }),
})

export default function ForgotPassword() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const navigate = useNavigate();
  const form = useForm<z.infer<typeof forgotSchema>>({
    resolver: zodResolver(forgotSchema),
    defaultValues: {
      email: "",
    },
  })

  const onSubmit = async (data: z.infer<typeof forgotSchema>) => {
    setIsSubmitting(true);
    try {
      const response = await forgotPassword({
        email: data.email
      });
      toast.success('Success', {
        description: response.data.message
      });

      navigate(`/verify-account-reset-password/${data.email}`);
    }
    catch (error) {
      console.error("Error sending forgot password request", error);
      const axiosError = error as AxiosError<ApiResponse>;
      toast("Failed", {
        description: axiosError.response?.data.message || "Failed to send reset instructions",
      });
    }
    finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
      <WidthWrapper>
        <div className="flex justify-center w-full">
          <div className="bg-white rounded-lg shadow-lg w-full max-w-4xl h-[600px] flex overflow-hidden">
            {/* Left side: Forgot Password Form */}
            <div className="w-1/2 p-8 flex flex-col justify-center">
              <h2 className="text-2xl font-bold mb-2 text-gray-800">Forgot Password?</h2>
              <p className="text-sm text-gray-500 mb-6">
                No worries, we’ll send you reset instructions.
              </p>

              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
                  <FormField
                    control={form.control}
                    name="email"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Email</FormLabel>
                        <FormControl>
                          <Input type="email" placeholder="example@email.com" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <div className="flex items-center justify-center">
                    <Button type="submit" disabled={isSubmitting} className="w-full">
                      {isSubmitting ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Sending...
                        </>
                      ) : (
                        "Reset Password"
                      )}
                    </Button>
                  </div>
                </form>
              </Form>

              <p className="text-sm text-center mt-6 text-gray-500">
                <Link to="/login" className="text-blue-950 hover:underline">Back to log in</Link>
              </p>
            </div>

            {/* Right side: Info/Branding */}
            <div className="w-1/2 bg-blue-950 hidden md:flex items-center justify-center p-8">
              <div className="flex flex-col items-center justify-center text-center space-y-4 mt-[-100px]">
                <img
                  src={UprytLogo}
                  alt="Upryt Logo"
                  className="w-30 h-30 object-contain"
                />
                <p className="text-white font-semibold text-xl">
                  The New Standard in Workplace Wellness.
                </p>
                <p className="text-white text-sm">
                  UPRYT helps you correct your sitting posture in real-time using AI.
                  Say goodbye to slouching and hello to better health—effortlessly.
                </p>
              </div>
            </div>
          </div>
        </div>
      </WidthWrapper>
    </div>
  )
}
