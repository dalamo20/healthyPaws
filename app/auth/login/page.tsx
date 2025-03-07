"use client";
import { useState, useEffect } from "react";
import { login } from "@/lib/auth";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isMounted, setIsMounted] = useState(false); 
  const router = useRouter();

  useEffect(() => {
    setIsMounted(true);
  }, []);

  if (!isMounted) return null; 

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await login(email, password);
      router.push("/"); 
    } catch (error: unknown) {
      if (error instanceof Error) {
          console.error("Login error:", error.message);
      }
      setError("Invalid email or password");
    }  
  };

  return (
    <div className="h-screen flex flex-col items-center justify-center bg-gradient-to-r from-pink-200 to-yellow-200">
      <h1 className="text-2xl font-semibold mb-4">Login</h1>
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <input type="email" placeholder="Email" className="border p-2" value={email} onChange={(e) => setEmail(e.target.value)} required />
        <input type="password" placeholder="Password" className="border p-2" value={password} onChange={(e) => setPassword(e.target.value)} required />
        <button type="submit" className="bg-black text-white p-2">Login</button>
      </form>
      {error && <p className="text-red-500 mt-2">{error}</p>}
      <p className="mt-2">
        Don’t have an account? <Link href="/auth/register" className="text-blue-500">Sign up</Link>
      </p>
    </div>
  );
}
