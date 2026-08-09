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

  const waypointRequestedRef = useRef(false);

  useEffect(() => {
    const stopWatching = watchLocation(
      async (position) => {
        const { latitude, longitude } = position.coords;

        const currentPosition = new window.Tmapv2.LatLng(latitude, longitude);

        // -------------------------
        // GPS 경로 저장
        // -------------------------

        gpsPathRef.current.push(currentPosition);

        // -------------------------
        // 지도 최초 생성
        // -------------------------

        if (!mapInstanceRef.current) {
          mapInstanceRef.current = new window.Tmapv2.Map(mapRef.current!, {
            center: currentPosition,
            width: "100%",
            height: "100%",
            zoom: 15,
          });

          markerRef.current = new window.Tmapv2.Marker({
            position: currentPosition,
            map: mapInstanceRef.current,
          });

          new window.Tmapv2.Label({
            position: currentPosition,
            map: mapInstanceRef.current,
            content: "START",
          });

          gpsPolylineRef.current = new window.Tmapv2.Polyline({
            path: gpsPathRef.current,
            map: mapInstanceRef.current,
          });
        }

        // -------------------------
        // 현재 위치 업데이트
        // -------------------------

        markerRef.current?.setPosition(currentPosition);

        gpsPolylineRef.current?.setPath(gpsPathRef.current);

        // -------------------------
        // AI waypoint 요청
        // -------------------------

        if (waypointRequestedRef.current) {
          return;
        }

        waypointRequestedRef.current = true;

        try {
          console.log("Gemini 하트 waypoint 요청:", {
            latitude,
            longitude,
          });

          const response = await fetch(
            "http://localhost:5001/api/waypoints/heart",
            {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
              },
              body: JSON.stringify({
                latitude,
                longitude,
              }),
            },
          );

          if (!response.ok) {
            throw new Error(`하트 waypoint 요청 실패: ${response.status}`);
          }

          const data = (await response.json()) as {
            waypoints: Point[];
          };

          console.log("Gemini waypoint:", data.waypoints);

          // -------------------------
          // waypoint 표시
          // -------------------------

          data.waypoints.forEach((point, index) => {
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

          console.log("하트 waypoint 표시 완료");
        } catch (error) {
          console.error("하트 waypoint를 가져오지 못했습니다.", error);
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
