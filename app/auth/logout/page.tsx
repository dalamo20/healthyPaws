"use client";
import { useEffect } from "react";
import { logout } from "@/lib/auth";
import { useRouter } from "next/navigation";

export default function Logout() {
  const router = useRouter();

  useEffect(() => {
    const handleLogout = async () => {
      await logout();
      router.push("/auth/login");
    };

    handleLogout();
  }, [router]);

  return (
    <div className="h-screen flex flex-col items-center justify-center bg-gradient-to-r from-pink-200 to-yellow-200">
      <h1 className="text-2xl font-semibold mb-4">Logging out</h1>
    </div>
  );
}
