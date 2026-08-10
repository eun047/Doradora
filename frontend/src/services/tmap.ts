import type { Point } from "../types/map";

type WalkingRouteResponse = {
  route: [number, number][];
};

export async function requestWalkingRoute(
  points: Point[],
): Promise<[number, number][]> {
  const routeResponse = await fetch(
    "http://localhost:5001/api/routes/walking/waypoints",
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        points,
      }),
    },
  );

  if (!routeResponse.ok) {
    throw new Error(`TMAP 전체 경로 요청 실패: ${routeResponse.status}`);
  }

  const routeData = (await routeResponse.json()) as WalkingRouteResponse;

  return routeData.route;
}
