import { useState } from "react";
import Button from "../components/common_components/Button";
import Input from "../components/common_components/Input";
import bgImage from "../assets/AuthBackgroundImg.jpg";
import { Link, useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  useForgotPasswordMutation,
  useVerifyOtpMutation,
} from "../redux/api/authApi";
import { getApiErrorMessage } from "../redux/utils/apiError";

const emailSchema = z.object({
  email: z
    .string()
    .trim()
    .min(1, "Email address is required.")
    .email("Enter a valid email address."),
});

const otpSchema = z.object({
  otp: z
    .string()
    .trim()
    .min(1, "OTP is required.")
    .max(6, "OTP cannot exceed 6 digits."),
});

type EmailFormValues = z.infer<typeof emailSchema>;
type OtpFormValues = z.infer<typeof otpSchema>;

const PANEL_ROLE = import.meta.env.VITE_APP_ROLE || "account";

function ForgotPassword() {
  const navigate = useNavigate();
  const [step, setStep] = useState<"request" | "verify">("request");
  const [submittedEmail, setSubmittedEmail] = useState("");
  const [successMsg, setSuccessMsg] = useState("");

  const [forgotPassword] = useForgotPasswordMutation();
  const [verifyOtp] = useVerifyOtpMutation();

  const {
    register: registerEmail,
    handleSubmit: handleEmailSubmit,
    setError: setEmailError,
    clearErrors: clearEmailErrors,
    formState: { errors: emailErrors, isSubmitting: isEmailSubmitting },
  } = useForm<EmailFormValues>({
    resolver: zodResolver(emailSchema),
    defaultValues: { email: "" },
  });

  const {
    register: registerOtp,
    handleSubmit: handleOtpSubmit,
    setError: setOtpError,
    clearErrors: clearOtpErrors,
    formState: { errors: otpErrors, isSubmitting: isOtpSubmitting },
  } = useForm<OtpFormValues>({
    resolver: zodResolver(otpSchema),
    defaultValues: { otp: "" },
  });

  const onRequestOtp = async (values: EmailFormValues) => {
    try {
      setSuccessMsg("");
      const res = await forgotPassword({
        email: values.email,
        role: PANEL_ROLE,
      }).unwrap();
      setSubmittedEmail(values.email);
      setSuccessMsg(res.message || "An OTP has been sent to your email.");
      setStep("verify");
    } catch (err) {
      setEmailError("root", { message: getApiErrorMessage(err, "Failed to send OTP. Please try again.") });
    }
  };

  const onVerifyOtp = async (values: OtpFormValues) => {
    try {
      setSuccessMsg("");
      const res = await verifyOtp({
        email: submittedEmail,
        otp: values.otp,
      }).unwrap();

      const resetToken = res.data?.resetToken;
      if (!resetToken) {
        setOtpError("root", { message: "Invalid OTP response received." });
        return;
      }

      navigate("/reset-password", {
        state: { resetToken, email: submittedEmail },
      });
    } catch (err) {
      setOtpError("root", { message: getApiErrorMessage(err, "Invalid OTP. Please try again.") });
    }
  };

  const handleResendOtp = async () => {
    if (!submittedEmail) return;
    try {
      setSuccessMsg("");
      const res = await forgotPassword({
        email: submittedEmail,
        role: PANEL_ROLE,
      }).unwrap();
      setSuccessMsg(res.message || "A new OTP has been sent to your email.");
    } catch (err) {
      setOtpError("root", { message: getApiErrorMessage(err, "Failed to resend OTP. Please try again.") });
    }
  };

  return (
    <div
      className="min-h-screen w-full flex items-center justify-center bg-cover bg-center bg-no-repeat relative px-4 sm:px-6 lg:px-8"
      style={{ backgroundImage: `url(${bgImage})` }}
    >
      <div className="w-full max-w-125 bg-white rounded-[10px] shadow-2xl p-8 sm:p-10 md:p-12 relative z-10 mx-auto">
        {step === "request" ? (
          <>
            <div className="text-center mb-10">
              <h1 className="md:text-2xl text-xl text-(--primary-color) sm:text-3xl font-medium mb-2">
                Forgot Password?
              </h1>
              <p className="text-(--text-color-gray) text-sm sm:text-base">
                Enter your email address to receive an OTP verification code
              </p>
            </div>

            <form
              onSubmit={handleEmailSubmit(onRequestOtp)}
              className="space-y-6"
            >
              <div className="space-y-1">
                <Input
                  id="email"
                  label="E-mail address"
                  type="email"
                  placeholder="Enter your email"
                  {...registerEmail("email", {
                    onChange: () => {
                      if (emailErrors.root) clearEmailErrors("root");
                    },
                  })}
                />
                {emailErrors.email && (
                  <p className="text-xs text-red-600 font-medium">
                    {emailErrors.email.message}
                  </p>
                )}
              </div>

              {emailErrors.root && (
                <div className="p-3 bg-red-50 border border-red-200 rounded-md text-sm text-red-600 text-center font-medium">
                  {emailErrors.root.message}
                </div>
              )}

              <Button type="submit" disabled={isEmailSubmitting}>
                {isEmailSubmitting ? "Sending OTP..." : "Send OTP"}
              </Button>

              <div className="flex justify-center pt-2">
                <Link
                  to="/login"
                  className="text-sm font-normal text-(--primary-color) hover:opacity-80 transition-colors"
                >
                  ← Back to Login
                </Link>
              </div>
            </form>
          </>
        ) : (
          <>
            <div className="text-center mb-8">
              <h1 className="md:text-2xl text-xl text-(--primary-color) sm:text-3xl font-medium mb-2">
                Verify OTP
              </h1>
              <p className="text-(--text-color-gray) text-sm sm:text-base mb-1">
                Enter the OTP sent to
              </p>
              <p className="text-(--primary-color) font-medium text-sm sm:text-base">
                {submittedEmail}
              </p>
            </div>

            {successMsg && (
              <div className="mb-6 p-3 bg-green-50 border border-green-200 rounded-md text-sm text-green-700 text-center font-medium">
                {successMsg}
              </div>
            )}

            <form onSubmit={handleOtpSubmit(onVerifyOtp)} className="space-y-6">
              <div className="space-y-1">
                <Input
                  id="otp"
                  label="OTP Code"
                  type="number"
                  placeholder="Enter 6-digit OTP"
                  onInput={(e: React.FormEvent<HTMLInputElement>) => {
                    if (e.currentTarget.value.length > 6) {
                      e.currentTarget.value = e.currentTarget.value.slice(0, 6);
                    }
                  }}
                  {...registerOtp("otp", {
                    onChange: () => {
                      if (otpErrors.root) clearOtpErrors("root");
                    },
                  })}
                />
                {otpErrors.otp && (
                  <p className="text-xs text-red-600 font-medium">{otpErrors.otp.message}</p>
                )}
              </div>

              {otpErrors.root && (
                <div className="p-3 bg-red-50 border border-red-200 rounded-md text-sm text-red-600 text-center font-medium">
                  {otpErrors.root.message}
                </div>
              )}

              <Button type="submit" disabled={isOtpSubmitting}>
                {isOtpSubmitting ? "Verifying..." : "Verify OTP"}
              </Button>

              <div className="flex items-center justify-between pt-2">
                <button
                  type="button"
                  onClick={() => {
                    setSuccessMsg("");
                    clearOtpErrors();
                    setStep("request");
                  }}
                  className="text-sm font-normal text-gray-500 hover:text-gray-700 transition-colors cursor-pointer"
                >
                  Change Email
                </button>
                <button
                  type="button"
                  onClick={handleResendOtp}
                  className="text-sm font-normal text-(--primary-color) hover:opacity-80 transition-colors cursor-pointer"
                >
                  Resend OTP
                </button>
              </div>

              <div className="flex justify-center pt-2 border-t border-gray-100">
                <Link
                  to="/login"
                  className="text-sm font-normal text-(--primary-color) hover:opacity-80 transition-colors"
                >
                  ← Back to Login
                </Link>
              </div>
            </form>
          </>
        )}
      </div>
    </div>
  );
}

export default ForgotPassword;
