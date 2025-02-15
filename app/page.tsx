"use client";
import { useState, useEffect, useRef } from "react";
import { Calendar } from "react-calendar";
import "react-calendar/dist/Calendar.css";
import { Combobox, ComboboxButton, ComboboxOptions, ComboboxOption } from "@headlessui/react";
import Navbar from "./components/Navbar";
import { LoadScript, Autocomplete } from "@react-google-maps/api";

export default function Home() {
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [selectedService, setSelectedService] = useState("");
  const [location, setLocation] = useState("");
  const [nearbyPlaces, setNearbyPlaces] = useState<any[]>([]);
  const [isDatePickerVisible, setIsDatePickerVisible] = useState(false);
  const [isTimePickerVisible, setIsTimePickerVisible] = useState(false);
  const [isMounted, setIsMounted] = useState(false);
  const [selectedTime, setSelectedTime] = useState("");

  const autocompleteRef = useRef(null);

  const timeOptions = [
    "9:00 am", "9:30 am", "10:00 am", "10:30 am",
    "11:00 am", "11:30 am", "12:00 pm", "12:30 pm",
    "1:00 pm", "1:30 pm", "2:00 pm", "2:30 pm",
    "3:00 pm", "3:30 pm", "4:00 pm", "4:30 pm"
  ];

  const services = ["Pet grooming", "Pet boarding", "Pet training", "Pet treatment"];

  useEffect(() => {
    setSelectedDate(new Date());
    setIsMounted(true);
  }, []);

  const fetchNearbyPlaces = async () => {
    if (!location) return;
  
    try {
      //convert city location to lat/lng using Geocoding API
      const geocodeResponse = await fetch(
        `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(location)}&key=${process.env.NEXT_PUBLIC_GOOGLE_PLACES_API_KEY}`
      );
      const geocodeData = await geocodeResponse.json();
  
      if (!geocodeData.results || geocodeData.results.length === 0) {
        console.error("Geocoding failed: No results found");
        return;
      }
  
      const { lat, lng } = geocodeData.results[0].geometry.location;
      console.log("Geocoded Coordinates:", lat, lng);
  
      // fetch services with Places API
      const response = await fetch(`/api/places?lat=${lat}&lng=${lng}`);
      const data = await response.json();
  
      console.log("API Response:", data);
  
      if (data?.results && Array.isArray(data.results)) {
        setNearbyPlaces(data.results);
      } else {
        console.error("Invalid API response:", data);
        setNearbyPlaces([]);
      }
    } catch (error) {
      console.error("Error fetching places:", error);
      setNearbyPlaces([]);
    }
  };  

  //Handle place selection from Google Autocomplete
  const handlePlaceSelect = () => {
    if (autocompleteRef.current) {
      const place = autocompleteRef.current.getPlace();
      setLocation(place.formatted_address);
    }
  };

  if (!isMounted) return null;

  return (
    <LoadScript googleMapsApiKey={process.env.NEXT_PUBLIC_GOOGLE_PLACES_API_KEY} libraries={["places"]}>
      <div className="h-screen w-screen bg-gradient-to-r from-pink-200 to-yellow-200 flex flex-col items-center justify-center">
        <Navbar />
        <div className="flex items-center rounded-full shadow-lg bg-white p-4 gap-4">
          {/* Services Dropdown */}
          <Combobox value={selectedService} onChange={setSelectedService}>
            <div className="relative w-1/4">
              <ComboboxButton className="flex items-center gap-2">
                🔍 <span>{selectedService || "All treatments and venues"}</span>
              </ComboboxButton>
              <ComboboxOptions className="absolute top-full mt-2 w-full bg-white rounded-lg shadow-lg p-2">
                <h3 className="font-semibold">Services</h3>
                {services.map((service) => (
                  <ComboboxOption key={service} value={service} className="cursor-pointer hover:bg-gray-100 rounded p-2">
                    {service}
                  </ComboboxOption>
                ))}
              </ComboboxOptions>
            </div>
          </Combobox>

          {/* Location Input - Uses Google Autocomplete */}
          <div className="w-1/4 flex items-center gap-2">
            📍
            <Autocomplete onLoad={(auto) => (autocompleteRef.current = auto)} onPlaceChanged={handlePlaceSelect}>
              <input
                type="text"
                placeholder="Enter city or state"
                className="border-none focus:outline-none focus:ring-0 w-full"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
              />
            </Autocomplete>
          </div>

          {/* Date Picker */}
          <div className="w-1/4 relative">
            <button className="flex items-center gap-2" onClick={() => setIsDatePickerVisible(!isDatePickerVisible)}>
              📅 {selectedDate ? selectedDate.toDateString() : "Choose date"}
            </button>
            {isDatePickerVisible && (
              <div className="absolute top-full mt-2 bg-white rounded-lg shadow-lg z-10">
                <Calendar
                  onChange={(date) => {
                    setSelectedDate(date);
                    setIsDatePickerVisible(false);
                  }}
                  value={selectedDate}
                  className="rounded-lg"
                />
              </div>
            )}
          </div>

          {/* Time Picker */}
          <div className="w-1/4 relative">
            <button className="flex items-center gap-2" onClick={() => setIsTimePickerVisible(!isTimePickerVisible)}>
              ⏰ {selectedTime ? selectedTime : "Choose time"}
            </button>
            {isTimePickerVisible && (
              <div className="absolute top-full mt-2 bg-white rounded-lg shadow-lg p-2 z-10">
                {timeOptions.map((time) => (
                  <div 
                    key={time} 
                    className="cursor-pointer hover:bg-red-100 text-red-500 rounded-full px-4 py-1 my-1"
                    onClick={() => {
                      setSelectedTime(time); 
                      setIsTimePickerVisible(false);
                    }}
                  >
                    {time}
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Fetch Pet Services Button */}
          <button onClick={fetchNearbyPlaces} className="bg-black text-white rounded-full px-6 py-2">
            Find Pet Services
          </button>
        </div>

        {/* Display Nearby Services */}
        <div className="mt-4 p-4 bg-white rounded-lg shadow-lg w-3/4">
          <h2 className="text-xl font-semibold">Nearby Pet Services</h2>
          <ul>
            {Array.isArray(nearbyPlaces) && nearbyPlaces.length > 0 ? (
              nearbyPlaces.map((place: any) => (
                <li key={place.place_id} className="p-2 border-b">
                  <strong>{place.name}</strong>
                  <p>{place.vicinity}</p>
                </li>
              ))
            ) : (
              <p className="text-gray-500">No pet services found.</p>
            )}
          </ul>
        </div>
      </div>
    </LoadScript>
  );
}
