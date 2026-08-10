import "dotenv/config";
import cors from "cors";
import express from "express";
import {
  getWalkingRoute,
  getWalkingRouteThroughWaypoints,
} from "./services/tmap.js";
import { generateWaypoints } from "./services/gemini.js";
import { DEFAULT_SHAPE, type Shape } from "./types/shape.js";

const app = express();
const PORT = 5001;

app.use(cors());
app.use(express.json());

app.get("/api/health", (_req, res) => {
  res.json({
    message: "Doradora server is running!",
  });
});

app.post("/api/waypoints", async (req, res) => {
  try {
    const { latitude, longitude, shape = DEFAULT_SHAPE } = req.body;

    if (typeof latitude !== "number" || typeof longitude !== "number") {
      return res.status(400).json({
        message: "latitude와 longitude가 필요합니다.",
      });
    }

    const waypoints = await generateWaypoints(
      latitude,
      longitude,
      shape as Shape,
    );

    res.json({
      waypoints,
    });
  } catch (error) {
    console.error("waypoint 생성 실패:", error);

    res.status(500).json({
      message: "waypoint를 생성하지 못했습니다.",
    });
  }
});

app.post("/api/routes/walking", async (req, res) => {
  try {
    const { startX, startY, endX, endY } = req.body;

    const route = await getWalkingRoute({
      startX,
      startY,
      endX,
      endY,
    });

    res.json(route);
  } catch (error) {
    console.error("보행 경로를 가져오지 못했습니다.", error);

    res.status(500).json({
      message: "보행 경로를 가져오지 못했습니다.",
    });
  }
});

app.post("/api/routes/walking/waypoints", async (req, res) => {
  try {
    const { points } = req.body;

    if (!Array.isArray(points) || points.length < 2) {
      return res.status(400).json({
        message: "points 배열이 2개 이상 필요합니다.",
      });
    }

    const route = await getWalkingRouteThroughWaypoints(points);

    res.json({
      route,
    });
  } catch (error) {
    console.error("여러 waypoint 보행 경로를 가져오지 못했습니다.", error);

    res.status(500).json({
      message: "여러 waypoint의 보행 경로를 가져오지 못했습니다.",
    });
  }
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
