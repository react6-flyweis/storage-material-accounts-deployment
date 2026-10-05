import { useState } from "react";
import "../App.css";
import Button from "../components/common_components/Button";
import Input from "../components/common_components/Input";
import bgImage from "../assets/AuthBackgroundImg.jpg";
import { useNavigate } from "react-router-dom";

function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [isSubmitted, setIsSubmitted] = useState(false);

  const navigate = useNavigate();

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitted(true);
  };

  const handleBackToLogin = () => {
    navigate("/login");
  };

  return (
    <div
      className="min-h-screen w-full flex items-center justify-center bg-cover bg-center bg-no-repeat relative px-4 sm:px-6 lg:px-8"
      style={{ backgroundImage: `url(${bgImage})` }}
    >
      <div className="w-full max-w-[500px] bg-white rounded-[10px] shadow-2xl p-8 sm:p-10 md:p-12 relative z-10 mx-auto">
        {!isSubmitted ? (
          <>
            <div className="text-center mb-10">
              <h1 className="md:text-2xl text-xl text-(--primary-color) sm:text-3xl font-medium mb-2">
                Forgot Password?
              </h1>
              <p className="text-(--text-color-gray) text-sm sm:text-base">
                Enter your email and we'll send you a reset link
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              <Input
                id="email"
                label="E-mail"
                type="email"
                placeholder="Enter your email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />

              <Button type="submit">Send Reset Link</Button>

              <div className="flex justify-center pt-2">
                <button
                  type="button"
                  onClick={handleBackToLogin}
                  className="text-sm font-normal text-(--primary-color) hover:opacity-80 transition-colors"
                >
                  ← Back to Login
                </button>
              </div>
            </form>
          </>
        ) : (
          <>
            <div className="text-center mb-10">
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
                Check Your Email
              </h1>
              <p className="text-(--text-color-gray) text-sm sm:text-base mb-2">
                We've sent a password reset link to
              </p>
              <p className="text-(--primary-color) font-medium text-sm sm:text-base mb-6">
                {email}
              </p>
              <p className="text-(--text-color-gray) text-xs sm:text-sm">
                Didn't receive the email? Check your spam folder or
              </p>
            </div>

            <div className="space-y-4">
              <Button type="button" onClick={() => setIsSubmitted(false)}>
                Resend Link
              </Button>

              <div className="flex justify-center pt-2">
                <button
                  type="button"
                  onClick={handleBackToLogin}
                  className="text-sm font-normal text-(--primary-color) hover:opacity-80 transition-colors"
                >
                  ← Back to Login
                </button>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

export default ForgotPassword;
