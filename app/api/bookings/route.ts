import { NextRequest, NextResponse } from "next/server";
import { getBookings, addBooking, updateBooking, deleteBooking } from "@/lib/db";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const userId = searchParams.get("userId");

  if (!userId) return NextResponse.json({ error: "Missing userId" }, { status: 400 });

  try {
    const bookings = await getBookings(userId);
    return NextResponse.json(bookings);
  } catch (error) {
    console.error("Error fetching bookings:", error);
    return NextResponse.json({ error: "Failed to fetch bookings" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  const { userId, bookingData } = await req.json();

  if (!userId || !bookingData) return NextResponse.json({ error: "Missing parameters" }, { status: 400 });

  try {
    await addBooking(userId, bookingData);
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error adding bookings:", error);
    return NextResponse.json({ error: "Failed to add booking" }, { status: 500 });
  }
}

export async function PUT(req: NextRequest) {
  const { userId, bookingId, updatedData } = await req.json();

  if (!userId || !bookingId || !updatedData) return NextResponse.json({ error: "Missing parameters" }, { status: 400 });

  try {
    await updateBooking(userId, bookingId, updatedData);
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error updating bookings:", error);
    return NextResponse.json({ error: "Failed to update booking" }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  const { userId, bookingId } = await req.json();

  if (!userId || !bookingId) return NextResponse.json({ error: "Missing parameters" }, { status: 400 });

  try {
    await deleteBooking(userId, bookingId);
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting bookings:", error);
    return NextResponse.json({ error: "Failed to delete booking" }, { status: 500 });
  }
}
