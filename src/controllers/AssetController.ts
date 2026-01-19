import { Request, Response } from "express";
import { AssetService } from "../services/AssetService";
import multer from "multer";
import {
  ensureUploadDir,
  generateFilename,
  sanitizeFilename,
} from "../utils/helpers";

const assetService = new AssetService();
// Configure multer storage
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = ensureUploadDir();
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const originalName = sanitizeFilename(file.originalname);
    const filename = generateFilename(originalName);
    cb(null, filename);
  },
});

// Configure multer upload
const upload = multer({
  storage,
  limits: {
    fileSize: parseInt(process.env.MAX_FILE_SIZE || "10485760"),
  },
  fileFilter: (req, file, cb) => {
    const allowedTypes = [
      "image/jpeg",
      "image/jpg",
      "image/png",
      "image/gif",
      "image/webp",
      "image/svg+xml",
      "application/pdf",
    ];

    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error("Invalid file type"));
    }
  },
});
export class AssetController {
  uploadMiddleware = upload.single("file");

  async uploadAsset(req: Request, res: Response) {
    try {
      if (!req.file) {
        throw new Error("No file uploaded");
      }

      const { altText } = req.body;
      const asset = await assetService.createAsset(req.file, altText);

      res.status(201).json({
        success: true,
        data: asset,
      });
    } catch (error: any) {
      throw error;
    }
  }

  async getAsset(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const asset = await assetService.getAsset(id);

      res.json({
        success: true,
        data: asset,
      });
    } catch (error: any) {
      throw error;
    }
  }

  async getAllAssets(req: Request, res: Response) {
    try {
      const { page = "1", limit = "50", search, mimeType } = req.query;

      if (search) {
        const result = await assetService.searchAssets(
          search as string,
          parseInt(page as string),
          parseInt(limit as string)
        );

        return res.json({
          success: true,
          ...result,
        });
      }

      if (mimeType) {
        const assets = await assetService.getAssetsByMimeType(
          mimeType as string
        );
        return res.json({
          success: true,
          data: assets,
        });
      }

      const result = await assetService.getAllAssets(
        parseInt(page as string),
        parseInt(limit as string)
      );

      res.json({
        success: true,
        ...result,
      });
    } catch (error: any) {
      throw error;
    }
  }

  async updateAsset(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const { altText } = req.body;

      const asset = await assetService.updateAsset(id, { altText });

      res.json({
        success: true,
        data: asset,
      });
    } catch (error: any) {
      throw error;
    }
  }

  async deleteAsset(req: Request, res: Response) {
    try {
      const { id } = req.params;
      await assetService.deleteAsset(id);

      res.status(204).send();
    } catch (error: any) {
      throw error;
    }
  }
}
