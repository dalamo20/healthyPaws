import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const lat = searchParams.get("lat");
  const lng = searchParams.get("lng");

  if (!lat || !lng) {
    return NextResponse.json({ error: "Missing latitude or longitude" }, { status: 400 });
  }

  const GOOGLE_PLACES_API_KEY = process.env.NEXT_PUBLIC_GOOGLE_PLACES_API_KEY;
  
  //pet service queries
  const types = ["pet_store", "veterinary_care", "animal_shelter", "pet_training", "pet_grooming", "pet_boarding"];
  const typeQuery = types.join("|");

  const url = `https://maps.googleapis.com/maps/api/place/nearbysearch/json?location=${lat},${lng}&radius=5000&type=${typeQuery}&key=${GOOGLE_PLACES_API_KEY}`;

  try {
    const response = await fetch(url);
    const data = await response.json();
    console.log("Google API Response:", data);

    if (!data.results || !Array.isArray(data.results)) {
      return NextResponse.json({ error: "No pet services found." }, { status: 404 });
    }
    return NextResponse.json(data);
  } catch (error) {
    console.error("Error fetching places:", error);
    return NextResponse.json({ error: "Failed to fetch places" }, { status: 500 });
  }
}
