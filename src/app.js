import express from "express";
import cors from "cors";
import swaggerUi from "swagger-ui-express";
import swaggerSpec from "./config/swagger.js";
import authRoutes from "./routes/auth.routes.js";

const app = express();

app.use(cors());
app.use(express.json());

// Swagger UI - Tài liệu API
app.use(
  "/swagger",
  swaggerUi.serve,
  swaggerUi.setup(swaggerSpec, {
    customCss: ".swagger-ui .topbar { display: none }",
    customSiteTitle: "AuthAPI - Swagger Documentation",
  }),
);

// Routes
app.use("/api/auth", authRoutes);

// Global Error Handler Middleware
app.use((err, req, res, next) => {
  console.error("API Error:", err.stack || err);
  const statusCode = err.statusCode || 500;
  const message = err.message || "Lỗi máy chủ nội bộ. Vui lòng thử lại sau.";
  res.status(statusCode).json({
    message,
    error: err.name || "InternalServerError",
    statusCode,
  });
});

export default app;
