"use client";
import { useState, useEffect, useRef } from "react";
import { Calendar } from "react-calendar";
import "react-calendar/dist/Calendar.css";
import { Combobox, ComboboxButton, ComboboxOptions, ComboboxOption } from "@headlessui/react";
import Navbar from "./components/Navbar";
import { LoadScript, Autocomplete } from "@react-google-maps/api";
import { auth } from "@/lib/firebase";
import { addBooking } from "@/lib/db";

export default function Home() {
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [selectedService, setSelectedService] = useState("");
  const [location, setLocation] = useState("");
  const [nearbyPlaces, setNearbyPlaces] = useState<any[]>([]);
  const [isDatePickerVisible, setIsDatePickerVisible] = useState(false);
  const [isTimePickerVisible, setIsTimePickerVisible] = useState(false);
  const [isMounted, setIsMounted] = useState(false);
  const [selectedTime, setSelectedTime] = useState("");
  const [userId, setUserId] = useState<string | null>(null);

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

    const unsubscribe = auth.onAuthStateChanged((user) => {
      setUserId(user ? user.uid : null);
    });
    return () => unsubscribe();
  }, []);

  const fetchNearbyPlaces = async () => {
    if (!location) return;
  
    try {
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

  const handlePlaceSelect = () => {
    if (autocompleteRef.current) {
      const place = autocompleteRef.current.getPlace();
      setLocation(place.formatted_address);
    }
  };

  const bookService = async (place: any) => {
    if (!userId) {
      alert("You must be logged in to book a service.");
      return;
    }

    if (!selectedService || !selectedDate || !selectedTime) {
      alert("Please select a service, date, and time.");
      return;
    }

    try {
      await addBooking(userId, {
        serviceName: selectedService,
        location: place.vicinity,
        date: selectedDate.toDateString(),
        time: selectedTime,
        placeName: place.name,
      });

      alert(`Booking confirmed for ${place.name}!`);
    } catch (error) {
      console.error("Error adding booking:", error);
    }
  };

  if (!isMounted) return null;

  return (
      <div className="h-screen w-screen bg-gradient-to-r from-pink-200 to-yellow-200 flex flex-col items-center justify-start relative">
        <Navbar />
        <div className="mt-20 flex items-center rounded-full shadow-lg bg-white p-4 gap-4 z-10">
          <Combobox value={selectedService} onChange={setSelectedService}>
            <div className="relative w-1/4">
              <ComboboxButton className="flex items-center gap-2">
                🔍 <span>{selectedService || "All treatments and venues"}</span>
              </ComboboxButton>
              <ComboboxOptions className="absolute top-full mt-2 w-full bg-white rounded-lg shadow-lg p-2 max-h-40 overflow-y-auto z-20">
                <h3 className="font-semibold">Services</h3>
                {services.map((service) => (
                  <ComboboxOption key={service} value={service} className="cursor-pointer hover:bg-gray-100 rounded p-2">
                    {service}
                  </ComboboxOption>
                ))}
              </ComboboxOptions>
            </div>
          </Combobox>

          <div className="w-1/4 flex items-center gap-2">
            📍
            <Autocomplete onLoad={(auto) => (autocompleteRef.current = auto)} onPlaceChanged={handlePlaceSelect}>
              <input type="text" placeholder="Enter city or state" className="border-none focus:outline-none focus:ring-0 w-full" value={location} onChange={(e) => setLocation(e.target.value)} />
            </Autocomplete>
          </div>

          <div className="w-1/4 relative">
            <button className="flex items-center gap-2" onClick={() => setIsDatePickerVisible(!isDatePickerVisible)}>
              📅 {selectedDate ? selectedDate.toDateString() : "Choose date"}
            </button>
            {isDatePickerVisible && (
              <div className="absolute top-full mt-2 bg-white rounded-lg shadow-lg z-20">
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

          <div className="w-1/4 relative">
            <button className="flex items-center gap-2" onClick={() => setIsTimePickerVisible(!isTimePickerVisible)}>
              ⏰ {selectedTime ? selectedTime : "Choose time"}
            </button>
            {isTimePickerVisible && (
              <div className="absolute top-full mt-2 bg-white/80 backdrop-blur-md rounded-lg shadow-lg p-2 z-20">
                {timeOptions.map((time) => (
                  <div key={time} className="cursor-pointer hover:bg-red-100 text-red-500 rounded-full px-4 py-1 my-1" onClick={() => { setSelectedTime(time); setIsTimePickerVisible(false); }}>
                    {time}
                  </div>
                ))}
              </div>
            )}
          </div>

          <button onClick={fetchNearbyPlaces} className="bg-black text-white rounded-full px-6 py-2 z-10">Find Pet Services</button>
        </div>

        <div className="mt-4 p-4 bg-white rounded-lg shadow-lg w-3/4 max-h-[300px] overflow-y-auto">
          <h2 className="text-xl font-semibold">Nearby Pet Services</h2>
          <ul>
            {nearbyPlaces.length > 0 ? nearbyPlaces.map((place: any) => (
              <li key={place.place_id} className="p-2 border-b flex justify-between items-center">
                <div>
                  <strong>{place.name}</strong>
                  <p>{place.vicinity}</p>
                </div>
                <button 
                  onClick={() => bookService(place)}
                  className="bg-red-500 text-white px-4 py-2 rounded-full hover:bg-red-700 transition"
                >
                  Book
                </button>
              </li>
            )) : <p className="text-gray-500">No pet services found.</p>}
          </ul>
        </div>
      </div>
  );
}
