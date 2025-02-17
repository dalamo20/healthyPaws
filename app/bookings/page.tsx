"use client";
import { useState, useEffect } from "react";
import Navbar from "@/components/Navbar";
import { getBookings, deleteBooking, updateBooking } from "@/lib/db";
import { useRouter } from "next/navigation";
import { auth } from "@/lib/firebase"; // Firebase Auth for user ID

export default function Bookings() {
  const [bookings, setBookings] = useState<any[]>([]);
  const [isMounted, setIsMounted] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [newDate, setNewDate] = useState("");
  const [newTime, setNewTime] = useState("");
  const router = useRouter();

  useEffect(() => {
    const fetchBookings = async () => {
      const user = auth.currentUser;
      if (!user) return;

      const data = await getBookings(user.uid);
      setBookings(data);
    };

    fetchBookings();
    setIsMounted(true);
  }, []);

  if (!isMounted) return null;

  const handleDelete = async (bookingId: string) => {
    const user = auth.currentUser;
    if (!user) return;

    await deleteBooking(user.uid, bookingId);
    setBookings((prev) => prev.filter((b) => b.id !== bookingId));
  };

  const handleEdit = async (bookingId: string) => {
    const user = auth.currentUser;
    if (!user) return;

    await updateBooking(user.uid, bookingId, { date: newDate, time: newTime });
    setBookings((prev) =>
      prev.map((b) => (b.id === bookingId ? { ...b, date: newDate, time: newTime } : b))
    );
    setEditingId(null);
  };

  return (
    <div className="h-screen w-screen bg-gradient-to-r from-pink-200 to-yellow-200 flex flex-col items-center justify-center">
      <Navbar />
      <h1 className="text-2xl font-semibold my-4">My Bookings</h1>
      <div className="bg-white p-4 rounded-lg shadow-lg w-3/4">
        {bookings.length > 0 ? (
          <ul>
            {bookings.map((booking) => (
              <li key={booking.id} className="p-2 border-b flex justify-between">
                <div>
                  <strong>{booking.service}</strong>
                  <p>📍 {booking.location}</p>
                  <p>📅 {booking.date}</p>
                  <p>⏰ {booking.time}</p>
                </div>
                <div className="flex gap-2">
                  <button onClick={() => setEditingId(booking.id)} className="bg-blue-500 text-white px-4 py-1 rounded">Edit</button>
                  <button onClick={() => handleDelete(booking.id)} className="bg-red-500 text-white px-4 py-1 rounded">Delete</button>
                </div>
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-gray-500">No bookings found.</p>
        )}
      </div>
    </div>
  );
}
