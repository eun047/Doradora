import { useEffect, useRef } from "react";
import { watchLocation } from "../services/location";
import { requestWaypoints } from "../services/waypoint";
import { requestWalkingRoute } from "../services/tmap";
import { DEFAULT_SHAPE, type Shape } from "../types/shape";
import type { Point } from "../types/map";
import { createLatLng, createRoutePath, showWaypoints } from "../utils/map";
import "../types/tmap";

const USE_TEST_LOCATION = true;

const TEST_LOCATION = {
  latitude: 37.5663,
  longitude: 126.9779,
};

function Map() {
  const selectedShape: Shape = DEFAULT_SHAPE;
  const mapRef = useRef<HTMLDivElement | null>(null);
  const mapInstanceRef = useRef<unknown>(null);

  // 현재 위치 마커
  const markerRef = useRef<{
    setPosition: (position: unknown) => void;
  } | null>(null);

  // 실제 사용자가 걸어온 GPS 경로
  const gpsPathRef = useRef<unknown[]>([]);

  const gpsPolylineRef = useRef<{
    setPath: (path: unknown[]) => void;
  } | null>(null);

  // TMAP이 계산한 예정 산책 경로
  const routePolylineRef = useRef<{
    setPath: (path: unknown[]) => void;
  } | null>(null);

  // Gemini waypoint 요청 중복 방지
  const waypointRequestedRef = useRef(false);

  useEffect(() => {
    const stopWatching = watchLocation(
      async (position) => {
        //const { latitude, longitude } = position.coords;

        const latitude = USE_TEST_LOCATION
          ? TEST_LOCATION.latitude
          : position.coords.latitude;

        const longitude = USE_TEST_LOCATION
          ? TEST_LOCATION.longitude
          : position.coords.longitude;

        const currentPosition = createLatLng(latitude, longitude);

        // GPS 경로 저장
        gpsPathRef.current.push(currentPosition);

        if (!mapInstanceRef.current) {
          mapInstanceRef.current = new window.Tmapv2.Map(mapRef.current!, {
            center: currentPosition,
            width: "100%",
            height: "100%",
            zoom: 15,
          });

          // 현재 위치 마커
          markerRef.current = new window.Tmapv2.Marker({
            position: currentPosition,
            map: mapInstanceRef.current,
          });

          // 시작점 표시
          new window.Tmapv2.Label({
            position: currentPosition,
            map: mapInstanceRef.current,
            content: "START",
          });

          // 실제 GPS 이동 경로
          gpsPolylineRef.current = new window.Tmapv2.Polyline({
            path: gpsPathRef.current,
            map: mapInstanceRef.current,
          });
        }

        // 현재 위치 업데이트
        markerRef.current?.setPosition(currentPosition);
        gpsPolylineRef.current?.setPath(gpsPathRef.current);

        if (waypointRequestedRef.current) {
          return;
        }

        waypointRequestedRef.current = true;

        try {
          console.log(`Gemini ${selectedShape} waypoint 요청:`, {
            latitude,
            longitude,
            shape: selectedShape,
          });

          // 1. Gemini waypoint 요청
          const waypoints = await requestWaypoints(
            latitude,
            longitude,
            selectedShape,
          );
          console.log("Gemini waypoint:", waypoints);

          // 2. waypoint 마커 표시
          showWaypoints(mapInstanceRef.current, waypoints);
          console.log(`${selectedShape} waypoint 표시 완료`);

          // 3. 전체 경로의 점 구성
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

          console.log("전체 경로 points:", points);

          // 4. TMAP 전체 보행 경로 요청
          const route = await requestWalkingRoute(points);
          console.log("TMAP 전체 경로:", route);

          // 5. TMAP 좌표를 Tmapv2.LatLng로 변환
          const routePath = createRoutePath(route);

          // 6. 예정 산책 경로 Polyline 생성
          routePolylineRef.current = new window.Tmapv2.Polyline({
            path: routePath,
            map: mapInstanceRef.current,
          });

          console.log(`${selectedShape} TMAP 경로 표시 완료`);
        } catch (error) {
          console.error(
            `${selectedShape} waypoint 또는 경로를 가져오지 못했습니다.`,
            error,
          );

          // 실패했으므로 다시 시도할 수 있도록 설정
          waypointRequestedRef.current = false;
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

  return <div ref={mapRef} className="w-full h-full" />;
}

export default Map;
