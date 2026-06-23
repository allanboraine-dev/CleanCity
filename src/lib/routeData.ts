import routesJson from '../../routes.json';

const galesheweRouteCoords = [
  { lat: -28.728199, lng: 24.735258 },
  { lat: -28.727981, lng: 24.735258 },
  { lat: -28.727765, lng: 24.735254 },
  { lat: -28.727474, lng: 24.735247 },
  { lat: -28.727357, lng: 24.735245 },
  { lat: -28.727283, lng: 24.735243 },
  { lat: -28.727038, lng: 24.735231 },
  { lat: -28.727076, lng: 24.735444 },
  { lat: -28.727117, lng: 24.735632 },
  { lat: -28.727142, lng: 24.735803 },
  { lat: -28.727170, lng: 24.735974 },
  { lat: -28.727187, lng: 24.736100 },
  { lat: -28.727207, lng: 24.736333 },
  { lat: -28.727207, lng: 24.736390 },
  { lat: -28.727207, lng: 24.736488 },
  { lat: -28.727202, lng: 24.736672 },
  { lat: -28.727202, lng: 24.736892 },
  { lat: -28.727194, lng: 24.737158 },
  { lat: -28.727192, lng: 24.737384 },
  { lat: -28.727184, lng: 24.737861 },
  { lat: -28.727184, lng: 24.737886 },
  { lat: -28.727178, lng: 24.738378 },
  { lat: -28.727182, lng: 24.738910 },
  { lat: -28.727177, lng: 24.739069 },
  { lat: -28.727161, lng: 24.739650 },
  { lat: -28.727149, lng: 24.740699 },
  { lat: -28.727144, lng: 24.741099 },
  { lat: -28.727124, lng: 24.741663 },
  { lat: -28.727132, lng: 24.742134 }
];

export const truckRoutes: Record<string, {lat: number, lng: number}[]> = {
  'SP-TRUCK-GALESHEWE': galesheweRouteCoords,
  'SP-TRUCK-ROODEPAN': routesJson.Roodepan,
  'SP-TRUCK-CBD': routesJson.CBD,
  'SP-TRUCK-MONUMENT': routesJson.MonumentHeights,
  'SP-TRUCK-BEACONSFIELD': routesJson.Beaconsfield
};
