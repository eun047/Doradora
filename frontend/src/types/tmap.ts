declare global {
  interface Window {
    Tmapv2: {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      LatLng: any;

      Size: new (width: number, height: number) => unknown;

      Map: new (
        element: HTMLElement,
        options: {
          center: unknown;
          width: string;
          height: string;
          zoom: number;
          zoomControl?: boolean;
        },
      ) => {
        zoomIn?: () => void;
        zoomOut?: () => void;
        setZoom?: (zoom: number) => void;
      };

      Marker: new (options: {
        position: unknown;
        map: unknown;
        icon?: string;
        iconSize?: unknown;
      }) => {
        setPosition: (position: unknown) => void;
        setIcon?: (icon: unknown) => void;
      };

      Label: new (options: {
        position: unknown;
        map: unknown;
        content: string;
      }) => unknown;

      Polyline: new (options: {
        path: unknown[];
        map: unknown;
        strokeColor?: string;
        strokeWeight?: number;
        strokeOpacity?: number;
      }) => {
        setPath: (path: unknown[]) => void;
      };
    };
  }
}

export {};
