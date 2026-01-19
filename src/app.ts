import express from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import path from "path";
import fs from "fs-extra";
import routes from "./api/routes";
import { errorMiddleware } from "./middleware/error";
import { ensureUploadDir } from "./utils/helpers";

const app = express();
const PORT = process.env.PORT || 3001;

// Ensure upload directory exists
const uploadDir = ensureUploadDir();
console.log("📁 Upload directory:", uploadDir);

// Security middleware
app.use(
  helmet({
    crossOriginResourcePolicy: { policy: "cross-origin" },
  })
);

// CORS configuration
const corsOptions = {
  origin: "*",
  credentials: false,
  optionsSuccessStatus: 200,
};

app.use(cors(corsOptions));
// const corsOptions = {
//   origin: process.env.CORS_ORIGIN?.split(",") || [
//     "http://localhost:5173",
//     "http://localhost:3000",
//   ],
//   credentials: true,
//   optionsSuccessStatus: 200,
// };

// app.use(cors(corsOptions));

// Logging middleware
if (process.env.NODE_ENV === "development") {
  app.use(morgan("dev"));

  // Debug middleware
  app.use((req, res, next) => {
    console.log(`${new Date().toISOString()} ${req.method} ${req.url}`);
    next();
  });
} else {
  // Create logs directory if it doesn't exist
  const logsDir = path.join(__dirname, "../logs");
  if (!fs.existsSync(logsDir)) {
    fs.mkdirSync(logsDir, { recursive: true });
  }

  const accessLogStream = fs.createWriteStream(
    path.join(logsDir, "access.log"),
    { flags: "a" }
  );
  app.use(morgan("combined", { stream: accessLogStream }));
}

// Body parsing middleware
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));

// Disable caching for API responses
app.use((req, res, next) => {
  res.set("Cache-Control", "no-store, no-cache, must-revalidate, private");
  res.set("Pragma", "no-cache");
  res.set("Expires", "0");
  next();
});

// API Routes - mount this FIRST
app.use("/api", routes);

// Static files for uploads - mount this AFTER API routes
app.use(
  "/uploads",
  express.static(uploadDir, {
    index: false, // Don't serve directory index
    fallthrough: false,
    setHeaders: (res, path) => {
      // Cache static files for 1 hour
      res.set("Cache-Control", "public, max-age=3600");
    },
  })
);

// Custom handler for /uploads/ (root of uploads)
app.get("/uploads", (req, res) => {
  res.status(400).json({
    success: false,
    error: "Please specify a filename. Example: /uploads/filename.jpg",
    example: "/uploads/hero-bg.jpg",
  });
});

// Root route
app.get("/", (req, res) => {
  res.json({
    service: "Prismic-like Headless CMS",
    version: "1.0.0",
    endpoints: {
      api: "/api",
      apiHealth: "/api/health",
      adminApi: "/api/admin",
      uploads: "/uploads/:filename",
    },
    documentation: "See /api for API documentation",
    environment: process.env.NODE_ENV || "development",
  });
});

// 404 handler for non-API routes
app.use("*", (req, res) => {
  res.status(404).json({
    success: false,
    error: "Route not found",
    path: req.originalUrl,
    availableRoutes: [
      "GET /",
      "GET /api",
      "GET /api/health",
      "GET /api/admin",
      "GET /api/documents",
      "GET /api/content-types",
      "GET /api/slices",
      "GET /uploads/:filename",
    ],
  });
});

// Error handling middleware (must be last)
app.use(errorMiddleware);

// Start server
const startServer = async () => {
  try {
    // Test database connection
    const { prisma } = await import("../lib/prisma");
    await prisma.$connect();
    console.log("✅ Database connected successfully");

    app.listen(PORT, () => {
      console.log(`🚀 CMS Server running on http://localhost:${PORT}`);
      console.log(`📁 Upload directory: ${uploadDir}`);
      console.log(`🔧 Environment: ${process.env.NODE_ENV || "development"}`);
      console.log("\n📚 Available Routes:");
      console.log(`   • Home:          http://localhost:${PORT}/`);
      console.log(`   • API:           http://localhost:${PORT}/api`);
      console.log(`   • API Health:    http://localhost:${PORT}/api/health`);
      console.log(`   • Admin API:     http://localhost:${PORT}/api/admin`);
      console.log(
        `   • Documents:     http://localhost:${PORT}/api/documents?type=page`
      );
      console.log(
        `   • Content Types: http://localhost:${PORT}/api/content-types`
      );
      console.log(`   • Slices:        http://localhost:${PORT}/api/slices`);
      console.log(
        `   • Uploads:       http://localhost:${PORT}/uploads/hero-bg.jpg`
      );
    });
  } catch (error) {
    console.error("❌ Failed to start server:", error);
    process.exit(1);
  }
};

// Handle graceful shutdown
const shutdown = async () => {
  console.log("Shutting down gracefully...");
  const { prisma } = await import("../lib/prisma");
  await prisma.$disconnect();
  process.exit(0);
};

process.on("SIGTERM", shutdown);
process.on("SIGINT", shutdown);

// Start the server
startServer();

export default app;
