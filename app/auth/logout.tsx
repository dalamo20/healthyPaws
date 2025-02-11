"use client";
import { logout } from "@/lib/auth";
import { useRouter } from "next/navigation";

export default function Logout() {
  const router = useRouter();

  const handleLogout = async () => {
    await logout();
    router.push("/auth/login");
  };

  return <button onClick={handleLogout} className="text-red-500">Logout</button>;
}
