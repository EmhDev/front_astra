import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { FileProcessingResponse } from '../models/file-processing-response.model';
import { SegmentResponse } from '../models/file-processing-response.model';

//app/services/upload-file.services.ts
@Injectable({
  providedIn: 'root',
})
export class UploadFileService {
  private baseUrl = 'http://localhost:8080/archives';

  constructor(private http: HttpClient) {}

  uploadFile(
    file: File,
    partSizes: number[]
  ): Observable<FileProcessingResponse> {
    const formData = new FormData();
    formData.append('file', file);

    partSizes.forEach((size) => {
      formData.append('partSizes', size.toString());
    });

    return this.http.post<FileProcessingResponse>(
      'http://localhost:8080/archives/upload',
      formData
    );
  }

  getSegments(fileName: string): Observable<string[]> {
    return this.http.get<string[]>(`${this.baseUrl}/segments`, {
      params: { fileName },
    });
  }

  sendEmail(payload: any): Observable<void> {
    return this.http.post<void>(
      'http://localhost:8080/archives/send-email',
      payload
    );
  }

  reconstructFromParts(formData: FormData): Observable<Blob> {
    return this.http.post(
      'http://localhost:8080/archives/reconstruct-from-parts',
      formData,
      {
        responseType: 'blob',
      }
    );
  }
}
