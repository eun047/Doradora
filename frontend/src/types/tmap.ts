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

export {};
