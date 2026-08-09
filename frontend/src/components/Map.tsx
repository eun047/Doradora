import { useEffect, useRef } from "react";
import { watchLocation } from "../services/location";

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

function Map() {
  const mapRef = useRef<HTMLDivElement | null>(null);
  const mapInstanceRef = useRef<unknown>(null);

  const markerRef = useRef<{
    setPosition: (position: unknown) => void;
  } | null>(null);

  const gpsPathRef = useRef<unknown[]>([]);

  const gpsPolylineRef = useRef<{
    setPath: (path: unknown[]) => void;
  } | null>(null);

  const routeRequestedRef = useRef(false);

  useEffect(() => {
    const stopWatching = watchLocation(
      async (position) => {
        const { latitude, longitude } = position.coords;

        const currentPosition = new window.Tmapv2.LatLng(latitude, longitude);

        // GPS 이동 경로 저장
        gpsPathRef.current.push(currentPosition);

        // 지도 최초 생성
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

          // 현재 위치 라벨
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

        // GPS 경로 업데이트
        gpsPolylineRef.current?.setPath(gpsPathRef.current);

        // TMAP 경로는 한 번만 요청
        if (routeRequestedRef.current) return;

        routeRequestedRef.current = true;

        const currentPoint: Point = {
          latitude,
          longitude,
        };

        // 테스트용 waypoint
        const waypoints: Point[] = [
          {
            latitude,
            longitude: longitude + 0.001,
          },
          {
            latitude: latitude + 0.001,
            longitude: longitude + 0.001,
          },
          {
            latitude: latitude + 0.001,
            longitude: longitude - 0.001,
          },
          {
            latitude,
            longitude: longitude - 0.001,
          },
        ];

        // 현재 → P1 → P2 → P3 → 현재
        const points = [currentPoint, ...waypoints, currentPoint];

        // waypoint 마커 + 순서 표시
        waypoints.forEach((point, index) => {
          const position = new window.Tmapv2.LatLng(
            point.latitude,
            point.longitude,
          );

          // 마커
          new window.Tmapv2.Marker({
            position,
            map: mapInstanceRef.current,
          });

          // 순서
          new window.Tmapv2.Label({
            position,
            map: mapInstanceRef.current,
            content: `P${index + 1}`,
          });
        });

        try {
          const allCoordinates: [number, number][] = [];

          // 각 waypoint 사이의 TMAP 보행 경로 요청
          for (let i = 0; i < points.length - 1; i++) {
            const start = points[i];
            const end = points[i + 1];

            console.log(`TMAP ${i + 1}번째 구간`, start, "→", end);

            const response = await fetch(
              "http://localhost:5001/api/routes/walking",
              {
                method: "POST",
                headers: {
                  "Content-Type": "application/json",
                },
                body: JSON.stringify({
                  startX: start.longitude,
                  startY: start.latitude,
                  endX: end.longitude,
                  endY: end.latitude,
                }),
              },
            );

            if (!response.ok) {
              throw new Error(`경로 요청 실패: ${response.status}`);
            }

            const coordinates = (await response.json()) as [number, number][];

            allCoordinates.push(
              ...(i === 0 ? coordinates : coordinates.slice(1)),
            );
          }

          // TMAP 좌표 → LatLng
          const path = allCoordinates.map(
            ([longitude, latitude]) =>
              new window.Tmapv2.LatLng(latitude, longitude),
          );

          // 하나의 Polyline
          new window.Tmapv2.Polyline({
            path,
            map: mapInstanceRef.current,
          });

          console.log("TMAP 전체 경로 생성 완료");
        } catch (error) {
          console.error("TMAP 보행 경로를 가져오지 못했습니다.", error);

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
  }, []);

  return <div ref={mapRef} className="w-full h-screen" />;
}

export default Map;
