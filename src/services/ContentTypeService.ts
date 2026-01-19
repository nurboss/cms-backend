import { Prisma } from "../../generated/prisma/client";
import { prisma } from "../../lib/prisma";
import { contentTypeSchemaSchema } from "../utils/validation";
import {
  AppError,
  NotFoundError,
  ValidationError,
} from "../utils/error-handler";

export class ContentTypeService {
  async createContentType(name: string, description: string, schema: any) {
    try {
      // Validate schema
      const validatedSchema = contentTypeSchemaSchema.parse(schema);

      // Check if content type already exists
      const existing = await prisma.contentType.findUnique({
        where: { name },
      });

      if (existing) {
        throw new ValidationError(`Content type "${name}" already exists`);
      }

      const contentType = await prisma.contentType.create({
        data: {
          name,
          description,
          schema: validatedSchema as Prisma.JsonObject,
        },
      });

      return contentType;
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        if (error.code === "P2002") {
          throw new ValidationError(
            "Content type with this name already exists"
          );
        }
      }
      throw error;
    }
  }

  async getContentType(name: string) {
    const contentType = await prisma.contentType.findUnique({
      where: { name },
      include: {
        documents: {
          take: 5,
          orderBy: { createdAt: "desc" },
        },
      },
    });

    if (!contentType) {
      throw new NotFoundError(`Content type "${name}" not found`);
    }

    return contentType;
  }

  async getAllContentTypes() {
    const contentTypes = await prisma.contentType.findMany({
      orderBy: { createdAt: "desc" },
      include: {
        _count: {
          select: { documents: true },
        },
      },
    });

    return contentTypes;
  }

  async updateContentType(
    name: string,
    updates: Partial<{
      description: string;
      schema: any;
    }>
  ) {
    try {
      if (updates.schema) {
        updates.schema = contentTypeSchemaSchema.parse(updates.schema);
      }

      const contentType = await prisma.contentType.update({
        where: { name },
        data: updates,
      });

      return contentType;
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        if (error.code === "P2025") {
          throw new NotFoundError("Content type not found");
        }
      }
      throw error;
    }
  }

  async deleteContentType(name: string) {
    try {
      await prisma.contentType.delete({
        where: { name },
      });
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        if (error.code === "P2025") {
          throw new NotFoundError("Content type not found");
        }
      }
      throw error;
    }
  }

  async getContentTypeWithDocuments(
    name: string,
    page: number = 1,
    limit: number = 20
  ) {
    const skip = (page - 1) * limit;

    const [contentType, documents, total] = await Promise.all([
      prisma.contentType.findUnique({
        where: { name },
      }),
      prisma.document.findMany({
        where: { contentType: name, status: "published" },
        skip,
        take: limit,
        orderBy: { createdAt: "desc" },
      }),
      prisma.document.count({
        where: { contentType: name, status: "published" },
      }),
    ]);

    if (!contentType) {
      throw new NotFoundError(`Content type "${name}" not found`);
    }

    return {
      contentType,
      documents,
      meta: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    };
  }
}
