import { useEffect, useRef } from "react";
import { watchLocation } from "../services/location";
import { requestWalkingRoute } from "../services/tmap";
// import { requestWaypoints } from "../services/waypoint";
import type { Point } from "../types/map";
import { DEFAULT_SHAPE, type Shape } from "../types/shape";
import "../types/tmap";
import { createLatLng, createRoutePath } from "../utils/map";

const USE_TEST_LOCATION = true;

const TEST_LOCATION = {
  latitude: 37.5663,
  longitude: 126.9779,
};

const TEST_WAYPOINTS: Point[] = [
  // P1
  {
    latitude: 37.5672,
    longitude: 126.9762,
  },

  // P2
  {
    latitude: 37.5688,
    longitude: 126.9754,
  },

  // P3
  {
    latitude: 37.5701,
    longitude: 126.9757,
  },

  // P4 — 왼쪽 봉우리
  {
    latitude: 37.5707,
    longitude: 126.977,
  },

  // P5 — 가운데 홈
  {
    latitude: 37.5697,
    longitude: 126.9779,
  },

  // P6 — 오른쪽 봉우리
  {
    latitude: 37.5707,
    longitude: 126.9788,
  },

  // P7
  {
    latitude: 37.5701,
    longitude: 126.9801,
  },

  // P8
  {
    latitude: 37.5688,
    longitude: 126.9804,
  },

  // P9
  {
    latitude: 37.5672,
    longitude: 126.9796,
  },

  // P10
  {
    latitude: 37.5664,
    longitude: 126.9789,
  },

  // P11 — 아래쪽 끝으로 이어지는 지점
  {
    latitude: 37.5658,
    longitude: 126.9782,
  },
];

interface MapProps {
  selectedShape?: Shape;
}

const ROUTE_COLOR = "#84CC16";
const GPS_COLOR = "#FF6B4A";

const calculateBearing = (
  previous: {
    latitude: number;
    longitude: number;
  },
  current: {
    latitude: number;
    longitude: number;
  },
) => {
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
};

