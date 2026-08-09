import "dotenv/config";
import cors from "cors";
import express from "express";
import { getWalkingRoute } from "./services/tmap.js";

const app = express();
const PORT = 5001;

app.use(cors());
app.use(express.json());

app.get("/api/health", (_req, res) => {
  res.json({
    message: "Doradora server is running!",
  });
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
