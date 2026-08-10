import { useEffect, useRef } from "react";
import { watchLocation } from "../services/location";
import { DEFAULT_SHAPE, type Shape } from "../types/shape";

declare global {
  interface Window {
    Tmapv2: {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      LatLng: any;

      Map: new (
        element: HTMLElement,
        options: {
          center: unknown;
          width: string;
          height: string;
          zoom: number;
        },
      ) => unknown;

      Marker: new (options: { position: unknown; map: unknown }) => {
        setPosition: (position: unknown) => void;
      };

      Label: new (options: {
        position: unknown;
        map: unknown;
        content: string;
      }) => unknown;

      Polyline: new (options: { path: unknown[]; map: unknown }) => {
        setPath: (path: unknown[]) => void;
      };
    };
  }
}

type Point = {
  latitude: number;
  longitude: number;
};

type WalkingRouteResponse = {
  route: number[][];
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

        const USE_TEST_LOCATION = true;

        const TEST_LOCATION = {
          latitude: 37.5663,
          longitude: 126.9779,
        };

        const latitude = USE_TEST_LOCATION
          ? TEST_LOCATION.latitude
          : position.coords.latitude;

        const longitude = USE_TEST_LOCATION
          ? TEST_LOCATION.longitude
          : position.coords.longitude;

        const currentPosition = new window.Tmapv2.LatLng(latitude, longitude);

        // --------------------------------
        // GPS 경로 저장
        // --------------------------------

        gpsPathRef.current.push(currentPosition);

        // --------------------------------
        // 지도 최초 생성
        // --------------------------------

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

        // --------------------------------
        // 현재 위치 업데이트
        // --------------------------------

        markerRef.current?.setPosition(currentPosition);

        gpsPolylineRef.current?.setPath(gpsPathRef.current);

        // --------------------------------
        // Gemini waypoint 요청
        // --------------------------------

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

          // --------------------------------
          // 1. Gemini waypoint 요청
          // --------------------------------

          const waypointResponse = await fetch(
            "http://localhost:5001/api/waypoints",
            {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
              },
              body: JSON.stringify({
                latitude,
                longitude,
                shape: selectedShape,
              }),
            },
          );

          if (!waypointResponse.ok) {
            throw new Error(
              `${selectedShape} waypoint 요청 실패: ${waypointResponse.status}`,
            );
          }

          const waypointData = (await waypointResponse.json()) as {
            waypoints: Point[];
          };

          console.log("Gemini waypoint:", waypointData.waypoints);

          // --------------------------------
          // 2. waypoint 마커 표시
          // --------------------------------

          waypointData.waypoints.forEach((point, index) => {
            const position = new window.Tmapv2.LatLng(
              point.latitude,
              point.longitude,
            );

            new window.Tmapv2.Marker({
              position,
              map: mapInstanceRef.current,
            });

            new window.Tmapv2.Label({
              position,
              map: mapInstanceRef.current,
              content: `P${index + 1}`,
            });
          });

          console.log(`${selectedShape} waypoint 표시 완료`);

          // --------------------------------
          // 3. 전체 경로의 점 구성
          // --------------------------------

          const points: Point[] = [
            {
              latitude,
              longitude,
            },
            ...waypointData.waypoints,
            {
              latitude,
              longitude,
            },
          ];

          console.log("전체 경로 points:", points);

          // --------------------------------
          // 4. TMAP 전체 보행 경로 요청
          // --------------------------------

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
            throw new Error(
              `TMAP 전체 경로 요청 실패: ${routeResponse.status}`,
            );
          }

          const routeData =
            (await routeResponse.json()) as WalkingRouteResponse;

          console.log("TMAP 전체 경로:", routeData.route);

          // --------------------------------
          // 5. TMAP 좌표를 Tmapv2.LatLng로 변환
          // --------------------------------

          const routePath = routeData.route.map(
            ([longitude, latitude]) =>
              new window.Tmapv2.LatLng(latitude, longitude),
          );

          // --------------------------------
          // 6. 예정 산책 경로 Polyline 생성
          // --------------------------------

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