const createArrowIcon = (bearing: number) => {
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
          fill="${ROUTE_COLOR}"
          stroke="white"
          stroke-width="2.5"
          stroke-linejoin="round"
        />
      </g>
    </svg>
  `;

  return `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(svg)}`;
};

function Map({ selectedShape = DEFAULT_SHAPE }: MapProps) {
  const mapRef = useRef<HTMLDivElement | null>(null);

  const mapInstanceRef = useRef<{
    zoomIn?: () => void;
    zoomOut?: () => void;
  } | null>(null);

  const markerRef = useRef<{
    setPosition: (position: unknown) => void;
    setIcon?: (icon: unknown) => void;
  } | null>(null);

  const gpsPathRef = useRef<unknown[]>([]);

  const gpsPolylineRef = useRef<{
    setPath: (path: unknown[]) => void;
  } | null>(null);

  const routePolylineRef = useRef<{
    setPath: (path: unknown[]) => void;
  } | null>(null);

  const routeRequestedRef = useRef(false);

  const previousPositionRef = useRef<{
    latitude: number;
    longitude: number;
  } | null>(null);

  useEffect(() => {
    const stopWatching = watchLocation(
      async (position) => {
        const latitude = USE_TEST_LOCATION
          ? TEST_LOCATION.latitude
          : position.coords.latitude;

        const longitude = USE_TEST_LOCATION
          ? TEST_LOCATION.longitude
          : position.coords.longitude;

        const currentPosition = createLatLng(latitude, longitude);

        const currentPoint = {
          latitude,
          longitude,
        };

        let bearing = 0;

        if (previousPositionRef.current) {
          const previousPosition = previousPositionRef.current;

          const movedDistance =
            Math.abs(latitude - previousPosition.latitude) +
            Math.abs(longitude - previousPosition.longitude);

          if (movedDistance > 0.000001) {
            bearing = calculateBearing(previousPosition, currentPoint);
          }
        }

        previousPositionRef.current = currentPoint;

        gpsPathRef.current.push(currentPosition);

        if (!mapInstanceRef.current) {
          mapInstanceRef.current = new window.Tmapv2.Map(mapRef.current!, {
            center: currentPosition,
            width: "100%",
            height: "100%",
            zoom: 15,
            zoomControl: false,
          });

          markerRef.current = new window.Tmapv2.Marker({
            position: currentPosition,
            map: mapInstanceRef.current,
            icon: createArrowIcon(bearing),
            iconSize: new window.Tmapv2.Size(48, 48),
          });

          gpsPolylineRef.current = new window.Tmapv2.Polyline({
            path: gpsPathRef.current,
            map: mapInstanceRef.current,
            strokeColor: GPS_COLOR,
            strokeWeight: 6,
            strokeOpacity: 1,
          });
        }

        markerRef.current?.setPosition(currentPosition);

        markerRef.current?.setIcon?.(createArrowIcon(bearing));

        gpsPolylineRef.current?.setPath(gpsPathRef.current);

        if (routeRequestedRef.current) {
          return;
        }

        routeRequestedRef.current = true;

        try {
          /*
           * 현재는 Gemini 대신 테스트 waypoint를 사용합니다.
           *
           * 나중에 Gemini를 다시 사용할 때:
           * 1. 위의 requestWaypoints import 주석 해제
           * 2. 아래 테스트 waypoint 부분 주석 처리
           * 3. Gemini waypoint 부분 주석 해제
           */

          const points: Point[] = [
            {
              latitude,
              longitude,
            },
            ...TEST_WAYPOINTS,
            {
              latitude,
              longitude,
            },
          ];

          /*
          const waypoints = await requestWaypoints(
            latitude,
            longitude,
            selectedShape,
          );

          const points: Point[] = [
            {
              latitude,
              longitude,
            },
            ...waypoints,
            {
              latitude,
              longitude,
            },
          ];
          */

          console.log(`${selectedShape} 테스트 경로 points:`, points);

          const route = await requestWalkingRoute(points);

          const routePath = createRoutePath(route);

          routePolylineRef.current = new window.Tmapv2.Polyline({
            path: routePath,
            map: mapInstanceRef.current,
            strokeColor: ROUTE_COLOR,
            strokeWeight: 6,
            strokeOpacity: 1,
          });

          console.log(`${selectedShape} TMAP 경로 표시 완료`);
        } catch (error) {
          console.error(`${selectedShape} 경로를 가져오지 못했습니다.`, error);

          routeRequestedRef.current = false;
        }
      },
      (error) => {
        console.error("현재 위치를 추적하지 못했습니다.", error);
      },
    );

    return () => {
      stopWatching();
    };
  }, [selectedShape]);

  const handleZoomIn = () => {
    mapInstanceRef.current?.zoomIn?.();
  };

  const handleZoomOut = () => {
    mapInstanceRef.current?.zoomOut?.();
  };

  return (
    <div className="relative h-full w-full">
      <div
        ref={mapRef}
        className="h-full w-full [&_div[class*='tmap']]:bottom-6! [&_div[class*='tmap']]:left-4! [&_div[class*='tmap']]:right-auto! [&_div[class*='tmap']]:top-auto!"
      />

      <div className="absolute top-6 left-4 z-40 flex flex-col overflow-hidden rounded-2xl border-2 border-[#09402e]/20 bg-white/90 shadow-lg backdrop-blur-md">
        <button
          type="button"
          onClick={handleZoomIn}
          className="flex h-10 w-10 cursor-pointer items-center justify-center border-b border-gray-200 text-xl font-bold text-[#3e2723] transition-all hover:bg-black/5 active:scale-95"
          aria-label="지도 확대"
        >
          +
        </button>

        <button
          type="button"
          onClick={handleZoomOut}
          className="flex h-10 w-10 cursor-pointer items-center justify-center text-xl font-bold text-[#3e2723] transition-all hover:bg-black/5 active:scale-95"
          aria-label="지도 축소"
        >
          −
        </button>
      </div>
    </div>
  );
}

export default Map;
