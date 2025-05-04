export interface SegmentResponse {
    name: string;
    downloadUrl: string;
    sizeKB: number;
  }
  
  export interface FileProcessingResponse {
    originalFileName: string;
    totalParts: number;
    segments: SegmentResponse[];
  }

  