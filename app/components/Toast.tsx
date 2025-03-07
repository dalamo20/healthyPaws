"use client";
import { useState, useEffect } from "react";

export default function Toast({ message, onClose }: { message: string; onClose: () => void }) {
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setVisible(false);
      onClose();
    }, 3000); 

    return () => clearTimeout(timer);
  }, [onClose]);

  if (!visible) return null;

  return (
    <div className="fixed top-5 left-1/2 transform -translate-x-1/2 flex items-center w-full max-w-md p-4 space-x-4 text-gray-500 bg-white divide-x divide-gray-200 rounded-lg shadow-lg dark:text-gray-400 dark:divide-gray-700 dark:bg-gray-800">
      <svg className="w-5 h-5 text-blue-600 dark:text-blue-500 rotate-45" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 18 20">
        <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="m9 17 8 2L9 1 1 19l8-2Zm0 0V9" />
      </svg>
      <div className="ps-4 text-sm font-normal">{message}</div>
    </div>
  );
}
