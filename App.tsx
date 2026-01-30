import React, { useState, useEffect } from 'react';
import { CameraBackground } from './components/CameraBackground';
import { Scene } from './components/Scene';
import { useDeviceSensors } from './hooks/useDeviceSensors';

export default function App() {
  const { gravity, sensorRef, permissionGranted, requestPermission } = useDeviceSensors();
  const [started, setStarted] = useState(false);
  const [showToast, setShowToast] = useState(false);

  const handleStart = async () => {
    await requestPermission();
    setStarted(true);
    // Show toast shortly after starting
    setShowToast(true);
  };

  // Hide toast automatically after 6 seconds
  useEffect(() => {
    if (showToast) {
      const timer = setTimeout(() => {
        setShowToast(false);
      }, 6000);
      return () => clearTimeout(timer);
    }
  }, [showToast]);

  if (!started) {
    return (
      <div className="relative h-screen w-screen bg-neutral-900 flex flex-col items-center justify-center text-white overflow-hidden">
        <div className="z-10 text-center px-6 max-w-md">
          <h1 className="text-4xl font-bold mb-4 bg-gradient-to-r from-red-500 to-orange-500 bg-clip-text text-transparent">
            AR Dice
          </h1>
          <p className="text-gray-300 mb-8">
            Experience 3D physics dice that react to your phone's movements.
            <br /><br />
            1. Place phone over a surface.
            <br />
            2. Tilt to slide dice.
            <br />
            3. Shake to roll.
          </p>
          <button
            onClick={handleStart}
            className="px-8 py-4 bg-red-600 hover:bg-red-500 text-white font-bold rounded-full shadow-lg transition-all transform hover:scale-105 active:scale-95"
          >
            Start Experience
          </button>
        </div>
        
        {/* Decorative background */}
        <div className="absolute inset-0 opacity-20 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-neutral-700 via-neutral-900 to-black"></div>
      </div>
    );
  }

  return (
    <div className="relative h-screen w-screen overflow-hidden select-none">
      {/* 1. The Camera Feed */}
      <CameraBackground />

      {/* 2. The 3D Scene */}
      <div className="absolute inset-0 z-10">
        <Scene gravity={gravity} sensorRef={sensorRef} />
      </div>

      {/* 3. Overlay UI */}
      <div 
        className={`absolute bottom-10 left-0 right-0 z-20 flex justify-center pointer-events-none transition-all duration-1000 ease-in-out transform ${
          showToast ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
        }`}
      >
         <div className="bg-black/60 backdrop-blur-md text-white px-6 py-3 rounded-full text-sm font-medium border border-white/10 shadow-xl text-center">
            Tap screen to calibrate view<br/>
            <span className="text-xs text-gray-400">Shake to roll</span>
         </div>
      </div>
    </div>
  );
}