export interface Document {
  id: string;
  jobId?: string;
  job_id?: string;
  originalName: string;
  filename: string;
  filePath?: string;
  processedFilePath?: string;
  size: number;
  mimeType: string;
  type: string;
  status: DocumentStatus;
  results?: DocumentResults;
  error?: string;
  processingTime?: number;
  createdAt: string;
  completedAt?: string;
  completed_at?: string;
  processedAt?: string;
  userId: string;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  metadata?: any;
}

export interface DocumentResults {
  filename: string;
  originalName: string;
  size: number;
  type: string;
  mimeType: string;
  dimensions?: {
    width: number;
    height: number;
  };
  pageCount?: number;
  textContent?: string;
  processingTime: number;
}

export type DocumentStatus = "PENDING" | "PROCESSING" | "COMPLETED" | "FAILED";

export interface QueueResponse {
  queueId: string;
  message: string;
  estimatedTime: number;
  fileSize: number;
  filename: string;
}

export interface DocumentUploadResponse {
  documentId: string;
  jobId: string;
  queueId: string;
  message: string;
  estimatedTime: number;
  fileSize: number;
  filename: string;
}

export interface DocumentListResponse {
  documents: Document[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
}

export interface DocumentDownloadResponse {
  filename: string;
  path: string;
}
