export interface TmapLatLng {
  lat?: () => number;
  lng?: () => number;
  _lat?: number;
  _lng?: number;
  latitude?: number;
  longitude?: number;
}

export interface TmapLatLngBounds {
  extend: (latLng: unknown) => void;
}

export interface TmapMapInstance {
  zoomIn?: () => void;
  zoomOut?: () => void;
  setZoom?: (zoom: number) => void;
  fitBounds?: (bounds: TmapLatLngBounds) => void;
}

export interface TmapMarkerInstance {
  setPosition: (position: unknown) => void;
  setIcon?: (icon: unknown) => void;
}

export interface TmapPolylineInstance {
  setPath: (path: unknown[]) => void;
}

declare global {
  interface Window {
    Tmapv2: {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      LatLng: new (lat: number, lng: number) => any;

      LatLngBounds: new () => TmapLatLngBounds;

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
      ) => TmapMapInstance;

      Marker: new (options: {
        position: unknown;
        map: unknown;
        icon?: string;
        iconSize?: unknown;
      }) => TmapMarkerInstance;

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
      }) => TmapPolylineInstance;
    };
  }
}

export {};
