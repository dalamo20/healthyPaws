"use client";
import { useState } from "react";
import { Calendar } from "react-calendar";
import "react-calendar/dist/Calendar.css";
import { Combobox } from "@headlessui/react";

export default function Home() {
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [selectedService, setSelectedService] = useState("");
  const [isDatePickerVisible, setIsDatePickerVisible] = useState(false);
  const [isTimePickerVisible, setIsTimePickerVisible] = useState(false);

  const timeOptions = [
    "9:00 am",
    "9:30 am",
    "10:00 am",
    "10:30 am",
    "11:00 am",
    "11:30 am",
    "12:00 pm",
    "12:30 pm",
    "1:00 pm",
    "1:30 pm",
    "2:00 pm",
    "2:30 pm",
    "3:00 pm",
    "3:30 pm",
    "4:00 pm",
    "4:30 pm",
  ];

  const services = [
    "Pet grooming",
    "Pet boarding",
    "Pet training",
    "Pet treatment",
  ];

  return (
    <div className="h-screen w-screen bg-gradient-to-r from-pink-200 to-yellow-200 flex items-center justify-center">
      <div className="flex items-center rounded-full shadow-lg bg-white p-4 gap-4">
        {/* Services Dropdown */}
        <Combobox as="div" className="relative w-1/4" value={selectedService} onChange={setSelectedService}>
          <Combobox.Button className="flex items-center gap-2">
            🔍 <span>All treatments and venues</span>
          </Combobox.Button>
          <Combobox.Options className="absolute top-full mt-2 w-full bg-white rounded-lg shadow-lg p-2">
            <h3 className="font-semibold">Services</h3>
            {services.map((service) => (
              <Combobox.Option
                key={service}
                value={service}
                className="cursor-pointer hover:bg-gray-100 rounded p-2"
              >
                {service}
              </Combobox.Option>
            ))}
          </Combobox.Options>
        </Combobox>

        {/* Location Input */}
        <div className="w-1/4 flex items-center gap-2">
          📍
          <input
            type="text"
            placeholder="Current location"
            className="border-none focus:outline-none focus:ring-0"
          />
        </div>

        {/* Date Picker */}
        <div className="w-1/4 relative">
          <button className="flex items-center gap-2" onClick={() => setIsDatePickerVisible(!isDatePickerVisible)}>
            📍 Choose date
          </button>
          {isDatePickerVisible && (
            <div className="absolute top-full mt-2 bg-white rounded-lg shadow-lg">
              <Calendar onChange={setSelectedDate} value={selectedDate} className="rounded-lg" />
            </div>
          )}
        </div>

        {/* Time Picker */}
        <div className="w-1/4 relative">
          <button className="flex items-center gap-2" onClick={() => setIsTimePickerVisible(!isTimePickerVisible)}>
            ⏰ Choose time
          </button>
          {isTimePickerVisible && (
            <div className="absolute top-full mt-2 bg-white rounded-lg shadow-lg p-2">
              {timeOptions.map((time) => (
                <div
                  key={time}
                  className="cursor-pointer hover:bg-red-100 text-red-500 rounded-full px-4 py-1 my-1"
                >
                  {time}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Search Button */}
        <button className="bg-black text-white rounded-full px-6 py-2">Search</button>
      </div>
    </div>
  );
}
