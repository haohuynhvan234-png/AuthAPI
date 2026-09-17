import express from "express";
import cors from "cors";
import swaggerUi from "swagger-ui-express";
import swaggerSpec from "./config/swagger.js";
import authRoutes from "./routes/auth.routes.js";

const app = express();

app.use(cors());
//sử dụng cors để cho phép trang đường dẫn được cho phép truy cập api
const allowedOrigins = [
  "http://localhost:3000",

  // Vercel frontend
  "https://auth-fe-blush.vercel.app",
];

app.use(
  cors({
    origin: function (origin, callback) {
      // Cho phép request không có Origin
      // Ví dụ: Postman, Swagger, server-to-server
      if (!origin) {
        return callback(null, true);
      }

      if (allowedOrigins.includes(origin)) {
        return callback(null, true);
      }

      return callback(new Error("Not allowed by CORS"));
    },

    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],

    allowedHeaders: ["Content-Type", "Authorization"],

    credentials: true,
  }),
);
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
//import cors from "cors";
