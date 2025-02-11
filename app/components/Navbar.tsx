"use client";
import { useState, useEffect } from "react";
import Link from "next/link";

export default function Navbar() {
  const [scrolling, setScrolling] = useState(false);

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
          <Link href="/auth/login" className="bg-black text-white px-4 py-2 rounded">Login</Link>
        </div>
      </div>
    </nav>
  );
}
