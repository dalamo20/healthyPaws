import { NextRequest, NextResponse } from "next/server";
import { analyzeImage } from "@/lib/googleVision";

export async function POST(req: NextRequest) {
  try {
    const { imageUrl } = await req.json();
    if (!imageUrl) return NextResponse.json({ error: "Missing image URL" }, { status: 400 });

    const labels = await analyzeImage(imageUrl);
    return NextResponse.json({ labels });
  } catch (error) {
    console.error("Error processing image:", error);
    return NextResponse.json({ error: "Failed to analyze image" }, { status: 500 });
  }
}
