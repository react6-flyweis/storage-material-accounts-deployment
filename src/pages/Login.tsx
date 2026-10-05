import Button from "../components/common_components/Button";
import Input from "../components/common_components/Input";
import bgImage from "../assets/AuthBackgroundImg.jpg";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import * as Sentry from "@sentry/react";
import { useLoginMutation } from "../redux/api/authApi";
import { getApiErrorMessage } from "../redux/utils/apiError";
import { getAuthRedirectPath } from "../lib/authRedirect";

const isPhoneNumber = (value: string) => {
  const normalizedValue = value.replace(/[\s()-]/g, "");
  return /^\+?\d{7,15}$/.test(normalizedValue);
};

const loginSchema = z.object({
  email: z
    .string()
    .trim()
    .min(1, "Email or phone number is required.")
    .refine(
      (value) => z.string().email().safeParse(value).success || isPhoneNumber(value),
      {
        message: "Enter a valid email address or phone number.",
      },
    ),
  password: z.string().min(1, "Password is required."),
});

type LoginFormValues = z.infer<typeof loginSchema>;

function Login() {
  const navigate = useNavigate();
  const location = useLocation();
  const [login] = useLoginMutation();

  const {
    register,
    handleSubmit,
    setError,
    clearErrors,
    formState: { errors, isSubmitting },
  } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const onSubmit = async (values: LoginFormValues) => {
    try {
      await login(values).unwrap();
      navigate(getAuthRedirectPath(location), { replace: true });
    } catch (error) {
      const errorMessage = getApiErrorMessage(error, "Unable to sign in. Please try again.");
      setError("root", { message: errorMessage });
      Sentry.captureMessage("Failed sign-in attempt", {
        level: "warning",
        extra: {
          statusCode: 200,
          authProvider: "local",
          email: values.email,
          responseMessage: errorMessage,
        },
      });
    }
  };

  return (
    <div
      className="min-h-screen w-full flex items-center justify-center bg-cover bg-center bg-no-repeat relative px-4 sm:px-6 lg:px-8"
      style={{ backgroundImage: `url(${bgImage})` }}
    >
      <div className="w-full max-w-125 bg-white rounded-[10px] shadow-2xl p-8 sm:p-10 md:p-12 relative z-10 mx-auto">
        <div className="text-center mb-10">
          <h1 className="md:text-2xl text-xl text-(--primary-color) sm:text-3xl font-medium mb-2">
            Sign In
          </h1>
          <p className="text-(--text-color-gray) text-sm sm:text-base">
            Let's build something great
          </p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <div className="space-y-1">
            <Input
              id="email"
              label="E-mail or phone number"
              type="text"
              placeholder="Enter your email or phone"
              {...register("email", {
                onChange: () => {
                  if (errors.root) clearErrors("root");
                },
              })}
            />
            {errors.email && (
              <p className="text-xs text-red-600 font-medium">{errors.email.message}</p>
            )}
          </div>

          <div className="space-y-1">
            <Input
              id="password"
              label="Password"
              type="password"
              placeholder="Enter your password"
              {...register("password", {
                onChange: () => {
                  if (errors.root) clearErrors("root");
                },
              })}
            />
            {errors.password && (
              <p className="text-xs text-red-600 font-medium">{errors.password.message}</p>
            )}
          </div>

          {errors.root && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-md text-sm text-red-600 text-center font-medium">
              {errors.root.message}
            </div>
          )}

          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? "Signing in..." : "Login"}
          </Button>

          <div className="flex justify-end pt-2">
            <Link
              to="/forgot-password"
              className="text-sm font-normal text-(--primary-color) hover:opacity-80 transition-colors"
            >
              Forgot Password?
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
}

export default Login;
