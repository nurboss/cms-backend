import { Prisma } from "../../generated/prisma/client";
import { prisma } from "../../lib/prisma";
import { DocumentData, DocumentResponse, PaginatedResponse } from "../types";
import { documentDataSchema } from "../utils/validation";
import {
  AppError,
  NotFoundError,
  ValidationError,
} from "../utils/error-handler";

export class DocumentService {
  async createDocument(
    uid: string,
    title: string,
    contentType: string,
    data: DocumentData,
    status: "draft" | "published" = "draft"
  ): Promise<DocumentResponse> {
    try {
      // Validate document data
      const validatedData = documentDataSchema.parse(data);

      // Check if UID already exists
      const existingDocument = await prisma.document.findUnique({
        where: { uid },
      });

      if (existingDocument) {
        throw new ValidationError(`Document with UID "${uid}" already exists`);
      }

      // Check if content type exists
      const contentTypeExists = await prisma.contentType.findUnique({
        where: { name: contentType },
      });

      if (!contentTypeExists) {
        throw new ValidationError(
          `Content type "${contentType}" does not exist`
        );
      }

      const document = await prisma.document.create({
        data: {
          uid,
          title,
          contentType,
          data: validatedData as Prisma.JsonObject,
          status,
          publishedAt: status === "published" ? new Date() : null,
        },
      });

      return this.formatDocumentResponse(document);
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        if (error.code === "P2002") {
          throw new ValidationError("Document with this UID already exists");
        }
      }
      throw error;
    }
  }

  async getDocumentByUid(
    uid: string,
    includeDraft: boolean = false
  ): Promise<DocumentResponse | null> {
    const where: any = { uid };
    if (!includeDraft) {
      where.status = "published";
    }

    const document = await prisma.document.findFirst({
      where,
    });

    if (!document) {
      return null;
    }

    return this.formatDocumentResponse(document);
  }

  async getDocumentsByType(
    contentType: string,
    page: number = 1,
    limit: number = 20,
    includeDraft: boolean = false
  ): Promise<PaginatedResponse<DocumentResponse>> {
    const skip = (page - 1) * limit;
    const where: any = { contentType };

    if (!includeDraft) {
      where.status = "published";
    }

    const [documents, total] = await Promise.all([
      prisma.document.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: "desc" },
      }),
      prisma.document.count({ where }),
    ]);

    return {
      data: documents.map((doc) => this.formatDocumentResponse(doc)),
      meta: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    };
  }

  async getAllDocuments(
    page: number = 1,
    limit: number = 20,
    includeDraft: boolean = false
  ): Promise<PaginatedResponse<DocumentResponse>> {
    const skip = (page - 1) * limit;
    const where: any = {};

    if (!includeDraft) {
      where.status = "published";
    }

    const [documents, total] = await Promise.all([
      prisma.document.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: "desc" },
      }),
      prisma.document.count({ where }),
    ]);

    return {
      data: documents.map((doc) => this.formatDocumentResponse(doc)),
      meta: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    };
  }

  async updateDocument(
    uid: string,
    updates: Partial<{
      title: string;
      data: DocumentData;
      status: "draft" | "published";
    }>
  ): Promise<DocumentResponse> {
    try {
      const existing = await prisma.document.findUnique({
        where: { uid },
      });

      if (!existing) {
        throw new NotFoundError("Document not found");
      }

      const updateData: any = { ...updates };

      // Validate data if provided
      if (updates.data) {
        updateData.data = documentDataSchema.parse(
          updates.data
        ) as Prisma.JsonObject;
      }

      // Handle publish status change
      if (updates.status === "published" && existing.status !== "published") {
        updateData.publishedAt = new Date();
      } else if (
        updates.status === "draft" &&
        existing.status === "published"
      ) {
        updateData.publishedAt = null;
      }

      const document = await prisma.document.update({
        where: { uid },
        data: updateData,
      });

      return this.formatDocumentResponse(document);
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        if (error.code === "P2025") {
          throw new NotFoundError("Document not found");
        }
      }
      throw error;
    }
  }

  async deleteDocument(uid: string): Promise<void> {
    try {
      await prisma.document.delete({
        where: { uid },
      });
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        if (error.code === "P2025") {
          throw new NotFoundError("Document not found");
        }
      }
      throw error;
    }
  }

  async searchDocuments(
    query: string,
    contentType?: string,
    page: number = 1,
    limit: number = 20
  ): Promise<PaginatedResponse<DocumentResponse>> {
    const skip = (page - 1) * limit;
    const where: any = {
      OR: [
        { title: { contains: query, mode: "insensitive" } },
        { uid: { contains: query, mode: "insensitive" } },
      ],
      status: "published",
    };

    if (contentType) {
      where.contentType = contentType;
    }

    const [documents, total] = await Promise.all([
      prisma.document.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: "desc" },
      }),
      prisma.document.count({ where }),
    ]);

    return {
      data: documents.map((doc) => this.formatDocumentResponse(doc)),
      meta: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    };
  }

  private formatDocumentResponse(document: any): DocumentResponse {
    return {
      id: document.id,
      uid: document.uid,
      title: document.title,
      contentType: document.contentType,
      data: document.data as DocumentData,
      status: document.status,
      publishedAt: document.publishedAt?.toISOString() || null,
      createdAt: document.createdAt.toISOString(),
      updatedAt: document.updatedAt.toISOString(),
    };
  }
}
