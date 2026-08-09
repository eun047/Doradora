import "dotenv/config";
import cors from "cors";
import express from "express";
import { getWalkingRoute } from "./services/tmap.js";
import { generateHeartWaypoints } from "./services/gemini.js";

const app = express();
const PORT = 5001;

app.use(cors());
app.use(express.json());

app.get("/api/health", (_req, res) => {
  res.json({
    message: "Doradora server is running!",
  });
});

app.post("/api/waypoints/heart", async (req, res) => {
  try {
    const { latitude, longitude } = req.body;

    if (typeof latitude !== "number" || typeof longitude !== "number") {
      return res.status(400).json({
        message: "latitude와 longitude가 필요합니다.",
      });
    }

    const waypoints = await generateHeartWaypoints(latitude, longitude);

    res.json({
      waypoints,
    });
  } catch (error) {
    console.error("하트 waypoint 생성 실패:", error);

    res.status(500).json({
      message: "하트 waypoint를 생성하지 못했습니다.",
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

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
