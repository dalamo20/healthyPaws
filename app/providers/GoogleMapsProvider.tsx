"use client";
import { LoadScript } from "@react-google-maps/api";

const libraries: ("places")[] = ["places"];

export default function GoogleMapsProvider({ children, apiKey }: { children: React.ReactNode; apiKey: string }) {
  return (
    <LoadScript googleMapsApiKey={apiKey} libraries={libraries}>
      {children}
    </LoadScript>
  );
}
