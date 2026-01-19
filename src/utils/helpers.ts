import path from "path";
import fs from "fs-extra";
import { v4 as uuidv4 } from "uuid";

export const ensureUploadDir = (): string => {
  const uploadDir = process.env.UPLOAD_DIR || "./uploads";
  const absolutePath = path.resolve(uploadDir);

  if (!fs.existsSync(absolutePath)) {
    fs.mkdirsSync(absolutePath);
  }

  return absolutePath;
};

export const generateFilename = (originalname: string): string => {
  const ext = path.extname(originalname);
  const basename = path.basename(originalname, ext);
  const timestamp = Date.now();
  const uuid = uuidv4().slice(0, 8);

  return `${basename}-${timestamp}-${uuid}${ext}`.toLowerCase();
};

export const getPublicUrl = (filename: string): string => {
  const baseUrl = process.env.API_URL || "http://localhost:3001";
  return `${baseUrl}/uploads/${filename}`;
};

export const validateFileType = (mimeType: string): boolean => {
  const allowedTypes = [
    "image/jpeg",
    "image/jpg",
    "image/png",
    "image/gif",
    "image/webp",
    "image/svg+xml",
    "application/pdf",
    "text/plain",
    "application/msword",
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  ];

  return allowedTypes.includes(mimeType);
};

export const formatBytes = (bytes: number, decimals = 2): string => {
  if (bytes === 0) return "0 Bytes";

  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ["Bytes", "KB", "MB", "GB", "TB", "PB", "EB", "ZB", "YB"];

  const i = Math.floor(Math.log(bytes) / Math.log(k));

  return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + " " + sizes[i];
};

export const sanitizeFilename = (filename: string): string => {
  return filename
    .replace(/[^a-zA-Z0-9.-]/g, "_")
    .replace(/_+/g, "_")
    .toLowerCase();
};
