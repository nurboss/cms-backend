export interface SliceSchemaField {
  id: string;
  type:
    | "text"
    | "rich_text"
    | "number"
    | "boolean"
    | "image"
    | "group"
    | "select"
    | "date";
  label: string;
  required?: boolean;
  config?: Record<string, any>;
}

export interface SliceSchema {
  primary: SliceSchemaField[];
  items?: SliceSchemaField[];
}

export interface ContentTypeSchemaField {
  id: string;
  type: "text" | "uid" | "boolean" | "number" | "date" | "select";
  label: string;
  required?: boolean;
  config?: Record<string, any>;
}

export interface ContentTypeSchema {
  fields: ContentTypeSchemaField[];
}

export interface SliceData {
  slice_type: string;
  slice_label?: string;
  primary: Record<string, any>;
  items?: Array<Record<string, any>>;
}

export interface DocumentData {
  title: string;
  uid: string;
  body: SliceData[];
  [key: string]: any;
}

export interface DocumentResponse {
  id: string;
  uid: string;
  title: string;
  contentType: string;
  data: DocumentData;
  status: string;
  publishedAt: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  meta: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
}

export interface Asset {
  id: string;
  filename: string;
  mimeType: string;
  url: string;
  size: number;
  width?: number;
  height?: number;
  altText?: string;
  createdAt: string;
  updatedAt: string;
}
