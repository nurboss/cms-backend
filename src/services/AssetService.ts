import { Prisma } from "../../generated/prisma/client";
import { prisma } from "../../lib/prisma";
import { Asset } from "../types";
import { assetSchema } from "../utils/validation";
import {
  ensureUploadDir,
  generateFilename,
  getPublicUrl,
  validateFileType,
  sanitizeFilename,
} from "../utils/helpers";
import {
  AppError,
  ValidationError,
  NotFoundError,
} from "../utils/error-handler";
import path from "path";
import fs from "fs-extra";

export class AssetService {
  async createAsset(
    file: Express.Multer.File,
    altText?: string
  ): Promise<Asset> {
    try {
      // Validate file type
      if (!validateFileType(file.mimetype)) {
        throw new ValidationError("Invalid file type");
      }

      // Ensure upload directory exists
      const uploadDir = ensureUploadDir();

      // Generate safe filename
      const originalName = sanitizeFilename(file.originalname);
      const filename = generateFilename(originalName);
      const filePath = path.join(uploadDir, filename);

      // Save file - handle both disk and memory storage
      if (file.path) {
        // File was saved to disk by multer
        // Copy from temp location to upload directory
        await fs.copyFile(file.path, filePath);
      } else if (file.buffer) {
        // File is in memory as buffer
        await fs.writeFile(filePath, file.buffer);
      } else {
        throw new ValidationError("No file data provided");
      }

      // Create asset record
      const asset = await prisma.asset.create({
        data: {
          filename: originalName,
          mimeType: file.mimetype,
          url: getPublicUrl(filename),
          size: file.size,
          altText,
          // Note: width and height would require image processing
          // You could add sharp or similar for image manipulation
        },
      });

      return this.formatAssetResponse(asset);
    } catch (error) {
      // Clean up file if database operation fails
      if (file) {
        try {
          const uploadDir = ensureUploadDir();
          const filename = generateFilename(file.originalname);
          const filePath = path.join(uploadDir, filename);

          if (await fs.pathExists(filePath)) {
            await fs.unlink(filePath);
          }
        } catch (cleanupError) {
          console.error("Error cleaning up file:", cleanupError);
        }
      }

      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        if (error.code === "P2002") {
          throw new ValidationError("Asset with this filename already exists");
        }
      }
      throw error;
    }
  }

  async getAsset(id: string): Promise<Asset> {
    const asset = await prisma.asset.findUnique({
      where: { id },
    });

    if (!asset) {
      throw new NotFoundError("Asset not found");
    }

    return this.formatAssetResponse(asset);
  }

  async getAllAssets(page: number = 1, limit: number = 50) {
    const skip = (page - 1) * limit;

    const [assets, total] = await Promise.all([
      prisma.asset.findMany({
        skip,
        take: limit,
        orderBy: { createdAt: "desc" },
      }),
      prisma.asset.count(),
    ]);

    return {
      data: assets.map((asset) => this.formatAssetResponse(asset)),
      meta: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    };
  }

  async updateAsset(
    id: string,
    updates: Partial<{
      altText: string;
    }>
  ): Promise<Asset> {
    try {
      const asset = await prisma.asset.update({
        where: { id },
        data: updates,
      });

      return this.formatAssetResponse(asset);
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        if (error.code === "P2025") {
          throw new NotFoundError("Asset not found");
        }
      }
      throw error;
    }
  }

  async deleteAsset(id: string): Promise<void> {
    try {
      const asset = await prisma.asset.findUnique({
        where: { id },
      });

      if (!asset) {
        throw new NotFoundError("Asset not found");
      }

      // Delete file from filesystem
      const uploadDir = ensureUploadDir();
      const filename = path.basename(asset.url);
      const filePath = path.join(uploadDir, filename);

      if (await fs.pathExists(filePath)) {
        await fs.unlink(filePath);
      }

      // Delete database record
      await prisma.asset.delete({
        where: { id },
      });
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        if (error.code === "P2025") {
          throw new NotFoundError("Asset not found");
        }
      }
      throw error;
    }
  }

  async searchAssets(query: string, page: number = 1, limit: number = 50) {
    const skip = (page - 1) * limit;
    const where = {
      OR: [
        { filename: { contains: query, mode: Prisma.QueryMode.insensitive } },
        { altText: { contains: query, mode: Prisma.QueryMode.insensitive } },
      ],
    };

    const [assets, total] = await Promise.all([
      prisma.asset.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: "desc" },
      }),
      prisma.asset.count({ where }),
    ]);

    return {
      data: assets.map((asset) => this.formatAssetResponse(asset)),
      meta: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    };
  }

  async getAssetsByMimeType(mimeType: string) {
    const assets = await prisma.asset.findMany({
      where: {
        mimeType: {
          startsWith: mimeType,
        },
      },
      orderBy: { createdAt: "desc" },
    });

    return assets.map((asset) => this.formatAssetResponse(asset));
  }

  private formatAssetResponse(asset: any): Asset {
    return {
      id: asset.id,
      filename: asset.filename,
      mimeType: asset.mimeType,
      url: asset.url,
      size: asset.size,
      width: asset.width || undefined,
      height: asset.height || undefined,
      altText: asset.altText || undefined,
      createdAt: asset.createdAt.toISOString(),
      updatedAt: asset.updatedAt.toISOString(),
    };
  }
}
