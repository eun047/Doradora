import type { Point } from "../types/map";

export const USE_TEST_LOCATION = true;

export const TEST_LOCATION: Point = {
  latitude: 37.5663,
  longitude: 126.9779,
};

export const TEST_WAYPOINTS: Point[] = [
  // P1
  {
    latitude: 37.5672,
    longitude: 126.9762,
  },

  // P2
  {
    latitude: 37.5688,
    longitude: 126.9754,
  },

  // P3
  {
    latitude: 37.5701,
    longitude: 126.9757,
  },

  // P4 — 왼쪽 봉우리
  {
    latitude: 37.5707,
    longitude: 126.977,
  },

  // P5 — 가운데 홈
  {
    latitude: 37.5697,
    longitude: 126.9779,
  },

  // P6 — 오른쪽 봉우리
  {
    latitude: 37.5707,
    longitude: 126.9788,
  },

  // P7
  {
    latitude: 37.5701,
    longitude: 126.9801,
  },

  // P8
  {
    latitude: 37.5688,
    longitude: 126.9804,
  },

  // P9
  {
    latitude: 37.5672,
    longitude: 126.9796,
  },

  // P10
  {
    latitude: 37.5664,
    longitude: 126.9789,
  },

  // P11 — 아래쪽 끝으로 이어지는 지점
  {
    latitude: 37.5658,
    longitude: 126.9782,
  },
];

export const ROUTE_COLOR = "#84CC16";
export const GPS_COLOR = "#FF6B4A";
