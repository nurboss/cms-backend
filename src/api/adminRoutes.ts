import { Router } from "express";
import { DocumentController } from "../controllers/DocumentController";
import { ContentTypeController } from "../controllers/ContentTypeController";
import { SliceController } from "../controllers/SliceController";
import { AssetController } from "../controllers/AssetController";
import {
  createContentTypeValidator,
  createSliceValidator,
  createDocumentValidator,
  updateDocumentValidator,
} from "../utils/validation";

const router = Router();
const documentController = new DocumentController();
const contentTypeController = new ContentTypeController();
const sliceController = new SliceController();
const assetController = new AssetController();

// Admin root endpoint
router.get("/", (req, res) => {
  res.json({
    success: true,
    service: "CMS Admin API",
    version: "1.0.0",
    endpoints: {
      contentTypes: "GET,POST /content-types",
      slices: "GET,POST /slices",
      documents: "GET,POST /documents",
      assets: "GET,POST /assets",
      health: "/health",
    },
    note: "This is the admin API. Use with proper authentication in production.",
  });
});

// Content Type Routes
router.get(
  "/content-types",
  contentTypeController.getAllContentTypes.bind(contentTypeController)
);
router.post(
  "/content-types",
  createContentTypeValidator,
  contentTypeController.createContentType.bind(contentTypeController)
);
router.get(
  "/content-types/:name",
  contentTypeController.getContentType.bind(contentTypeController)
);
router.put(
  "/content-types/:name",
  contentTypeController.updateContentType.bind(contentTypeController)
);
router.delete(
  "/content-types/:name",
  contentTypeController.deleteContentType.bind(contentTypeController)
);

// Slice Routes
router.get("/slices", sliceController.getAllSlices.bind(sliceController));
router.post(
  "/slices",
  createSliceValidator,
  sliceController.createSlice.bind(sliceController)
);
router.get(
  "/slices/:sliceType",
  sliceController.getSlice.bind(sliceController)
);
router.put(
  "/slices/:sliceType",
  sliceController.updateSlice.bind(sliceController)
);
router.delete(
  "/slices/:sliceType",
  sliceController.deleteSlice.bind(sliceController)
);
router.post(
  "/slices/:sliceType/validate",
  sliceController.validateSlice.bind(sliceController)
);

// Document Routes
router.get(
  "/documents",
  documentController.getDocuments.bind(documentController)
);
router.post(
  "/documents",
  createDocumentValidator,
  documentController.createDocument.bind(documentController)
);
router.get(
  "/documents/:uid",
  documentController.getDocument.bind(documentController)
);
router.put(
  "/documents/:uid",
  updateDocumentValidator,
  documentController.updateDocument.bind(documentController)
);
router.delete(
  "/documents/:uid",
  documentController.deleteDocument.bind(documentController)
);
router.post(
  "/documents/:uid/publish",
  documentController.publishDocument.bind(documentController)
);
router.post(
  "/documents/:uid/unpublish",
  documentController.unpublishDocument.bind(documentController)
);

// Asset Routes
router.get("/assets", assetController.getAllAssets.bind(assetController));
router.post(
  "/assets",
  assetController.uploadMiddleware,
  assetController.uploadAsset.bind(assetController)
);
router.get("/assets/:id", assetController.getAsset.bind(assetController));
router.put("/assets/:id", assetController.updateAsset.bind(assetController));
router.delete("/assets/:id", assetController.deleteAsset.bind(assetController));

// Health check for admin
router.get("/health", (req, res) => {
  res.json({
    success: true,
    timestamp: new Date().toISOString(),
    service: "cms-admin-api",
    status: "healthy",
    version: "1.0.0",
    uptime: process.uptime(),
  });
});

export default router;
