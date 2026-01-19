import { Request, Response } from "express";
import { ContentTypeService } from "../services/ContentTypeService";
import { validateRequest } from "../middleware/validation";

const contentTypeService = new ContentTypeService();

export class ContentTypeController {
  async createContentType(req: Request, res: Response) {
    try {
      await validateRequest(req, res, async () => {
        const { name, description, schema } = req.body;

        const contentType = await contentTypeService.createContentType(
          name,
          description,
          schema
        );

        res.status(201).json({
          success: true,
          data: contentType,
        });
      });
    } catch (error: any) {
      throw error;
    }
  }

  async getContentType(req: Request, res: Response) {
    try {
      const { name } = req.params;
      const { withDocuments, page = "1", limit = "20" } = req.query;

      if (withDocuments === "true") {
        const result = await contentTypeService.getContentTypeWithDocuments(
          name,
          parseInt(page as string),
          parseInt(limit as string)
        );

        return res.json({
          success: true,
          ...result,
        });
      }

      const contentType = await contentTypeService.getContentType(name);

      res.json({
        success: true,
        data: contentType,
      });
    } catch (error: any) {
      throw error;
    }
  }

  async getAllContentTypes(req: Request, res: Response) {
    try {
      const contentTypes = await contentTypeService.getAllContentTypes();

      res.json({
        success: true,
        data: contentTypes,
      });
    } catch (error: any) {
      throw error;
    }
  }

  async updateContentType(req: Request, res: Response) {
    try {
      const { name } = req.params;
      const updates = req.body;

      const contentType = await contentTypeService.updateContentType(
        name,
        updates
      );

      res.json({
        success: true,
        data: contentType,
      });
    } catch (error: any) {
      throw error;
    }
  }

  async deleteContentType(req: Request, res: Response) {
    try {
      const { name } = req.params;
      await contentTypeService.deleteContentType(name);

      res.status(204).send();
    } catch (error: any) {
      throw error;
    }
  }
}
