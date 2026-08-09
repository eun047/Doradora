import { GoogleGenAI } from "@google/genai";

export interface Point {
  latitude: number;
  longitude: number;
}

const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
});

export async function generateHeartWaypoints(
  latitude: number,
  longitude: number,
): Promise<Point[]> {
  const prompt = `
현재 위치는 다음과 같다.

latitude: ${latitude}
longitude: ${longitude}

이 위치를 중심으로 도보 산책 경로를 만들기 위한
하트 모양의 waypoint 12개를 생성해라.

조건:
1. waypoint는 반드시 현재 위치 주변에 있어야 한다.
2. 현재 위치에서 너무 멀리 떨어지지 않도록 한다.
3. 12개의 waypoint가 순서대로 연결되었을 때 하트 외곽선에 가까운 형태가 되어야 한다.
4. waypoint의 순서는 P1 → P12이다.
5. P1부터 P12까지 연결한 뒤 마지막으로 현재 위치로 돌아올 수 있는 형태를 고려한다.
6. 위도(latitude)와 경도(longitude)를 정확한 숫자로 반환한다.
7. 설명이나 다른 텍스트는 반환하지 않는다.
`;

  const response = await ai.models.generateContent({
    model: "gemini-3.6-flash",
    contents: prompt,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: "object",
        properties: {
          waypoints: {
            type: "array",
            items: {
              type: "object",
              properties: {
                latitude: {
                  type: "number",
                },
                longitude: {
                  type: "number",
                },
              },
              required: ["latitude", "longitude"],
            },
          },
        },
        required: ["waypoints"],
      },
    },
  });

  if (!response.text) {
    throw new Error("Gemini 응답이 없습니다.");
  }

  const result = JSON.parse(response.text) as {
    waypoints: Point[];
  };

  if (result.waypoints.length !== 12) {
    throw new Error(
      `waypoint 개수가 12개가 아닙니다: ${result.waypoints.length}`,
    );
  }

  return result.waypoints;
}
