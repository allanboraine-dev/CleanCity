"use client";

import { useEffect, useState, useRef } from "react";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import { supabase } from "@/../lib/supabaseClient";
import { Truck, ArrowLeft, Clock, MapPin, AlertTriangle } from "lucide-react";
import dynamic from "next/dynamic";

// Dynamically import the MapComponent to avoid SSR window issues with Leaflet
const MapComponent = dynamic(() => import("@/components/MapComponent"), { ssr: false });
import { truckRoutes } from "@/lib/routeData";

interface FleetData {
  latitude: number;
  longitude: number;
  status_message: string;
  completion_percentage: number;
  ward_name: string;
  service_interrupted: boolean;
  interruption_reason: string | null;
}

export default function TrackTruck() {
  const params = useParams();
  const searchParams = useSearchParams();
  const router = useRouter();
  const truckId = params.truckId as string;
  const wardParam = searchParams.get("ward");

  const [fleetData, setFleetData] = useState<FleetData | null>(null);
  const [streetAddress, setStreetAddress] = useState<string>("Locating street...");
  const lastGeocodedCoords = useRef({ lat: 0, lng: 0 });

  useEffect(() => {
    // 1. Fetch initial truck data
    const fetchInitialData = async () => {
      const { data, error } = await supabase
        .from("fleet")
        .select("*")
        .eq("truck_id", truckId)
        .single();

      if (data && !error) {
        setFleetData(data);
      }
    };

    fetchInitialData();

    // 2. Subscribe to realtime updates for this truck
    const channel = supabase
      .channel("fleet_updates")
      .on(
        "postgres_changes",
        {
          event: "UPDATE",
          schema: "public",
          table: "fleet",
          filter: `truck_id=eq.${truckId}`,
        },
        (payload) => {
          const newData = payload.new as FleetData;
          setFleetData(newData);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [truckId]);

  useEffect(() => {
    if (!fleetData) return;

    // Only reverse geocode if moved significantly (approx ~30 meters)
    const dLat = Math.abs(fleetData.latitude - lastGeocodedCoords.current.lat);
    const dLng = Math.abs(fleetData.longitude - lastGeocodedCoords.current.lng);
    
    if (dLat < 0.0003 && dLng < 0.0003 && lastGeocodedCoords.current.lat !== 0) {
      return;
    }

    const fetchAddress = async () => {
      try {
        const res = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${fleetData.latitude}&lon=${fleetData.longitude}`, {
          headers: {
            "Accept-Language": "en-US,en;q=0.9",
          }
        });
        const data = await res.json();
        if (data && data.address) {
          const street = data.address.road || data.address.pedestrian || data.address.suburb || data.address.neighbourhood || "Unknown Area";
          setStreetAddress(street);
          lastGeocodedCoords.current = { lat: fleetData.latitude, lng: fleetData.longitude };
        }
      } catch (err) {
        console.error("Geocoding failed", err);
      }
    };

    const timeout = setTimeout(fetchAddress, 1000);
    return () => clearTimeout(timeout);
  }, [fleetData?.latitude, fleetData?.longitude]);

  if (!fleetData) {
    return (
      <div className="h-screen w-full flex flex-col items-center justify-center bg-white">
        <div className="w-16 h-16 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin"></div>
        <p className="mt-4 text-emerald-700 font-medium">Locating Truck...</p>
      </div>
    );
  }

  return (
    <div className="relative h-[100dvh] w-full bg-slate-900 overflow-hidden font-sans">
      {/* Map Layer */}
      <div className="absolute inset-0 z-0">
        <MapComponent 
          latitude={fleetData.latitude} 
          longitude={fleetData.longitude} 
          serviceInterrupted={fleetData.service_interrupted}
          routePath={truckRoutes[truckId] || []}
        />
        {/* Subtle vignette over the map for premium feel */}
        <div className="absolute inset-0 pointer-events-none shadow-[inset_0_0_150px_rgba(0,0,0,0.15)] z-10"></div>
      </div>

      {/* Floating Glass Header */}
      <div className="absolute top-6 left-0 right-0 z-20 px-4 sm:px-6 pointer-events-none flex justify-center">
        <div className="w-full max-w-xl bg-white/80 backdrop-blur-xl shadow-2xl rounded-3xl p-2 flex items-center justify-between border border-white/60 pointer-events-auto transition-all duration-500 hover:shadow-emerald-500/20">
          <button 
            onClick={() => router.push("/")}
            className="p-3 bg-slate-50 hover:bg-emerald-50 text-slate-700 hover:text-emerald-700 rounded-2xl transition-all duration-300 group"
          >
            <ArrowLeft size={22} className="transform group-hover:-translate-x-1 transition-transform" />
          </button>
          
          <div className="flex-1 text-center px-2">
            <h2 className="font-extrabold text-slate-800 text-[1.1rem] tracking-tight flex justify-center items-center gap-2">
              CleanCity Live
              {!fleetData.service_interrupted && (
                <span className="relative flex h-2.5 w-2.5">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
                </span>
              )}
            </h2>
            <p className="text-xs font-semibold text-emerald-600/80 uppercase tracking-widest mt-0.5">{wardParam || fleetData.ward_name}</p>
          </div>
          
          <div className="p-3 bg-emerald-100/50 text-emerald-700 rounded-2xl">
            <Truck size={22} />
          </div>
        </div>
      </div>

      {/* Floating Bottom Dashboard */}
      <div className="absolute bottom-6 sm:bottom-6 left-0 right-0 z-20 px-3 sm:px-6 pointer-events-none flex justify-center pb-safe">
        <div className="bg-white/90 backdrop-blur-2xl rounded-[1.5rem] sm:rounded-[2rem] shadow-[0_20px_60px_-15px_rgba(0,0,0,0.2)] border border-white p-4 sm:p-8 w-full max-w-xl pointer-events-auto transition-transform duration-500 transform hover:-translate-y-2 max-h-[45vh] sm:max-h-none overflow-y-auto no-scrollbar">
          
          {/* Main Status Area */}
          <div className="flex items-start gap-3 sm:gap-5 mb-4 sm:mb-8">
            <div className={`p-3 sm:p-4 rounded-xl sm:rounded-2xl shadow-inner flex items-center justify-center shrink-0 ${fleetData.service_interrupted ? 'bg-red-50 text-red-500' : 'bg-emerald-50 text-emerald-500'}`}>
              {fleetData.service_interrupted ? <AlertTriangle className="w-6 h-6 sm:w-8 sm:h-8" /> : <MapPin className="w-6 h-6 sm:w-8 sm:h-8" />}
            </div>
            <div className="flex-1">
              <p className={`text-xs font-bold uppercase tracking-widest mb-1 ${fleetData.service_interrupted ? 'text-red-500' : 'text-emerald-500'}`}>
                {fleetData.service_interrupted ? 'Service Interruption' : 'Current Activity'}
              </p>
              <h3 className="text-xl sm:text-2xl font-black text-slate-800 leading-tight">
                {fleetData.service_interrupted ? fleetData.interruption_reason : fleetData.status_message}
              </h3>
              <p className="text-sm sm:text-base text-slate-500 font-medium mt-1 sm:mt-1.5 flex items-center gap-1.5">
                <MapPin size={14} className="text-slate-400 shrink-0" />
                <span className="truncate">Currently at: {streetAddress}</span>
              </p>
            </div>
          </div>

          {/* Progress Section */}
          <div className="mb-4 sm:mb-6 bg-slate-50 p-3 sm:p-5 rounded-2xl sm:rounded-3xl border border-slate-100 shrink-0">
            <div className="flex justify-between items-end mb-2 sm:mb-3">
              <span className="text-[10px] sm:text-sm font-bold text-slate-400 uppercase tracking-wide">Route Progress</span>
              <span className="text-xl sm:text-2xl font-black text-emerald-600">
                {fleetData.completion_percentage}%
              </span>
            </div>
            
            {/* Styled Progress Bar */}
            <div className="relative w-full h-3 bg-slate-200/50 rounded-full overflow-hidden shadow-inner">
              <div 
                className={`absolute top-0 left-0 h-full rounded-full transition-all duration-1000 ease-out ${fleetData.service_interrupted ? 'bg-gradient-to-r from-red-400 to-red-500' : 'bg-gradient-to-r from-emerald-400 to-emerald-600 shadow-[0_0_10px_rgba(16,185,129,0.5)]'}`}
                style={{ width: `${fleetData.completion_percentage}%` }}
              >
                {/* Shine effect on progress bar */}
                <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-b from-white/30 to-transparent"></div>
              </div>
            </div>
          </div>

          {/* Estimated Arrival / Footer */}
          <div className={`flex items-center gap-3 sm:gap-4 p-3 sm:p-4 rounded-xl sm:rounded-2xl border shrink-0 ${fleetData.service_interrupted ? 'bg-red-50/50 border-red-100 text-red-800' : 'bg-amber-50/50 border-amber-100 text-amber-900'}`}>
            <div className={`${fleetData.service_interrupted ? 'text-red-400' : 'text-amber-500'} flex items-center justify-center shrink-0`}>
              <Clock className="w-5 h-5 sm:w-6 sm:h-6" />
            </div>
            <div>
              <p className="text-[10px] sm:text-xs font-bold uppercase tracking-wider opacity-60">Estimated Completion</p>
              <p className="font-bold text-sm sm:text-base mt-0.5">
                {fleetData.completion_percentage >= 100 
                  ? "Route Completed" 
                  : fleetData.service_interrupted 
                    ? "Delayed - Awaiting updates" 
                    : "Within 45 Minutes"}
              </p>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
