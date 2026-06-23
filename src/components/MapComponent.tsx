"use client";

import { useEffect } from "react";
import { MapContainer, TileLayer, Marker, Polyline, useMap } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

// Fix leaflet icon issue in Next.js
// eslint-disable-next-line @typescript-eslint/no-explicit-any
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
});

// CSS injected to smoothly animate Leaflet markers instead of jumping
if (typeof document !== "undefined") {
  const style = document.createElement("style");
  style.innerHTML = `
    .custom-leaflet-icon {
      transition: transform 2s linear !important;
    }
  `;
  document.head.appendChild(style);
}

interface MapComponentProps {
  latitude: number;
  longitude: number;
  serviceInterrupted: boolean;
  routePath?: { lat: number, lng: number }[];
}

const createTruckIcon = (interrupted: boolean) => {
  const colorClass = interrupted ? 'bg-red-600' : 'bg-emerald-600';
  const pingClass = interrupted ? '' : '<div class="absolute w-12 h-12 bg-emerald-400 rounded-full animate-ping opacity-50 -left-1 -top-1"></div>';
  
  const html = `
    <div class="relative flex justify-center items-center">
      ${pingClass}
      <div class="${colorClass} text-white p-2 rounded-full shadow-lg border-2 border-white relative z-10 flex items-center justify-center" style="width: 40px; height: 40px;">
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M10 17h4V5H2v12h3"/><path d="M20 17h2v-3.34a4 4 0 0 0-1.17-2.83L19 9h-5"/><path d="M14 17h1"/><circle cx="7.5" cy="17.5" r="2.5"/><circle cx="17.5" cy="17.5" r="2.5"/></svg>
      </div>
    </div>
  `;

  return new L.DivIcon({
    html,
    className: 'custom-leaflet-icon',
    iconSize: [40, 40],
    iconAnchor: [20, 20],
  });
};

function MapUpdater({ lat, lng }: { lat: number, lng: number }) {
  const map = useMap();
  useEffect(() => {
    map.flyTo([lat, lng], map.getZoom(), { animate: true, duration: 1 });
  }, [lat, lng, map]);
  return null;
}

export default function MapComponent({ latitude, longitude, serviceInterrupted, routePath }: MapComponentProps) {
  const polylinePositions = routePath ? routePath.map(p => [p.lat, p.lng] as [number, number]) : [];

  return (
    <MapContainer
      center={[latitude, longitude]}
      zoom={16}
      style={{ width: "100%", height: "100%" }}
      zoomControl={false}
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      <MapUpdater lat={latitude} lng={longitude} />
      {polylinePositions.length > 0 && (
        <Polyline positions={polylinePositions} color="#10b981" weight={5} opacity={0.7} dashArray="10, 10" />
      )}
      <Marker
        position={[latitude, longitude]}
        icon={createTruckIcon(serviceInterrupted)}
      />
    </MapContainer>
  );
}
