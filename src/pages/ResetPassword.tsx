import { useState } from "react";
import Button from "../components/common_components/Button";
import Input from "../components/common_components/Input";
import bgImage from "../assets/AuthBackgroundImg.jpg";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useResetPasswordMutation } from "../redux/api/authApi";
import { getApiErrorMessage } from "../redux/utils/apiError";

interface ResetPasswordState {
  resetToken?: string;
  email?: string;
}

const resetPasswordSchema = z
  .object({
    newPassword: z
      .string()
      .min(6, "Password must be at least 6 characters long."),
    confirmPassword: z.string().min(1, "Please confirm your password."),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: "Passwords do not match.",
    path: ["confirmPassword"],
  });

type ResetPasswordFormValues = z.infer<typeof resetPasswordSchema>;

function ResetPassword() {
  const navigate = useNavigate();
  const location = useLocation();
  const state = location.state as ResetPasswordState | null;

  // Retrieve resetToken from router state or query parameters
  const queryParams = new URLSearchParams(location.search);
  const resetToken = state?.resetToken || queryParams.get("token") || "";

  const [isSuccess, setIsSuccess] = useState(false);
  const [resetPassword] = useResetPasswordMutation();

  const {
    register,
    handleSubmit,
    setError,
    clearErrors,
    formState: { errors, isSubmitting },
  } = useForm<ResetPasswordFormValues>({
    resolver: zodResolver(resetPasswordSchema),
    defaultValues: {
      newPassword: "",
      confirmPassword: "",
    },
  });

  const onSubmit = async (values: ResetPasswordFormValues) => {
    if (!resetToken) {
      setError("root", {
        message: "Reset token missing or expired. Please start over.",
      });
      return;
    }

    try {
      await resetPassword({
        resetToken,
        newPassword: values.newPassword,
      }).unwrap();
      setIsSuccess(true);
    } catch (err) {
      setError("root", { message: getApiErrorMessage(err, "Failed to reset password. Please try again.") });
    }
  };

  return (
    <div
      className="min-h-screen w-full flex items-center justify-center bg-cover bg-center bg-no-repeat relative px-4 sm:px-6 lg:px-8"
      style={{ backgroundImage: `url(${bgImage})` }}
    >
      <div className="w-full max-w-125 bg-white rounded-[10px] shadow-2xl p-8 sm:p-10 md:p-12 relative z-10 mx-auto">
        {!resetToken && !isSuccess ? (
          <div className="text-center">
            <div className="w-16 h-16 bg-amber-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={2}
                stroke="currentColor"
                className="w-8 h-8 text-amber-600"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M12 9v3.75m9-.75a9 9 0 1 1-18 0 9 9 0 0 1 18 0zm-9 3.75h.008v.008H12v-.008z"
                />
              </svg>
            </div>
            <h1 className="md:text-2xl text-xl text-(--primary-color) sm:text-3xl font-medium mb-2">
              Invalid Access
            </h1>
            <p className="text-(--text-color-gray) text-sm sm:text-base mb-6">
              No reset token found. Please verify your OTP to reset your password.
            </p>
            <Button type="button" onClick={() => navigate("/forgot-password")}>
              Go to Forgot Password
            </Button>
          </div>
        ) : isSuccess ? (
          <div className="text-center">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={2}
                stroke="currentColor"
                className="w-8 h-8 text-green-600"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M9 12.75 11.25 15 15 9.75M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z"
                />
              </svg>
            </div>
            <h1 className="md:text-2xl text-xl text-(--primary-color) sm:text-3xl font-medium mb-2">
              Password Reset Successful
            </h1>
            <p className="text-(--text-color-gray) text-sm sm:text-base mb-6">
              Your password has been successfully updated. You can now log in with your new password.
            </p>
            <Button type="button" onClick={() => navigate("/login")}>
              Proceed to Login
            </Button>
          </div>
        ) : (
          <>
            <div className="text-center mb-10">
              <h1 className="md:text-2xl text-xl text-(--primary-color) sm:text-3xl font-medium mb-2">
                Reset Password
              </h1>
              <p className="text-(--text-color-gray) text-sm sm:text-base">
                Enter your new password below
              </p>
            </div>

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
              <div className="space-y-1">
                <Input
                  id="newPassword"
                  label="New Password"
                  type="password"
                  placeholder="Enter your new password"
                  {...register("newPassword", {
                    onChange: () => {
                      if (errors.root) clearErrors("root");
                    },
                  })}
                />
                {errors.newPassword && (
                  <p className="text-xs text-red-600 font-medium">
                    {errors.newPassword.message}
                  </p>
                )}
              </div>

              <div className="space-y-1">
                <Input
                  id="confirmPassword"
                  label="Confirm New Password"
                  type="password"
                  placeholder="Confirm your new password"
                  {...register("confirmPassword", {
                    onChange: () => {
                      if (errors.root) clearErrors("root");
                    },
                  })}
                />
                {errors.confirmPassword && (
                  <p className="text-xs text-red-600 font-medium">
                    {errors.confirmPassword.message}
                  </p>
                )}
              </div>

              {errors.root && (
                <div className="p-3 bg-red-50 border border-red-200 rounded-md text-sm text-red-600 text-center font-medium">
                  {errors.root.message}
                </div>
              )}

              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? "Resetting Password..." : "Reset Password"}
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
        )}
      </div>
    </div>
  );
}

export default ResetPassword;
