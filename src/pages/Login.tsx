import { useState } from "react";
import "../App.css";
import Button from "../components/common_components/Button";
import Input from "../components/common_components/Input";
import bgImage from "../assets/AuthBackgroundImg.jpg";
import { useNavigate } from "react-router-dom";

function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const navigate = useNavigate();

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    navigate("/dashboard");
  };

  return (
    <div
      className="min-h-screen w-full flex items-center justify-center bg-cover bg-center bg-no-repeat relative px-4 sm:px-6 lg:px-8"
      style={{ backgroundImage: `url(${bgImage})` }}
    >
      <div className="w-full max-w-[500px] bg-white rounded-[10px] shadow-2xl p-8 sm:p-10 md:p-12 relative z-10 mx-auto">
        <div className="text-center mb-10">
          <h1 className="md:text-2xl text-xl text-(--primary-color) sm:text-3xl font-medium mb-2">
            Sign In
          </h1>
          <p className="text-(--text-color-gray) text-sm sm:text-base">
            Let's build something great
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <Input
            id="email"
            label="E-mail or phone number"
            type="text"
            placeholder="Enter your email or phone"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />

          <div className="space-y-1">
            <Input
              id="password"
              label="Password"
              type="password"
              placeholder="Enter your password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>

          <Button type="submit">Login</Button>

          <div className="flex justify-end pt-2">
            <a
              href="/forgot-password"
              className="text-sm font-normal text-(--primary-color) hover:opacity-80 transition-colors"
            >
              Forgot Password?
            </a>
          </div>
        </form>
      </div>
    </div>
  );
}

export default Login;
