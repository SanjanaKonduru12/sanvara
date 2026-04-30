import cors from "cors";
import express from "express";
import { createProxyMiddleware } from "http-proxy-middleware";

const FRONTEND_ORIGIN = "https://luminamart-frontend-production.up.railway.app";
const BACKEND_URL = process.env.BACKEND_URL || "https://luminamart-backend-production.up.railway.app";
const PORT = process.env.PORT || 3000;

const app = express();

const corsOptions = {
  origin: FRONTEND_ORIGIN,
  methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"],
  credentials: true,
};

app.use(cors(corsOptions));
app.options("*", cors(corsOptions));

app.get("/health", (_req, res) => {
  res.json({ status: "ok", backend: BACKEND_URL });
});

app.use(
  "/api",
  createProxyMiddleware({
    target: BACKEND_URL,
    changeOrigin: true,
    secure: true,
  })
);

app.listen(PORT, () => {
  console.log(`LuminaMart proxy listening on port ${PORT}`);
});
