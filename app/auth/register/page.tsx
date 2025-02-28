"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { signUp } from "@/lib/auth";

export default function Register() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [isMounted, setIsMounted] = useState(false); 
  const router = useRouter();

  useEffect(() => {
    setIsMounted(true);
  }, []);

  if (!isMounted) return null; 

  const handleRegistration = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    if (password !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    try {
      await signUp(email, password);
      setSuccess("Account created successfully.");
      setTimeout(() => {
        router.push("/auth/login");
      }, 1000); 

    } catch (error: any) {
      console.error("Signup error:", error.message);
      setError(error.message);
    }
  };

  return (
    <div className="h-screen flex flex-col items-center justify-center bg-gradient-to-r from-pink-200 to-yellow-200">
      <h1 className="text-2xl font-semibold mb-4">Create Account</h1>
      <form onSubmit={handleRegistration} className="flex flex-col gap-4">
        <input type="email" placeholder="Email" className="border p-2" value={email} onChange={(e) => setEmail(e.target.value)} required />
        <input type="password" placeholder="Password" className="border p-2" value={password} onChange={(e) => setPassword(e.target.value)} required />
        <input type="password" placeholder="Confirm Password" className="border p-2" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} required />
        <button type="submit" className="bg-black text-white p-2">
          Sign Up
        </button>

      </form>

      {error && <p className="text-red-500 mt-2">{error}</p>}
      {success && <p className="text-green-500 mt-2">{success}</p>}

      <p className="mt-2">
        Already have an account? <a href="/auth/login" className="text-blue-500">Sign in</a>
      </p>
    </div>
  );
}
