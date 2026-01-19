import { Request, Response } from "express";
import { SliceService } from "../services/SliceService";
import { validateRequest } from "../middleware/validation";
import { SliceWebhookService } from "@/services/SliceWebhookService";

const sliceService = new SliceService();

export class SliceController {
  private webhookService = new SliceWebhookService();
  async createSlice(req: Request, res: Response) {
    try {
      await validateRequest(req, res, async () => {
        const { sliceType, name, description, schema, itemsSchema } = req.body;

        const slice = await sliceService.createSlice(
          sliceType,
          name,
          description,
          schema,
          itemsSchema
        );
        // Send webhook notification
        await this.webhookService.notifySliceCreated(slice);

        res.status(201).json({
          success: true,
          data: slice,
        });
      });
    } catch (error: any) {
      throw error;
    }
  }

  async getSlice(req: Request, res: Response) {
    try {
      const { sliceType } = req.params;
      const slice = await sliceService.getSlice(sliceType);

      res.json({
        success: true,
        data: slice,
      });
    } catch (error: any) {
      throw error;
    }
  }

  async getAllSlices(req: Request, res: Response) {
    try {
      const { contentType } = req.query;

      if (contentType) {
        const slices = await sliceService.getSlicesByContentType(
          contentType as string
        );
        return res.json({
          success: true,
          data: slices,
        });
      }

      const slices = await sliceService.getAllSlices();

      res.json({
        success: true,
        data: slices,
      });
    } catch (error: any) {
      throw error;
    }
  }

  async updateSlice(req: Request, res: Response) {
    try {
      const { sliceType } = req.params;
      const updates = req.body;

      const slice = await sliceService.updateSlice(sliceType, updates);
      // Send webhook notification
      await this.webhookService.notifySliceUpdated(slice);

      res.json({
        success: true,
        data: slice,
      });
    } catch (error: any) {
      throw error;
    }
  }
  async deleteSlice(req: Request, res: Response) {
    try {
      const { sliceType } = req.params;
      await this.webhookService.notifySliceDeleted(sliceType);
      await sliceService.deleteSlice(sliceType);

      res.status(204).send();
    } catch (error: any) {
      throw error;
    }
  }

  // async deleteSlice(req: Request, res: Response) {
  //   try {
  //     const { sliceType } = req.params;
  //     await sliceService.deleteSlice(sliceType);

  //     res.status(204).send();
  //   } catch (error: any) {
  //     throw error;
  //   }
  // }

  async validateSlice(req: Request, res: Response) {
    try {
      const { sliceType } = req.params;
      const { data } = req.body;

      const isValid = await sliceService.validateSliceData(sliceType, data);

      res.json({
        success: true,
        valid: isValid,
      });
    } catch (error: any) {
      throw error;
    }
  }
}
