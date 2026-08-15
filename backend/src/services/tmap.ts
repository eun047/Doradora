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

  const responseText = await response.text();

  if (!response.ok) {
    console.error("TMAP API 오류:", {
      status: response.status,
      body: responseText,
      startX,
      startY,
      endX,
      endY,
    });

    throw new Error(`TMAP API 요청 실패: ${response.status} ${responseText}`);
  }

  const data = JSON.parse(responseText) as WalkingRouteResponse;

  const coordinates = data.features
    .filter((feature) => feature.geometry.type === "LineString")
    .flatMap((feature) => feature.geometry.coordinates);

  return coordinates;
}

type Point = {
  latitude: number;
  longitude: number;
};

export async function getWalkingRouteThroughWaypoints(points: Point[]) {
  const allCoordinates: number[][] = [];

  for (let i = 0; i < points.length - 1; i++) {
    const start = points[i];
    const end = points[i + 1];

    console.log(`TMAP 구간 ${i + 1}/${points.length - 1}:`, {
      start,
      end,
    });

    const coordinates = await getWalkingRoute({
      startX: start.longitude,
      startY: start.latitude,
      endX: end.longitude,
      endY: end.latitude,
    });

    if (i === 0) {
      allCoordinates.push(...coordinates);
    } else {
      allCoordinates.push(...coordinates.slice(1));
    }
  }

  return allCoordinates;
}
