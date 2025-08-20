// frontend/src/components/Toast.js
'use client';

import { useEffect, useState } from 'react';

export default function Toast({ message, type, onClose }) {
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(false);
      onClose();
    }, 3000); // Hide after 3 seconds

    return () => clearTimeout(timer);
  }, [onClose]);

  if (!isVisible) return null;

  const bgColor = type === 'success' ? 'bg-green-500' : 'bg-red-500';

  return (
    <div className={`fixed bottom-4 right-4 p-4 rounded-lg shadow-lg text-white ${bgColor} z-50`}>
      {message}
      <button onClick={() => {
        setIsVisible(false);
        onClose();
      }} className="ml-4 font-bold">
        &times;
      </button>
    </div>
  );
}
