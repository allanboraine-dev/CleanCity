/* eslint-disable @typescript-eslint/no-require-imports */
require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error("Missing NEXT_PUBLIC_SUPABASE_URL or NEXT_PUBLIC_SUPABASE_ANON_KEY in environment variables.");
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

// Pre-existing Galeshewe route
const galesheweRoute = [
  { lat: -28.728199, lng: 24.735258, status: 'Starting Collection Route' },
  { lat: -28.727981, lng: 24.735258, status: 'Collecting Bins' },
  { lat: -28.727765, lng: 24.735254, status: 'Collecting Bins' },
  { lat: -28.727474, lng: 24.735247, status: 'Moving to next block' },
  { lat: -28.727357, lng: 24.735245, status: 'Collecting Bins' },
  { lat: -28.727283, lng: 24.735243, status: 'Collecting Bins' },
  { lat: -28.727038, lng: 24.735231, status: 'Turning the corner' },
  { lat: -28.727076, lng: 24.735444, status: 'Collecting Bins' },
  { lat: -28.727117, lng: 24.735632, status: 'Collecting Bins' },
  { lat: -28.727142, lng: 24.735803, status: 'Collecting Bins' },
  { lat: -28.727170, lng: 24.735974, status: 'Minor Traffic Delay' },
  { lat: -28.727187, lng: 24.736100, status: 'Collecting Bins' },
  { lat: -28.727207, lng: 24.736333, status: 'Mechanical Issue Detected', interrupted: true, reason: 'Engine Failure. Awaiting Tow.' },
  { lat: -28.727207, lng: 24.736390, status: 'Mechanical Issue Detected', interrupted: true, reason: 'Engine Failure. Awaiting Tow.' },
  { lat: -28.727207, lng: 24.736488, status: 'Mechanical Issue Detected', interrupted: true, reason: 'Engine Failure. Awaiting Tow.' },
  { lat: -28.727202, lng: 24.736672, status: 'Service Resumed. Collecting Bins' },
  { lat: -28.727202, lng: 24.736892, status: 'Collecting Bins' },
  { lat: -28.727194, lng: 24.737158, status: 'Finishing the block' },
  { lat: -28.727192, lng: 24.737384, status: 'Turning the corner' },
  { lat: -28.727184, lng: 24.737861, status: 'Collecting Bins' },
  { lat: -28.727184, lng: 24.737886, status: 'Collecting Bins' },
  { lat: -28.727178, lng: 24.738378, status: 'Continuing Route' },
  { lat: -28.727182, lng: 24.738910, status: 'Collecting Bins' },
  { lat: -28.727177, lng: 24.739069, status: 'Collecting Bins' },
  { lat: -28.727161, lng: 24.739650, status: 'Approaching Intersect' },
  { lat: -28.727149, lng: 24.740699, status: 'Collecting Bins' },
  { lat: -28.727144, lng: 24.741099, status: 'Collecting Bins' },
  { lat: -28.727124, lng: 24.741663, status: 'Finishing final street' },
  { lat: -28.727132, lng: 24.742134, status: 'En Route to Landfill' }
];

const externalRoutes = JSON.parse(fs.readFileSync('./routes.json', 'utf8'));

function generateRouteWithStatuses(coords) {
  return coords.map((c, i) => {
    let status = 'Collecting Bins';
    let interrupted = false;
    let reason = null;
    
    if (i === 0) status = 'Starting Collection Route';
    else if (i === coords.length - 1) status = 'En Route to Landfill';
    else if (i === Math.floor(coords.length / 2)) status = 'Continuing Route';
    else if (i % 15 === 0) status = 'Turning the corner';
    else if (i % 25 === 0) status = 'Minor Traffic Delay';
    
    // Inject a mechanical issue at roughly 70% of the route
    if (i === Math.floor(coords.length * 0.7)) {
      status = 'Mechanical Issue Detected';
      interrupted = true;
      reason = 'Engine Failure. Awaiting Tow.';
    }
    
    return { lat: c.lat, lng: c.lng, status, interrupted, reason };
  });
}

const fleetConfig = [
  { truckId: 'SP-TRUCK-GALESHEWE', ward: 'Ward 12 - Galeshewe', route: galesheweRoute },
  { truckId: 'SP-TRUCK-ROODEPAN', ward: 'Ward 1 - Roodepan', route: generateRouteWithStatuses(externalRoutes.Roodepan) },
  { truckId: 'SP-TRUCK-CBD', ward: 'CBD / City Centre', route: generateRouteWithStatuses(externalRoutes.CBD) },
  { truckId: 'SP-TRUCK-MONUMENT', ward: 'Monument Heights', route: generateRouteWithStatuses(externalRoutes.MonumentHeights) },
  { truckId: 'SP-TRUCK-BEACONSFIELD', ward: 'Beaconsfield', route: generateRouteWithStatuses(externalRoutes.Beaconsfield) }
];

const activeTrucks = fleetConfig.map(config => ({ ...config, currentIndex: 0 }));

async function updateAllTrucks() {
  console.log(`[${new Date().toISOString()}] Broadcasting updates for ${activeTrucks.length} trucks...`);
  
  for (const truck of activeTrucks) {
    const currentPoint = truck.route[truck.currentIndex];
    const completionPercentage = Math.round((truck.currentIndex / (truck.route.length - 1)) * 100);

    const { error } = await supabase
      .from('fleet')
      .upsert({
        truck_id: truck.truckId,
        ward_name: truck.ward,
        latitude: currentPoint.lat,
        longitude: currentPoint.lng,
        status_message: currentPoint.status,
        completion_percentage: completionPercentage,
        service_interrupted: currentPoint.interrupted || false,
        interruption_reason: currentPoint.reason || null,
        updated_at: new Date().toISOString()
      }, { onConflict: 'truck_id' });

    if (error) {
      console.error(`Error updating ${truck.truckId}:`, error.message);
    }

    truck.currentIndex++;
    if (truck.currentIndex >= truck.route.length) {
      truck.currentIndex = 0;
    }
  }
}

async function startSimulation() {
  console.log(`Starting Ghost Truck Simulator for 5 active zones!`);
  await updateAllTrucks();
  setInterval(updateAllTrucks, 2000);
}

startSimulation();
