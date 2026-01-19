import { body } from "express-validator";
import { z } from "zod";

// Zod schemas for runtime validation
export const sliceSchemaSchema = z.object({
  primary: z.array(
    z.object({
      id: z.string(),
      type: z.enum([
        "text",
        "rich_text",
        "number",
        "boolean",
        "image",
        "group",
        "select",
        "date",
      ]),
      label: z.string(),
      required: z.boolean().optional(),
      config: z.record(z.string(), z.any()).optional(),
    })
  ),
  items: z
    .array(
      z.object({
        id: z.string(),
        type: z.enum([
          "text",
          "rich_text",
          "number",
          "boolean",
          "image",
          "group",
          "select",
          "date",
        ]),
        label: z.string(),
        required: z.boolean().optional(),
        config: z.record(z.string(), z.any()).optional(),
      })
    )
    .optional(),
});

export const contentTypeSchemaSchema = z.object({
  fields: z.array(
    z.object({
      id: z.string(),
      type: z.enum(["text", "uid", "boolean", "number", "date", "select"]),
      label: z.string(),
      required: z.boolean().optional(),
      config: z.record(z.string(), z.any()).optional(),
    })
  ),
});

export const documentDataSchema = z.object({
  title: z.string(),
  uid: z.string(),
  body: z.array(
    z.object({
      slice_type: z.string(),
      slice_label: z.string().optional(),
      primary: z.record(z.string(), z.any()),
      items: z.array(z.record(z.string(), z.any())).optional(),
    })
  ),
});

export const assetSchema = z.object({
  filename: z.string(),
  mimeType: z.string(),
  url: z.string(),
  size: z.number(),
  width: z.number().optional(),
  height: z.number().optional(),
  altText: z.string().optional(),
});

// Express validators
export const createContentTypeValidator = [
  body("name").isString().trim().notEmpty().withMessage("Name is required"),
  body("description").optional().isString(),
  body("schema").isObject().withMessage("Schema must be an object"),
];

export const createSliceValidator = [
  body("sliceType")
    .isString()
    .trim()
    .notEmpty()
    .withMessage("Slice type is required"),
  body("name").isString().trim().notEmpty().withMessage("Name is required"),
  body("description").optional().isString(),
  body("schema").isObject().withMessage("Schema must be an object"),
  body("itemsSchema").optional().isObject(),
];

export const createDocumentValidator = [
  body("uid").isString().trim().notEmpty().withMessage("UID is required"),
  body("title").isString().trim().notEmpty().withMessage("Title is required"),
  body("contentType")
    .isString()
    .trim()
    .notEmpty()
    .withMessage("Content type is required"),
  body("data").isObject().withMessage("Data must be an object"),
  body("status").optional().isIn(["draft", "published"]),
];

export const updateDocumentValidator = [
  body("title").optional().isString().trim().notEmpty(),
  body("data").optional().isObject(),
  body("status").optional().isIn(["draft", "published"]),
];
