const TMAP_API_URL = "https://apis.openapi.sk.com/tmap/routes/pedestrian";

interface WalkingRouteRequest {
  startX: number;
  startY: number;
  endX: number;
  endY: number;
}

interface WalkingRouteResponse {
  type: string;
  features: {
    type: string;
    geometry: {
      type: string;
      coordinates: number[][];
    };
  }[];
}

export async function getWalkingRoute({
  startX,
  startY,
  endX,
  endY,
}: WalkingRouteRequest) {
  const response = await fetch(`${TMAP_API_URL}?version=1`, {
    method: "POST",
    headers: {
      accept: "application/json",
      "Content-Type": "application/json",
      appKey: process.env.TMAP_API_KEY ?? "",
    },
    body: JSON.stringify({
      startX,
      startY,
      endX,
      endY,
      startName: "출발지",
      endName: "도착지",
      reqCoordType: "WGS84GEO",
      resCoordType: "WGS84GEO",
      searchOption: "0",
      sort: "index",
    }),
  });

  if (!response.ok) {
    throw new Error(`TMAP API 요청 실패: ${response.status}`);
  }

  const data = (await response.json()) as WalkingRouteResponse;

  const coordinates = data.features
    .filter((feature) => feature.geometry.type === "LineString")
    .flatMap((feature) => feature.geometry.coordinates);

  return coordinates;
}
