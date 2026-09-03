import express from "express";
import swaggerUi from "swagger-ui-express";
import swaggerSpec from "./config/swagger.js";
import authRoutes from "./routes/auth.routes.js";

const app = express();

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

export default app;
