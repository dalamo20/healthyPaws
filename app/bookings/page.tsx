"use client";
import { useState, useEffect } from "react";
import Navbar from "@/app/components/Navbar";
import { getBookings, deleteBooking, updateBooking } from "@/lib/db";
import { auth } from "@/lib/firebase";
import { Calendar } from "react-calendar";
import "react-calendar/dist/Calendar.css";

interface Booking {
  id: string;
  serviceName: string;
  placeName: string;
  date: string;
  time: string;
}

export default function Bookings() {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [isMounted, setIsMounted] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [newDate, setNewDate] = useState<Date | null>(null);
  const [newTime, setNewTime] = useState("");

  const timeOptions = [
    "9:00 am", "9:30 am", "10:00 am", "10:30 am",
    "11:00 am", "11:30 am", "12:00 pm", "12:30 pm",
    "1:00 pm", "1:30 pm", "2:00 pm", "2:30 pm",
    "3:00 pm", "3:30 pm", "4:00 pm", "4:30 pm"
  ];

  useEffect(() => {
    const fetchBookings = async () => {
      try {
        const user = auth.currentUser;
      if (!user) return;
      const data = await getBookings(user.uid);
      setBookings(data);
      } catch (error) {
        console.error("Error fetching bookings", error);
      }
    }

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

    if (!newDate || !newTime) {
      alert("Please select a new date and time.");
      return;
    }

    await updateBooking(user.uid, bookingId, {
      date: newDate.toDateString(),
      time: newTime,
    });

    setBookings((prev) =>
      prev.map((b) =>
        b.id === bookingId ? { ...b, date: newDate.toDateString(), time: newTime } : b
      )
    );

    setEditingId(null);
  };

  return (
    <div className="h-screen w-screen bg-gradient-to-r from-pink-200 to-yellow-200 flex flex-col items-center justify-start relative">
      <Navbar />
      <h1 className="text-2xl font-semibold mt-24">My Bookings</h1>

      <div className="mt-4 p-4 bg-white rounded-lg shadow-lg w-3/4 max-h-[400px] overflow-y-auto">
        <h2 className="text-xl font-semibold">Your Appointments</h2>

        {bookings.length > 0 ? (
          <ul>
            {bookings.map((booking) => (
              <li key={booking.id} className="p-4 border-b flex justify-between items-center">
                <div>
                  <strong>{booking.serviceName}</strong>
                  <p>📍 {booking.placeName}</p>
                  <p>📅 {booking.date}</p>
                  <p>⏰ {booking.time}</p>
                </div>

                <div className="flex gap-2">
                  {editingId === booking.id ? (
                    <div className="flex flex-col gap-2">
                      <Calendar
                        onChange={(date) => setNewDate(date as Date)}
                        value={newDate || new Date(booking.date)}
                        className="rounded-lg shadow"
                      />
                      <select
                        className="border p-2 rounded shadow"
                        value={newTime || booking.time}
                        onChange={(e) => setNewTime(e.target.value)}
                      >
                        {timeOptions.map((time) => (
                          <option key={time} value={time}>
                            {time}
                          </option>
                        ))}
                      </select>
                      <button
                        onClick={() => handleEdit(booking.id)}
                        className="bg-green-500 text-white px-4 py-1 rounded hover:bg-green-700 transition"
                      >
                        Save
                      </button>
                      <button
                        onClick={() => setEditingId(null)}
                        className="text-gray-600 px-4 py-1 rounded hover:bg-gray-100 transition"
                      >
                        Cancel
                      </button>
                    </div>
                  ) : (
                    <>
                      <button
                        onClick={() => setEditingId(booking.id)}
                        className="bg-blue-500 text-white px-4 py-1 rounded hover:bg-blue-700 transition"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDelete(booking.id)}
                        className="bg-red-500 text-white px-4 py-1 rounded hover:bg-red-700 transition"
                      >
                        Delete
                      </button>
                    </>
                  )}
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
