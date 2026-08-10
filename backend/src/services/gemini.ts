import { GoogleGenAI } from "@google/genai";
import { DEFAULT_SHAPE, type Shape } from "../types/shape.js";

export interface Point {
  latitude: number;
  longitude: number;
}

const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
});

export async function generateWaypoints(
  latitude: number,
  longitude: number,
  shape: Shape = DEFAULT_SHAPE,
): Promise<Point[]> {
  const prompt = `
현재 위치는 다음과 같다.

latitude: ${latitude}
longitude: ${longitude}

이 위치를 중심으로 도보 산책 경로를 만들기 위한
${shape} 모양의 waypoint를 생성해라.

waypoint의 개수는 고정하지 않는다.
${shape}의 형태를 표현하는 데 필요한 적절한 수의 waypoint를
6개에서 10개 사이에서 판단하여 생성한다.

중요:
이 waypoint들은 부드러운 곡선을 만드는 점이 아니라,
직선 구간들을 연결해서 ${shape}의 외곽선을 만드는
"꺾이는 지점"이어야 한다.

조건:
1. waypoint는 반드시 현재 위치 주변에 있어야 한다.

2. 현재 위치에서 너무 멀리 떨어지지 않도록 한다.

3. waypoint의 개수는 ${shape}의 형태에 따라 8~12개 사이에서
   적절하게 결정한다.

4. P1 → P2 → ... → Pn을 순서대로 직선으로 연결했을 때
   ${shape}의 외곽선이 나타나도록 한다.

5. 인접한 waypoint 사이의 구간은 가능한 한
   직선적인 형태가 되도록 한다.

6. 같은 방향으로 여러 개의 waypoint를 촘촘하게 배치하지 않는다.

7. 곡선을 표현하기 위해 waypoint를 불필요하게 많이 배치하지 않는다.

8. ${shape}의 모양이 바뀌는 꼭짓점, 방향 전환점,
   굴곡이 큰 지점에 waypoint를 우선적으로 배치한다.

9. 모든 waypoint는 ${shape}의 전체적인 윤곽을 만드는 데
   의미가 있어야 한다.

10. waypoint의 순서는 P1 → P2 → ... → Pn이다.

11. P1부터 Pn까지 연결한 뒤 마지막으로 현재 위치로
    돌아올 수 있는 닫힌 경로가 되도록 한다.

12. 위도(latitude)와 경도(longitude)는
    실제 WGS84 좌표의 숫자로 반환한다.

13. 설명이나 다른 텍스트는 반환하지 않는다.

특히 중요:

- 원형이나 곡선처럼 waypoint를 촘촘하게 배치하지 마라.
- waypoint 사이를 직선으로 연결했을 때 ${shape}이 보이도록 해라.
- waypoint 자체가 아니라 waypoint 사이의 "직선 구간"이
  ${shape}의 외곽선을 만든다고 생각해라.
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

  if (result.waypoints.length < 6 || result.waypoints.length > 10) {
    throw new Error(
      `waypoint 개수가 적절하지 않습니다: ${result.waypoints.length}개 (6~10개 필요)`,
    );
  }

  return result.waypoints;
}
