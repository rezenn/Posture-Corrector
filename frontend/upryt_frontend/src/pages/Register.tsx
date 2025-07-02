"use client"
import WidthWrapper from '../components/WidthWrapper'
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { z } from "zod"
import { toast } from "sonner"
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '../components/ui/form';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { FcGoogle } from "react-icons/fc";
import UprytLogo from '../assets/uprytwhite.png'; // Keep image path unchanged
import { signUpSchema } from "../schemas/auth/signUpSchema";
import { useEffect, useState } from "react";
import { useDebounceCallback } from "usehooks-ts";
import { registerUser, validateUsernameUnique } from "../apis/Api";
import type { AxiosError } from "axios";
import type { ApiResponse } from "../types/ApiResponse";
import { Loader2 } from 'lucide-react';
import { FaEye, FaEyeSlash } from "react-icons/fa"
import { useNavigate } from "react-router-dom"


export default function Register() {
  const [username, setUsername] = useState("");
  const [usernameMessage, setUsernameMessage] = useState("");
  const [isCheckingUsername, setIsCheckingUsername] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const debounced = useDebounceCallback(setUsername, 300);
  const navigate = useNavigate();

  const form = useForm<z.infer<typeof signUpSchema>>({
    resolver: zodResolver(signUpSchema),
    defaultValues: {
      fullName: "",
      username: "",
      contact: "",
      email: "",
      password: "",
      confirmPassword: "",
    },
  })

  const [showPassword, setShowPassword] = useState(false);
  const togglePasswordVisibility = () => setShowPassword((prev) => !prev);

  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const toggleConfirmPasswordVisibility = () => setShowConfirmPassword((prev) => !prev);

  useEffect(() => {
    const checkUsernameUnique = async () => {
      if (username) {
        setIsCheckingUsername(true);
        setUsernameMessage("");
        try {
          const response = await validateUsernameUnique(username);
          console.log("Username check response:", response.data);
          setUsernameMessage(response.data.message);
        }
        catch (error) {
          const axiosError = error as AxiosError<ApiResponse>;
          setUsernameMessage(axiosError.response?.data.message ?? "Error checking username!");
        }
        finally {
          setIsCheckingUsername(false);
        }
      }
    }
    checkUsernameUnique();
  }, [username]);

  // function onSubmit(values: z.infer<typeof signUpSchema>) {
  //   console.log("Submitting...")
  //   console.log("Registration Data:", values)
  //   toast.success("Registered successfully!")
  // }

  const onSubmit = async (data: z.infer<typeof signUpSchema>) => {
    setIsSubmitting(true);

    try {
      const response = await registerUser(data);

      toast.success('Success', {
        description: response.data.message
      });

      navigate(`/verify/${username}`);
      // router.replace(`/verify/${username}`);
    }
    catch (error) {
      console.error("Error in sign up of user", error);
      const axiosError = error as AxiosError<ApiResponse>;

      let errorMessage = axiosError.response?.data.message;
      toast.error('Sign Up failed', {
        description: errorMessage
      });
    }
    finally {
      setIsSubmitting(false);
    }
  }



  return (
    <>
      <WidthWrapper>
        <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
          <div className="flex justify-center w-full">
            <div className="bg-white rounded-lg shadow-lg w-full max-w-4xl flex overflow-hidden">

              {/* Left: Register Form */}
              <div className="w-1/2 p-8 flex flex-col justify-center">
                <h2 className="text-2xl font-bold mb-2 text-gray-800">Join UPRYT Today!</h2>
                <p className="text-sm text-gray-500 mb-6">Create your account to get started</p>

                <Form {...form}>
                  <form
                    onSubmit={form.handleSubmit(onSubmit, () => toast.error("Please fill out all fields correctly"))}
                    className="space-y-5"
                  >
                    <FormField
                      control={form.control}
                      name="fullName"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Full Name</FormLabel>
                          <FormControl>
                            <Input placeholder="Full Name" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      name="username"
                      control={form.control}
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Username</FormLabel>
                          <FormControl>
                            <Input
                              placeholder="Username" {...field}
                              onChange={(e) => {
                                field.onChange(e)
                                debounced(e.target.value)
                              }}
                            />
                          </FormControl>
                          {isCheckingUsername && <Loader2 className="animate-spin" />}
                          <p className={`text-sm ${usernameMessage === "Username is available" ? "text-green-500" : "text-red-500"}`}>
                            {usernameMessage}
                          </p>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      name="contact"
                      control={form.control}
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Contact</FormLabel>
                          <FormControl>
                            <Input placeholder="Contact" {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
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
                          <div className="relative">
                            <FormControl>
                              <Input type={showPassword ? "text" : "password"} placeholder="Enter password" {...field} />
                            </FormControl>
                            <button
                              type="button"
                              onClick={togglePasswordVisibility}
                              className="cursor-pointer absolute inset-y-0 end-2.5 z-20 text-gray-400  focus:outline-hidden focus:text-blue-600 dark:text-neutral-600 dark:focus:text-blue-500"
                            >
                              {showPassword ? <FaEye size={18} /> : <FaEyeSlash size={18} />}
                            </button>
                          </div>

                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="confirmPassword"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Confirm Password</FormLabel>
                          <div className="relative">
                            <FormControl>
                              <Input type={showConfirmPassword ? "text" : "password"} placeholder="Confirm Password" {...field} />
                            </FormControl>
                            <button
                              type="button"
                              onClick={toggleConfirmPasswordVisibility}
                              className="cursor-pointer absolute inset-y-0 end-2.5 z-20 text-gray-400  focus:outline-hidden focus:text-blue-600 dark:text-neutral-600 dark:focus:text-blue-500"
                            >
                              {showConfirmPassword ? <FaEye size={18} /> : <FaEyeSlash size={18} />}
                            </button>
                          </div>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <Button type="submit" disabled={isSubmitting} className="w-full bg-blue-950">
                      {/* Register */}
                      {isSubmitting ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Please wait
                        </>
                      ) : (
                        "Register"
                      )}
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
                    Sign up with Google
                  </Button>
                </div>

                <p className="text-sm text-center mt-6 text-gray-500">
                  Already have an account?{" "}
                  <a href="/login" className="text-blue-950 hover:underline">Login</a>
                </p>
              </div>

              {/* Right: Branding */}
              <div className="w-1/2 bg-blue-950 hidden md:flex items-center justify-center p-8">
                <div className="flex flex-col items-center justify-center text-center space-y-4 mt-[-100px]">
                  <img
                    src={UprytLogo}
                    alt="Upryt Logo"
                    className="w-30 h-30 object-contain"
                  />
                  <p className="text-white font-semibold text-xl">The New Standard in Workplace Wellness.</p>
                  <p className="text-white font-small">
                    UPRYT helps you correct your sitting posture in real-time using AI.
                    Say goodbye to slouching and hello to better health—effortlessly.
                  </p>
                </div>
              </div>

            </div>
          </div>
        </div>
      </WidthWrapper>
    </>
  )
}
