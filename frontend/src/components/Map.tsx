import { useEffect, useRef } from "react";

declare global {
  interface Window {
    Tmapv2: {
      Map: new (
        element: HTMLElement,
        options: {
          center: unknown;
          width: string;
          height: string;
          zoom: number;
        },
      ) => unknown;
    };
  }
}

function Map() {
  const mapRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!mapRef.current) return;

    console.log("TMAP SDK:", window.Tmapv2);

    if (!window.Tmapv2) {
      console.error("TMAP SDK가 로드되지 않았습니다.");
      return;
    }

    new window.Tmapv2.Map(mapRef.current, {
      center: {
        lat: 37.5665,
        lng: 126.978,
      },
      width: "100%",
      height: "100%",
      zoom: 15,
    });
  }, []);

  return <div ref={mapRef} className="w-full h-full" />;
}

export default Map;
