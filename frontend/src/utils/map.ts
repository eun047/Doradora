import type { Point } from "../types/map";
import "../types/tmap";

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
