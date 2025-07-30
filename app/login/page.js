"use client";

import { useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState(null);
  const [isSigningUp, setIsSigningUp] = useState(false);
  const { signup, login } = useAuth();
  const router = useRouter();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    try {
      if (isSigningUp) {
        await signup(email, password);
      } else {
        await login(email, password);
      }
      router.push("/"); // Redirect to dashboard on success
    } catch (err) {
      setError(err.message);
      console.error(err);
    }
  };

  return (
    <div className="min-h-screen bg-neumorphic-bg flex items-center justify-center">
      <div className="w-full max-w-sm p-8 rounded-2xl bg-neumorphic-bg shadow-neumorphic">
        <h1 className="text-3xl font-bold text-center text-neumorphic mb-8">
          {isSigningUp ? "Create Account" : "Welcome Back"}
        </h1>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-neumorphic mb-2">
              Email Address
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-3 rounded-xl bg-neumorphic-bg shadow-neumorphic-inset text-neumorphic-text placeholder-neumorphic-text focus:outline-none"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-neumorphic mb-2">
              Password
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-3 rounded-xl bg-neumorphic-bg shadow-neumorphic-inset text-neumorphic-text placeholder-neumorphic-text focus:outline-none"
              required
            />
          </div>
          {error && <p className="text-red-500 text-sm text-center">{error}</p>}
          <div>
            <button
              type="submit"
              className="w-full py-3 mt-4 rounded-xl btn-neumorphic shadow-neumorphic text-neumorphic-text font-medium hover:shadow-neumorphic-soft active:shadow-neumorphic-pressed"
            >
              {isSigningUp ? "Sign Up" : "Log In"}
            </button>
          </div>
        </form>
        <div className="text-center mt-6">
          <button
            onClick={() => setIsSigningUp(!isSigningUp)}
            className="text-sm text-neumorphic-text hover:underline"
          >
            {isSigningUp
              ? "Already have an account? Log In"
              : "Don't have an account? Sign Up"}
          </button>
        </div>
      </div>
    </div>
  );
}
