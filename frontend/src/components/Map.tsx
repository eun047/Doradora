import {
  forwardRef,
  useEffect,
  useImperativeHandle,
  useRef,
  useState,
} from "react";
import html2canvas from "html2canvas";
import {
  GPS_COLOR,
  ROUTE_COLOR,
  TEST_LOCATION,
  TEST_WAYPOINTS,
  USE_TEST_LOCATION,
} from "../constants/map";
import { watchLocation } from "../services/location";
import { requestWalkingRoute } from "../services/tmap";
import MapZoomControls from "./MapZoomControls";
import type { Point } from "../types/map";
import { DEFAULT_SHAPE, type Shape } from "../types/shape";
import type {
  TmapMapInstance,
  TmapMarkerInstance,
  TmapPolylineInstance,
} from "../types/tmap";
import "../types/tmap";
import {
  calculateBearing,
  calculateRouteBounds,
  createArrowIcon,
  createLatLng,
  createRoutePath,
} from "../utils/map";

interface MapProps {
  selectedShape?: Shape;
}

export interface MapHandle {
  captureMap: () => Promise<string | null>;
}

const Map = forwardRef<MapHandle, MapProps>(function Map(
  { selectedShape = DEFAULT_SHAPE }: MapProps,
  ref,
) {
  const mapRef = useRef<HTMLDivElement | null>(null);
  const [isCapturingInternal, setIsCapturingInternal] = useState(false);

  const mapInstanceRef = useRef<TmapMapInstance | null>(null);
  const markerRef = useRef<TmapMarkerInstance | null>(null);

  const gpsPathRef = useRef<unknown[]>([]);
  const routePathRef = useRef<unknown[]>([]);

  const currentPointRef = useRef<Point>({
    latitude: TEST_LOCATION.latitude,
    longitude: TEST_LOCATION.longitude,
  });

  const gpsPolylineRef = useRef<TmapPolylineInstance | null>(null);
  const routePolylineRef = useRef<TmapPolylineInstance | null>(null);

  const routeRequestedRef = useRef(false);
  const isCapturingRef = useRef(false);

  const previousPositionRef = useRef<Point | null>(null);

  useImperativeHandle(
    ref,
    () => ({
      captureMap: async () => {
        if (isCapturingRef.current) return null;
        isCapturingRef.current = true;
        setIsCapturingInternal(true);

        try {
          // 1. 자동 줌: 전체 waypoint 및 경로가 들어오는 LatLngBounds 계산
          if (mapInstanceRef.current) {
            const bounds = calculateRouteBounds(
              currentPointRef.current,
              TEST_WAYPOINTS,
              routePathRef.current,
              gpsPathRef.current,
            );

            if (bounds) {
              mapInstanceRef.current.fitBounds?.(bounds);
            }
          }

          // 2. 렌더링 완료 대기 (타일 및 폴리라인 안착)
          await new Promise((resolve) => setTimeout(resolve, 750));

          // 3. 지도 내부 img 태그 crossOrigin 설정
          if (mapRef.current) {
            const images = mapRef.current.querySelectorAll("img");
            images.forEach((img) => {
              img.crossOrigin = "anonymous";
            });
          }

          // 4. 지도 영역 캡처
          const canvas = await html2canvas(mapRef.current!, {
            useCORS: true,
            allowTaint: true,
            scale: 2,
            logging: false,
            backgroundColor: "#96dcff",
          });

          return canvas.toDataURL("image/png");
        } catch (error) {
          console.error("지도 캡처 실패:", error);
          return null;
        } finally {
          setIsCapturingInternal(false);
          isCapturingRef.current = false;
        }
      },
    }),
    [],
  );

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

        const currentPoint: Point = {
          latitude,
          longitude,
        };

        currentPointRef.current = currentPoint;

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
            icon: createArrowIcon(bearing, ROUTE_COLOR),
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

        markerRef.current?.setIcon?.(createArrowIcon(bearing, ROUTE_COLOR));

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
          routePathRef.current = routePath;

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

      {!isCapturingInternal && (
        <MapZoomControls
          onZoomIn={handleZoomIn}
          onZoomOut={handleZoomOut}
        />
      )}
    </div>
  );
});

export default Map;
