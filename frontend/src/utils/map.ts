import { ROUTE_COLOR } from "../constants/map";
import type { Point } from "../types/map";
import type { TmapLatLng, TmapLatLngBounds } from "../types/tmap";

export function createLatLng(latitude: number, longitude: number) {
  return new window.Tmapv2.LatLng(latitude, longitude);
}

export function showWaypoints(map: unknown, waypoints: Point[]) {
  waypoints.forEach((point, index) => {
    const position = createLatLng(point.latitude, point.longitude);

    new window.Tmapv2.Marker({
      position,
      map,
    });

    new window.Tmapv2.Label({
      position,
      map,
      content: `P${index + 1}`,
    });
  });
}

export function createRoutePath(route: [number, number][]) {
  return route.map(
    ([longitude, latitude]) => createLatLng(latitude, longitude),
  );
}

export function calculateBearing(
  previous: Point,
  current: Point,
): number {
  const lat1 = (previous.latitude * Math.PI) / 180;
  const lat2 = (current.latitude * Math.PI) / 180;

  const deltaLongitude =
    ((current.longitude - previous.longitude) * Math.PI) / 180;

  const y = Math.sin(deltaLongitude) * Math.cos(lat2);

  const x =
    Math.cos(lat1) * Math.sin(lat2) -
    Math.sin(lat1) * Math.cos(lat2) * Math.cos(deltaLongitude);

  const bearing = (Math.atan2(y, x) * 180) / Math.PI;

  return (bearing + 360) % 360;
}

export function createArrowIcon(bearing: number, color = ROUTE_COLOR): string {
  const svg = `
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="48"
      height="48"
      viewBox="0 0 48 48"
    >
      <g transform="rotate(${bearing} 24 24)">
        <circle
          cx="24"
          cy="24"
          r="19"
          fill="white"
          fill-opacity="0.7"
        />

        <path
          d="M24 7L36 34L24 29L12 34L24 7Z"
          fill="${color}"
          stroke="white"
          stroke-width="2.5"
          stroke-linejoin="round"
        />
      </g>
    </svg>
  `;

  return `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(svg)}`;
}

export function calculateRouteBounds(
  currentPoint: Point,
  waypoints: Point[],
  routePath: unknown[],
  gpsPath: unknown[],
): TmapLatLngBounds | null {
  if (!window.Tmapv2?.LatLngBounds) return null;

  const bounds = new window.Tmapv2.LatLngBounds();
  const allPoints: Point[] = [currentPoint, ...waypoints];

  // routePath 좌표 추출
  (routePath as TmapLatLng[]).forEach((pt) => {
    if (!pt) return;
    if (typeof pt.lat === "function" && typeof pt.lng === "function") {
      allPoints.push({ latitude: pt.lat(), longitude: pt.lng() });
    } else if (typeof pt._lat === "number" && typeof pt._lng === "number") {
      allPoints.push({ latitude: pt._lat, longitude: pt._lng });
    } else if (
      typeof pt.latitude === "number" &&
      typeof pt.longitude === "number"
    ) {
      allPoints.push({ latitude: pt.latitude, longitude: pt.longitude });
    }
  });

  // GPS 경로 좌표 추출
  (gpsPath as TmapLatLng[]).forEach((pt) => {
    if (!pt) return;
    if (typeof pt.lat === "function" && typeof pt.lng === "function") {
      allPoints.push({ latitude: pt.lat(), longitude: pt.lng() });
    } else if (typeof pt._lat === "number" && typeof pt._lng === "number") {
      allPoints.push({ latitude: pt._lat, longitude: pt._lng });
    } else if (
      typeof pt.latitude === "number" &&
      typeof pt.longitude === "number"
    ) {
      allPoints.push({ latitude: pt.latitude, longitude: pt.longitude });
    }
  });

  if (allPoints.length === 0) return null;

  let minLat = allPoints[0].latitude;
  let maxLat = allPoints[0].latitude;
  let minLng = allPoints[0].longitude;
  let maxLng = allPoints[0].longitude;

  allPoints.forEach((p) => {
    if (p.latitude < minLat) minLat = p.latitude;
    if (p.latitude > maxLat) maxLat = p.latitude;
    if (p.longitude < minLng) minLng = p.longitude;
    if (p.longitude > maxLng) maxLng = p.longitude;
  });

  const latDelta = Math.max(maxLat - minLat, 0.001);
  const lngDelta = Math.max(maxLng - minLng, 0.001);

  // 줌 크기를 키우기 위해 여백을 5%로 설정
  const latMargin = latDelta * 0.05;
  const lngMargin = lngDelta * 0.05;

  bounds.extend(createLatLng(minLat - latMargin, minLng - lngMargin));
  bounds.extend(createLatLng(maxLat + latMargin, maxLng + lngMargin));

  return bounds;
}
