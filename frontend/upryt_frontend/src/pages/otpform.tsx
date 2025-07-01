"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import { Input } from "../components/ui/input";
import { Button } from "../components/ui/button";
import {
  Form,
  FormField,
  FormItem,
  FormControl,
  FormMessage,
} from "../components/ui/form";
import { useRef, useState } from "react";

const otpSchema = z.object({
  otp: z
    .string()
    .length(6, { message: "OTP must be exactly 6 digits" })
    .regex(/^\d+$/, { message: "OTP must contain only digits" }),
});

type OtpFormValues = z.infer<typeof otpSchema>;

export default function OtpForm() {
  const form = useForm<OtpFormValues>({
    resolver: zodResolver(otpSchema),
    defaultValues: {
      otp: "",
    },
  });

  const [otpArray, setOtpArray] = useState<string[]>(Array(6).fill(""));
  const [isSubmitting, setIsSubmitting] = useState(false);
  const inputRefs = useRef<(HTMLInputElement | null)[]>(Array(6).fill(null));

  const handleChange = (value: string, index: number) => {
    if (!/^\d?$/.test(value)) return; // Allow only single digit or empty

    const newOtpArray = [...otpArray];
    newOtpArray[index] = value;
    setOtpArray(newOtpArray);
    form.setValue("otp", newOtpArray.join(""), { shouldValidate: true });

    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (
    e: React.KeyboardEvent<HTMLInputElement>,
    index: number
  ) => {
    if (e.key === "Backspace" && !otpArray[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handlePaste = (e: React.ClipboardEvent<HTMLInputElement>, index: number) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData("text").trim();
    if (!/^\d{1,6}$/.test(pastedData)) return;

    const newOtpArray = Array(6).fill("");
    pastedData.split("").forEach((char, i) => {
      if (i < 6) newOtpArray[i] = char;
    });
    setOtpArray(newOtpArray);
    form.setValue("otp", newOtpArray.join(""), { shouldValidate: true });

    // Focus the last filled input or the last input
    const lastFilledIndex = Math.min(pastedData.length - 1, 5);
    inputRefs.current[lastFilledIndex]?.focus();
  };

  const onSubmit = async (values: OtpFormValues) => {
    setIsSubmitting(true);
    try {
      // Simulate API call for OTP verification
      await new Promise((resolve) => setTimeout(resolve, 1000));
      toast.success("OTP Verified Successfully");
      console.log("Entered OTP:", values.otp);
      form.reset();
      setOtpArray(Array(6).fill(""));
      inputRefs.current[0]?.focus();
    } catch (error) {
      toast.error("Failed to verify OTP. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100 px-4">
      <div className="bg-white rounded-2xl shadow-xl p-6 sm:p-8 w-full max-w-md">
        <h2 className="text-xl sm:text-2xl font-semibold text-center mb-6 text-gray-800">
          Enter the 6-digit OTP
        </h2>

        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(onSubmit)}
            className="flex flex-col items-center space-y-6"
            aria-label="OTP Verification Form"
          >
            <FormField
              control={form.control}
              name="otp"
              render={({ field }) => (
                <FormItem>
                  <div className="flex justify-center gap-2 sm:gap-3">
                    {[...Array(6)].map((_, i) => (
                      <FormControl key={i}>
                        <Input
                          maxLength={1}
                          inputMode="numeric"
                          autoComplete="one-time-code"
                          aria-label={`OTP digit ${i + 1}`}
                          className="w-10 sm:w-12 h-12 sm:h-14 text-center text-lg sm:text-xl font-semibold border border-gray-300 rounded-md shadow-sm focus:ring-2 focus:ring-blue-400 focus:outline-none transition-all duration-150"
                          value={otpArray[i] || ""}
                          onChange={(e) => handleChange(e.target.value, i)}
                          onKeyDown={(e) => handleKeyDown(e, i)}
                          onPaste={(e) => handlePaste(e, i)}
                          ref={(el) => (inputRefs.current[i] = el)}
                          disabled={isSubmitting}
                        />
                      </FormControl>
                    ))}
                  </div>
                  <FormMessage className="text-red-500 mt-2 text-sm text-center" />
                </FormItem>
              )}
            />
            <Button
              type="submit"
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 rounded-lg transition-all duration-150"
              disabled={isSubmitting}
            >
              {isSubmitting ? "Verifying..." : "Verify OTP"}
            </Button>
          </form>
        </Form>
      </div>
    </div>
  );
}