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

      Polyline: new (options: { path: unknown[]; map: unknown }) => {
        setPath: (path: unknown[]) => void;
      };
    };
  }
}

function Map() {
  const mapRef = useRef<HTMLDivElement | null>(null);

  // 현재 위치 Marker
  const markerRef = useRef<{
    setPosition: (position: unknown) => void;
  } | null>(null);

  // 사용자가 실제로 이동한 GPS 경로
  const pathRef = useRef<unknown[]>([]);

  const polylineRef = useRef<{
    setPath: (path: unknown[]) => void;
  } | null>(null);

  // TMAP이 계산한 실제 보행 경로
  const tmapPolylineRef = useRef<{
    setPath: (path: unknown[]) => void;
  } | null>(null);

  useEffect(() => {
    let map: unknown = null;

    const stopWatching = watchLocation(
      async (position) => {
        const { latitude, longitude } = position.coords;

        const currentPosition = new window.Tmapv2.LatLng(latitude, longitude);

        pathRef.current.push(currentPosition);

        // 처음 위치를 받았을 때 지도 생성
        if (!map) {
          map = new window.Tmapv2.Map(mapRef.current!, {
            center: currentPosition,
            width: "100%",
            height: "100%",
            zoom: 15,
          });

          // 현재 위치 Marker
          markerRef.current = new window.Tmapv2.Marker({
            position: currentPosition,
            map,
          });

          // 실제 GPS 이동 경로
          polylineRef.current = new window.Tmapv2.Polyline({
            path: pathRef.current,
            map,
          });

          // 테스트 목적지
          const endLatitude = latitude + 0.001;
          const endLongitude = longitude + 0.001;

          try {
            const response = await fetch(
              "http://localhost:5001/api/routes/walking",
              {
                method: "POST",
                headers: {
                  "Content-Type": "application/json",
                },
                body: JSON.stringify({
                  startX: longitude,
                  startY: latitude,
                  endX: endLongitude,
                  endY: endLatitude,
                }),
              },
            );

            if (!response.ok) {
              throw new Error(`경로 요청 실패: ${response.status}`);
            }

            const coordinates = await response.json();

            const tmapPath = coordinates.map(
              ([longitude, latitude]: [number, number]) =>
                new window.Tmapv2.LatLng(latitude, longitude),
            );

            tmapPolylineRef.current = new window.Tmapv2.Polyline({
              path: tmapPath,
              map,
            });
          } catch (error) {
            console.error("TMAP 보행 경로를 가져오지 못했습니다.", error);
          }

          return;
        }

        // 이후 위치가 바뀌면 기존 Marker 이동
        markerRef.current?.setPosition(currentPosition);

        // GPS 이동 경로 업데이트
        polylineRef.current?.setPath(pathRef.current);
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
