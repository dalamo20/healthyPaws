"use client";
import { useState, useEffect, useRef } from "react";
import { Calendar } from "react-calendar";
import "react-calendar/dist/Calendar.css";
import { Combobox, ComboboxButton, ComboboxOptions, ComboboxOption } from "@headlessui/react";
import Navbar from "./components/Navbar";
import { LoadScript, Autocomplete } from "@react-google-maps/api";
import { auth } from "@/lib/firebase";
import { addBooking } from "@/lib/db";
import './globals.css';

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
    "9:00 AM", "9:30 AM", "10:00 AM", "10:30 AM",
    "11:00 AM", "11:30 AM", "12:00 PM", "12:30 PM",
    "1:00 PM", "1:30 PM", "2:00 PM", "2:30 PM",
    "3:00 PM", "3:30 PM", "4:00 PM", "4:30 PM"
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
    <div className="relative">
    <div className="background-wrapper">
      <div className="blob blob-1"></div>
      <div className="blob blob-2"></div>
    </div>
      <div className="h-screen w-screen flex flex-col items-center justify-start relative">
        <Navbar />
        <h1 className="mt-32 text-4xl font-semibold">Book Local Pet Services</h1>
        <p className="mt-6">From grooming to pet training services</p>
        <div className="mt-20 flex items-center rounded-full shadow-lg bg-white p-4 gap-4">
          <Combobox value={selectedService} onChange={setSelectedService}>
            <div className="relative w-1/4">
              <ComboboxButton className="flex items-center gap-2 hover:bg-gray-100">
                🔍 <span>{selectedService || "All services"}</span>
              </ComboboxButton>
              <ComboboxOptions className="absolute top-full mt-8 w-full bg-white rounded-lg shadow-lg p-2 max-h-auto overflow-y-auto z-20">
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
            <Autocomplete onLoad={(auto) => (autocompleteRef.current = auto)} onPlaceChanged={handlePlaceSelect}>
              <input type="text" placeholder="Enter city or state" className="border-none focus:outline-none focus:ring-0 w-full hover:bg-gray-100" value={location} onChange={(e) => setLocation(e.target.value)} />
            </Autocomplete>
          </div>

          <div className="w-1/4 relative">
            <button className="flex items-center gap-2 hover:bg-gray-100" onClick={() => setIsDatePickerVisible(!isDatePickerVisible)}>
              📅 {selectedDate ? selectedDate.toDateString() : "Choose date"}
            </button>
            {isDatePickerVisible && (
              <div className="absolute right-[-75px] top-full mt-8 bg-white rounded-lg shadow-lg z-20">
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
            <button 
              onClick={() => setIsTimePickerVisible(!isTimePickerVisible)} 
              className="flex items-center w-full py-2 px-5 text-sm font-medium bg-white rounded-lg hover:bg-gray-100 focus:z-10 focus:ring-4 focus:ring-gray-100"
            >
              ⏰ {selectedTime || "Pick a time"}
            </button>
            
            {isTimePickerVisible && (
              <ul className="absolute top-full mt-2 bg-white rounded-lg shadow-lg p-2 w-full grid grid-cols-2 gap-2">
                {timeOptions.map((time) => (
                  <li key={time}>
                    <input 
                      type="radio" 
                      id={time} 
                      name="timetable" 
                      className="hidden peer" 
                      onChange={() => {
                        setSelectedTime(time); // Set time
                        setIsTimePickerVisible(false); // Hide picker
                      }} 
                    />
                    <label htmlFor={time} className="block text-center cursor-pointer px-18 py-2 bg-white border rounded-lg hover:bg-blue-500 hover:text-white peer-checked:bg-blue-600 peer-checked:text-white">
                      {time}
                    </label>
                  </li>
                ))}
              </ul>
            )}
          </div>

          <button onClick={fetchNearbyPlaces} className="bg-black text-white rounded-full px-6 py-2 z-5">Search</button>
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
    </div>
  );
}
