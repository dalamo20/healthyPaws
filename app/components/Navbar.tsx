"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import { onAuthStateChanged, signOut } from "firebase/auth";
import { auth } from "@/lib/firebase";
import { useRouter } from "next/navigation";

export default function Navbar() {
  const [user, setUser] = useState(null);
  const [scrolling, setScrolling] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser: any) => {
      setUser(currentUser);
    });

    return () => unsubscribe();
  }, []);

  const handleLogout = async () => {
    await signOut(auth);
    router.push("/auth/login");
  };

  //scroll effect
  useEffect(() => {
    const handleScroll = () => {
      setScrolling(window.scrollY > 50);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <nav className={`fixed top-0 left-0 w-full p-4 transition-all ${scrolling ? "bg-white/80 backdrop-blur-md shadow-md" : "bg-transparent"}`}>
      <div className="container mx-auto flex justify-between items-center">
        <Link href="/" className="text-lg font-semibold">Healthy Paws</Link>
        <div className="flex items-center gap-4">
          <Link href="/bookings">Your bookings</Link>
          <Link href="/profile">Profile</Link>
          {user ? (
            <button onClick={handleLogout} className="bg-red-500 text-white px-4 py-2 rounded">Logout</button>
          ) : (
            <Link href="/auth/login" className="bg-black text-white px-4 py-2 rounded">Login</Link>
          )}
        </div>
      </div>
    </nav>
  );
}
