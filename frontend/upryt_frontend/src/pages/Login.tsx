"use client"
import { useGoogleLogin } from '@react-oauth/google';
import { loginUser, loginUserWithGoogle, sendVerificationEmailForRegistration } from '../api/Api';
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { Link, useNavigate } from "react-router-dom"
import { motion } from "framer-motion"
import { Button } from "../components/ui/button"
import { Input } from "../components/ui/input"
import { Form, FormField, FormItem, FormLabel, FormControl, FormMessage } from "../components/ui/form"
import WidthWrapper from "../components/WidthWrapper"
import { FcGoogle } from "react-icons/fc"
import UprytLogo from '../assets/uprytwhite.png';
import { toast } from "sonner";
import { AxiosError } from "axios";
import { loginSchema } from "../schemas/auth/loginSchema";
import { useDispatch } from "react-redux";
import { loginSuccess } from "../redux/reducers/userSlice.ts";
import type { ApiResponse } from "../types/ApiResponse.ts";
import { useState } from "react";
import { FaEye, FaEyeSlash } from "react-icons/fa";
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter
} from "../components/ui/dialog";
import { Loader2 } from "lucide-react";
import { Label } from "../components/ui/label.tsx";


// const loginSchema = z.object({
//   email: z.string().email({ message: "Enter a valid email address" }),
//   password: z.string().min(6, { message: "Password must be at least 6 characters" }),
// })

export default function Login() {
  const navigate = useNavigate();
  const dispatch = useDispatch();

  // OTP dialog state
  const [dialogOpen, setDialogOpen] = useState(false);
  const [emailToVerify, setEmailToVerify] = useState("");
  const [code, setCode] = useState("");
  const [sendingCode, setSendingCode] = useState(false);

  // State to control password visibility
  const [showPassword, setShowPassword] = useState(false);
  const togglePasswordVisibility = () => setShowPassword((prev) => !prev);

  const form = useForm<z.infer<typeof loginSchema>>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      identifier: "",
      password: ""
    },
  })


  // Sign In
  const onSubmit = async (data: z.infer<typeof loginSchema>) => {
    try {
      const response = await loginUser(data);

      const { user } = response.data;

      if (user.isVerified) {
        toast.success('Login Successful', {
          description: response.data.message
        });
        dispatch(loginSuccess(response.data));
        navigate("/user/dashboard");
        return;
      }

      else {
        toast.warning('Account Not Verified', {
          description: 'Please verify your email to access your account.',
          action: {
            label: "Yes",
            onClick: () => {
              setEmailToVerify(user.email!);
              setDialogOpen(true);
            }
          }
        });
        return;
      }
    }
    catch (error) {
      console.error("Login Error:", error);
      const axiosError = error as AxiosError<ApiResponse>;
      let errorMessage = axiosError.response?.data.message;
      toast.error('Login failed', {
        description: errorMessage
      });
    }
  }

  const loginWithGoogle = useGoogleLogin({
    onSuccess: async (tokenResponse) => {
      try {
        const { data } = await loginUserWithGoogle(tokenResponse.access_token);
        toast.success("Logged in successfully");

        dispatch(loginSuccess(data));
        navigate("/user/dashboard");
      }
      catch (error) {
        console.error("Google Login Error:", error);
        toast.error("Google login failed");
      }
    },
    onError: () => {
      toast.error("Google login failed");
    },
  });

  const sendCode = async () => {
    setSendingCode(true);
    try {
      const response = await sendVerificationEmailForRegistration(emailToVerify);
      // const response = await axios.put("/api/auth/send-verification-email", {
      //   email: emailToVerify,
      // });
      toast.success(response.data.message);
      navigate(`/verify/${response.data.user.username}`);
    }
    catch (error) {
      const axiosError = error as AxiosError<ApiResponse>;
      toast.error(axiosError.response?.data.message || "Failed to send code");
    }
    finally {
      setSendingCode(false);
    }
  }


  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
      <WidthWrapper>
        <div className="flex justify-center w-full">
          <div className="bg-white rounded-lg shadow-lg w-full max-w-4xl flex h-[600px] overflow-hidden">
            {/* Left side: Login Form */}
            <div className="w-1/2 p-8 flex flex-col justify-center">
              <h2 className="text-2xl font-bold mb-2 text-gray-800">Welcome Back!</h2>
              <p className="text-sm text-gray-500 mb-6">Login to your UPRYT account</p>

              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
                  <FormField
                    control={form.control}
                    name="identifier"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Usernameor Email</FormLabel>
                        <FormControl>
                          <Input placeholder="Username or Email" {...field} />
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
                            <Input
                              type={showPassword ? "text" : "password"}
                              placeholder="Password" {...field}
                              className="w-full pr-10"
                            />
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

                  <div className="text-sm text-right">
                    <Link to="/forgotpassword" className="text-blue-950 hover:underline">Forgot Password?</Link>
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
                <Button onClick={() => loginWithGoogle()}
                  variant="outline" className="w-full flex items-center gap-2"
                >
                  <FcGoogle className="text-xl" />
                  Continue with Google
                </Button>
              </div>

              <p className="text-sm text-center mt-6 text-gray-500">
                Don't have an account? <Link to="/register" className="text-blue-950 hover:underline">Sign up</Link>
              </p>
            </div>

            {/* Right side: Info/Branding */}
            <div className="w-1/2 bg-blue-950 hidden md:flex items-center justify-center p-8">
              <motion.div
                initial={{ opacity: 0, y: 100 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 2, ease: "easeOut" }}
                className="flex flex-col items-center justify-center text-center space-y-4 mt-[-100px]"
              >
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
                  Say goodbye to slouching and hello to better posture—effortlessly.
                </p>
              </motion.div>
            </div>
          </div>
        </div>
      </WidthWrapper>

      {/* ─── VERIFY DIALOG ───────────────────────────────────── */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Verify Your Email</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label className="mb-2">Email</Label>
              <Input value={emailToVerify} onChange={(e) => setEmailToVerify(e.target.value)} />
            </div>
            <div className="flex gap-2">
              <Button
                onClick={sendCode}
                disabled={sendingCode}
                className="flex-1"
              >
                {sendingCode && <Loader2 className="animate-spin mr-2 h-4 w-4" />}
                Send Code
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
