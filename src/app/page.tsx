"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Truck, MapPin } from "lucide-react";

export default function Home() {
  const router = useRouter();
  const [selectedWard, setSelectedWard] = useState("");

  const wards = [
    "Ward 1 - Roodepan",
    "Ward 12 - Galeshewe",
    "Royldene",
    "Monument Heights",
    "CBD",
  ];

  const handleTrack = () => {
    if (selectedWard) {
      let truckId = 'SP-TRUCK-GALESHEWE';
      if (selectedWard === 'Ward 1 - Roodepan') truckId = 'SP-TRUCK-ROODEPAN';
      else if (selectedWard === 'CBD') truckId = 'SP-TRUCK-CBD';
      else if (selectedWard === 'Monument Heights') truckId = 'SP-TRUCK-MONUMENT';
      else if (selectedWard === 'Beaconsfield') truckId = 'SP-TRUCK-BEACONSFIELD';
      
      router.push(`/track/${truckId}?ward=${encodeURIComponent(selectedWard)}`);
    }
  };

  return (
    <div className="min-h-screen bg-white flex flex-col items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-3xl shadow-xl border border-emerald-50 overflow-hidden">
        {/* Header Section */}
        <div className="bg-emerald-600 p-8 text-center text-white relative overflow-hidden">
          <div className="absolute top-0 right-0 p-4 opacity-20">
            <Truck size={100} />
          </div>
          <div className="relative z-10 flex justify-center mb-4">
            <div className="bg-white p-3 rounded-full text-emerald-600 shadow-lg">
              <Truck size={32} />
            </div>
          </div>
          <h1 className="text-3xl font-bold mb-2 relative z-10">CleanCity Tracker</h1>
          <p className="text-emerald-100 font-medium relative z-10">Sol Plaatje Municipality</p>
        </div>

        {/* Form Section */}
        <div className="p-8">
          <h2 className="text-xl font-bold text-slate-800 mb-6 text-center">
            Towards a Cleaner Growing City
          </h2>

          <div className="space-y-6">
            <div>
              <label htmlFor="ward" className="block text-sm font-semibold text-slate-600 mb-2">
                Select your Ward / Suburb
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <MapPin className="h-5 w-5 text-emerald-500" />
                </div>
                <select
                  id="ward"
                  value={selectedWard}
                  onChange={(e) => setSelectedWard(e.target.value)}
                  className="block w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-700 font-medium focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all appearance-none"
                >
                  <option value="" disabled>Choose your area...</option>
                  {wards.map((ward) => (
                    <option key={ward} value={ward}>
                      {ward}
                    </option>
                  ))}
                </select>
                <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                  <svg className="h-5 w-5 text-slate-400" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                  </svg>
                </div>
              </div>
            </div>

            <button
              onClick={handleTrack}
              disabled={!selectedWard}
              className={`w-full py-4 rounded-xl font-bold text-lg shadow-lg transition-all flex justify-center items-center gap-2 ${
                selectedWard 
                  ? "bg-amber-400 hover:bg-amber-500 text-slate-900 cursor-pointer transform hover:-translate-y-1" 
                  : "bg-slate-200 text-slate-400 cursor-not-allowed"
              }`}
            >
              <Truck size={24} />
              Track My Truck
            </button>
          </div>
        </div>
      </div>
      
      <p className="text-slate-400 text-sm mt-8">
        &copy; {new Date().getFullYear()} Sol Plaatje Municipality
      </p>
    </div>
  );
}
