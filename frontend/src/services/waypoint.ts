import type { Point } from "../types/map";
import type { Shape } from "../types/shape";

export async function requestWaypoints(
  latitude: number,
  longitude: number,
  shape: Shape,
): Promise<Point[]> {
  const waypointResponse = await fetch("http://localhost:5001/api/waypoints", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      latitude,
      longitude,
      shape,
    }),
  });

  if (!waypointResponse.ok) {
    throw new Error(
      `${shape} waypoint 요청 실패: ${waypointResponse.status}`,
    );
  }

  const waypointData = (await waypointResponse.json()) as {
    waypoints: Point[];
  };

  return waypointData.waypoints;
}
