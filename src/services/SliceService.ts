import { Prisma } from "../../generated/prisma/client";
import { prisma } from "../../lib/prisma";
import { sliceSchemaSchema } from "../utils/validation";
import {
  AppError,
  NotFoundError,
  ValidationError,
} from "../utils/error-handler";
import { SliceWebhookService } from "./SliceWebhookService";

export class SliceService {
  private webhookService = new SliceWebhookService();

  async createSlice(
    sliceType: string,
    name: string,
    description: string,
    schema: any,
    itemsSchema?: any,
  ) {
    try {
      // Validate schemas
      const validatedSchema = sliceSchemaSchema.parse(schema);
      const validatedItemsSchema = itemsSchema
        ? sliceSchemaSchema.parse(itemsSchema)
        : null;

      // Check if slice already exists
      const existing = await prisma.sliceDefinition.findUnique({
        where: { sliceType },
      });

      if (existing) {
        throw new ValidationError(
          `Slice with type "${sliceType}" already exists`,
        );
      }

      const slice = await prisma.sliceDefinition.create({
        data: {
          sliceType,
          name,
          description,
          schema: validatedSchema as Prisma.JsonObject,
          itemsSchema: validatedItemsSchema as Prisma.JsonObject,
        },
      });

      // Notify webhook (non-blocking)
      try {
        await this.webhookService.notifySliceCreated(slice);
      } catch {
        // intentionally ignored
      }

      return slice;
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        if (error.code === "P2002") {
          throw new ValidationError("Slice with this type already exists");
        }
      }
      throw error;
    }
  }

  async getSlice(sliceType: string) {
    const slice = await prisma.sliceDefinition.findUnique({
      where: { sliceType },
    });

    if (!slice) {
      throw new NotFoundError(`Slice "${sliceType}" not found`);
    }

    return slice;
  }

  async getAllSlices() {
    return prisma.sliceDefinition.findMany({
      orderBy: { createdAt: "desc" },
    });
  }

  async updateSlice(
    sliceType: string,
    updates: Partial<{
      name: string;
      description: string;
      schema: any;
      itemsSchema: any;
    }>,
  ) {
    try {
      if (updates.schema) {
        updates.schema = sliceSchemaSchema.parse(updates.schema);
      }

      if (updates.itemsSchema) {
        updates.itemsSchema = sliceSchemaSchema.parse(updates.itemsSchema);
      }

      const slice = await prisma.sliceDefinition.update({
        where: { sliceType },
        data: updates,
      });

      // Notify webhook (non-blocking)
      try {
        await this.webhookService.notifySliceUpdated(slice);
      } catch {
        // intentionally ignored
      }

      return slice;
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        if (error.code === "P2025") {
          throw new NotFoundError("Slice not found");
        }
      }
      throw error;
    }
  }

  async deleteSlice(sliceType: string) {
    try {
      // Delete first
      await prisma.sliceDefinition.delete({
        where: { sliceType },
      });

      // Notify webhook AFTER successful deletion
      try {
        await this.webhookService.notifySliceDeleted(sliceType);
      } catch {
        // intentionally ignored
      }
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        if (error.code === "P2025") {
          throw new NotFoundError("Slice not found");
        }
      }
      throw error;
    }
  }

  async getSlicesByContentType(contentType: string) {
    // Placeholder for future relationship logic
    return this.getAllSlices();
  }

  async validateSliceData(sliceType: string, data: any): Promise<boolean> {
    const slice = await this.getSlice(sliceType);
    if (!slice) return false;

    const { schema, itemsSchema } = slice;

    if (schema) {
      const primaryFields = (schema as any).primary || [];
      for (const field of primaryFields) {
        if (field.required && !data.primary?.[field.id]) {
          return false;
        }
      }
    }

    if (itemsSchema && data.items) {
      const itemFields = (itemsSchema as any).primary || [];
      for (const item of data.items) {
        for (const field of itemFields) {
          if (field.required && !item[field.id]) {
            return false;
          }
        }
      }
    }

    return true;
  }
}
