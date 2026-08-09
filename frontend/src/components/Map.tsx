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

  const markerRef = useRef<{
    setPosition: (position: unknown) => void;
  } | null>(null);

  const pathRef = useRef<unknown[]>([]);

  const polylineRef = useRef<{
    setPath: (path: unknown[]) => void;
  } | null>(null);

  useEffect(() => {
    let map: unknown = null;

    const stopWatching = watchLocation(
      (position) => {
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

          // 마커도 처음 한 번만 생성
          markerRef.current = new window.Tmapv2.Marker({
            position: currentPosition,
            map,
          });

          polylineRef.current = new window.Tmapv2.Polyline({
            path: pathRef.current,
            map,
          });

          return;
        }

        // 이후 위치가 바뀌면 기존 마커만 이동
        markerRef.current?.setPosition(currentPosition);
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

  return <div ref={mapRef} className="w-full h-full" />;
}

export default Map;
