"use client"

import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { Button } from "../components/ui/button"
import { Input } from "../components/ui/input"
import { Form, FormField, FormItem, FormLabel, FormControl, FormMessage } from "../components/ui/form"
import WidthWrapper from "../components/WidthWrapper"
import { FcGoogle } from "react-icons/fc"
import { FaApple } from "react-icons/fa"
import UprytLogo from '../assets/uprytwhite.png'; // adjust path as needed


const loginSchema = z.object({
  email: z.string().email({ message: "Enter a valid email address" }),
  password: z.string().min(6, { message: "Password must be at least 6 characters" }),
})

export default function Login() {
  const form = useForm<z.infer<typeof loginSchema>>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  })

  function onSubmit(values: z.infer<typeof loginSchema>) {
    console.log("Login Data:", values)
    // Add your login logic here
  }

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
      <WidthWrapper>
        <div className="flex justify-center w-full">
        <div className="bg-white rounded-lg shadow-lg w-full max-w-4xl flex overflow-hidden">
          {/* Left side: Login Form */}
          <div className="w-1/2 p-8 flex flex-col justify-center">
            <h2 className="text-2xl font-bold mb-2 text-gray-800">Welcome Back!</h2>
            <p className="text-sm text-gray-500 mb-6">Login to your UPRYT account</p>

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

                <FormField
                  control={form.control}
                  name="password"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Password</FormLabel>
                      <FormControl>
                        <Input type="password" placeholder="Enter your password" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="text-sm text-right">
                  <a href="#" className="text-blue-600 hover:underline">Forgot Password?</a>
                </div>

                <Button type="submit" className="w-full bg-blue-950">
                  Login
                </Button>
              </form>
            </Form>

            <div className="my-4 flex items-center justify-between">
              <hr className="w-full border-gray-300" />
              <span className="px-2 text-gray-400 text-sm">OR</span>
              <hr className="w-full border-gray-300" />
            </div>

            <div className="flex flex-col gap-3">
              <Button variant="outline" className="w-full flex items-center gap-2">
                <FcGoogle className="text-xl" />
                Continue with Google
              </Button>
              <Button variant="outline" className="w-full flex items-center gap-2">
                <FaApple className="text-xl" />
                Continue with Apple
              </Button>
            </div>

            <p className="text-sm text-center mt-6 text-gray-500">
              Don't have an account? <a href="#" className="text-blue-600 hover:underline">Sign up</a>
            </p>
          </div>

          {/* Right side: Info/Branding */}
        <div className="w-1/2 bg-blue-950 hidden md:flex items-center justify-center p-8">
        <div className="flex flex-col items-center justify-center text-center space-y-4 mt-[-100px]">
            <img
            src={UprytLogo} alt="Upryt Logo"
            className="w-30 h-30 object-contain"/>
            <p className="text-white font-semibold text-xl">The New Standard in Workplace Wellness.</p>
            <p className="text-white font-small">
            UPRYT helps you correct your sitting posture in real-time using AI.
            Say goodbye to slouching and hello to better health-effortlessly.
            </p>
        </div>
        </div>

        </div>
        </div>
      </WidthWrapper>
    </div>
  )
}
