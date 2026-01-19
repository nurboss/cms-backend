import { Router } from "express";
import { DocumentController } from "../controllers/DocumentController";
import { ContentTypeController } from "../controllers/ContentTypeController";
import { SliceController } from "../controllers/SliceController";

const router = Router();
const documentController = new DocumentController();
const contentTypeController = new ContentTypeController();
const sliceController = new SliceController();

// Root API endpoint
router.get("/", (req, res) => {
  res.json({
    success: true,
    service: "CMS Public API",
    version: "1.0.0",
    endpoints: {
      health: "/health",
      documents: "/documents",
      contentTypes: "/content-types",
      slices: "/slices",
    },
    note: "Uploads are served from /uploads/:filename",
  });
});

// Public Content Type Routes (read-only)
router.get(
  "/content-types",
  contentTypeController.getAllContentTypes.bind(contentTypeController)
);
router.get(
  "/content-types/:name",
  contentTypeController.getContentType.bind(contentTypeController)
);

// Public Slice Routes (read-only)
router.get("/slices", sliceController.getAllSlices.bind(sliceController));
router.get(
  "/slices/:sliceType",
  sliceController.getSlice.bind(sliceController)
);

// Public Document Routes (read-only, no drafts)
router.get("/documents", (req, res, next) => {
  // Force includeDraft=false for public API
  req.query.draft = "false";
  return documentController.getDocuments(req, res, next);
});

router.get("/documents/:uid", (req, res, next) => {
  // Force includeDraft=false for public API
  req.query.draft = "false";
  return documentController.getDocument(req, res, next);
});

// Public health check
router.get("/health", (req, res) => {
  res.json({
    success: true,
    timestamp: new Date().toISOString(),
    service: "cms-public-api",
    status: "healthy",
    version: "1.0.0",
    uptime: process.uptime(),
  });
});

// Catch-all for undefined public routes
router.use("*", (req, res) => {
  res.status(404).json({
    success: false,
    error: "Route not found",
    path: req.originalUrl,
    availableRoutes: [
      "GET /",
      "GET /health",
      "GET /documents",
      "GET /documents/:uid",
      "GET /content-types",
      "GET /content-types/:name",
      "GET /slices",
      "GET /slices/:sliceType",
    ],
  });
});

export default router;
