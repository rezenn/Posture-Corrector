"use client"

import { useForm } from "react-hook-form"
import { Link } from "react-router-dom"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { Button } from "../components/ui/button"
import { Input } from "../components/ui/input"
import { Form, FormField, FormItem, FormLabel, FormControl, FormMessage } from "../components/ui/form"
import WidthWrapper from "../components/WidthWrapper"
import UprytLogo from '../assets/uprytwhite.png'


const forgotSchema = z.object({
  email: z.string().email({ message: "Enter a valid email address" }),
})

export default function ForgotPassword() {
  const form = useForm<z.infer<typeof forgotSchema>>({
    resolver: zodResolver(forgotSchema),
    defaultValues: {
      email: "",
    },
  })

  function onSubmit(values: z.infer<typeof forgotSchema>) {
    console.log("Reset Request Sent To:", values.email)
    // Handle password reset request logic here
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

                  <Button type="submit" className="w-full bg-blue-950">
                    Reset Password
                  </Button>
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
