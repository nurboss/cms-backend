import { Request, Response } from "express";
import { DocumentService } from "../services/DocumentService";
import { validateRequest } from "../middleware/validation";
import { AppError } from "../utils/error-handler";

const documentService = new DocumentService();

export class DocumentController {
  async createDocument(req: Request, res: Response) {
    try {
      await validateRequest(req, res, async () => {
        const { uid, title, contentType, data, status } = req.body;

        const document = await documentService.createDocument(
          uid,
          title,
          contentType,
          data,
          status
        );

        res.status(201).json({
          success: true,
          data: document,
        });
      });
    } catch (error: any) {
      throw error;
    }
  }

  async getDocument(req: Request, res: Response) {
    try {
      const { uid } = req.params;
      const { draft } = req.query;
      const includeDraft = draft === "true";

      const document = await documentService.getDocumentByUid(
        uid,
        includeDraft
      );

      if (!document) {
        return res.status(404).json({
          success: false,
          error: "Document not found",
        });
      }

      res.json({
        success: true,
        data: document,
      });
    } catch (error: any) {
      console.error("Error in getDocument:", error);
      res.status(500).json({
        success: false,
        error: "Internal server error",
      });
    }
  }

  async getDocuments(req: Request, res: Response) {
    try {
      const { type, page = "1", limit = "20", draft, search } = req.query;

      if (search) {
        // Handle search
        const result = await documentService.searchDocuments(
          search as string,
          type as string,
          parseInt(page as string),
          parseInt(limit as string)
        );

        return res.json({
          success: true,
          ...result,
        });
      }

      if (type) {
        // Get documents by type
        const includeDraft = draft === "true";
        const result = await documentService.getDocumentsByType(
          type as string,
          parseInt(page as string),
          parseInt(limit as string),
          includeDraft
        );

        return res.json({
          success: true,
          ...result,
        });
      }

      // Get all documents
      const includeDraft = draft === "true";
      const result = await documentService.getAllDocuments(
        parseInt(page as string),
        parseInt(limit as string),
        includeDraft
      );

      res.json({
        success: true,
        ...result,
      });
    } catch (error: any) {
      throw error;
    }
  }

  async updateDocument(req: Request, res: Response) {
    try {
      await validateRequest(req, res, async () => {
        const { uid } = req.params;
        const updates = req.body;

        const document = await documentService.updateDocument(uid, updates);

        res.json({
          success: true,
          data: document,
        });
      });
    } catch (error: any) {
      throw error;
    }
  }

  async deleteDocument(req: Request, res: Response) {
    try {
      const { uid } = req.params;
      await documentService.deleteDocument(uid);

      res.status(204).send();
    } catch (error: any) {
      throw error;
    }
  }

  async publishDocument(req: Request, res: Response) {
    try {
      const { uid } = req.params;
      const document = await documentService.updateDocument(uid, {
        status: "published",
      });

      res.json({
        success: true,
        data: document,
      });
    } catch (error: any) {
      throw error;
    }
  }

  async unpublishDocument(req: Request, res: Response) {
    try {
      const { uid } = req.params;
      const document = await documentService.updateDocument(uid, {
        status: "draft",
      });

      res.json({
        success: true,
        data: document,
      });
    } catch (error: any) {
      throw error;
    }
  }
}
