import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { UploadFileService } from './services/upload-file.service';
import { SegmentResponse } from './models/file-processing-response.model';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css',
})
export class AppComponent {
  selectedFile: File | null = null;
  fileSizeKB = 0;
  fileSizeMB = 0;

  partCount = 1;
  partSizes: number[] = [];
  remainingSize = 0;

  isProcessing = false;
  segments: SegmentResponse[] = [];

  onPartSizeChange() {
    this.updateRemainingSize();
  }

  constructor(private uploadService: UploadFileService) {}

  onFileSelected(event: any) {
    this.selectedFile = event.target.files[0];
    if (this.selectedFile) {
      this.fileSizeKB = Math.round(this.selectedFile.size / 1024);
      this.fileSizeMB = +(this.fileSizeKB / 1024).toFixed(2);
      this.remainingSize = this.fileSizeKB;
      this.updateParts();
    }
  }

  updateParts() {
    this.partSizes = new Array(this.partCount).fill(0);
    this.updateRemainingSize();
  }

  updateRemainingSize() {
    const totalUsed = this.partSizes.reduce((sum, s) => sum + s, 0);
    this.remainingSize = this.fileSizeKB - totalUsed;
  }

  processFile() {
    if (!this.selectedFile || this.remainingSize < 0) return;

    this.isProcessing = true;
    this.segments = [];

    this.uploadService.uploadFile(this.selectedFile, this.partSizes).subscribe({
      next: (data) => {
        console.log('Segmentos recibidos:', data);
        this.segments = data.segments;
        this.isProcessing = false;
      },
      error: (err) => {
        console.error('Error al enviar archivo:', err);
        this.isProcessing = false;
      },
    });
  }

  recipientEmail: string = '';

  sendEmail() {
    if (!this.recipientEmail || !this.selectedFile) return;

    const emailPayload = {
      email: this.recipientEmail,
      originalFileName: this.selectedFile.name,
      segments: this.segments,
    };

    this.uploadService.sendEmail(emailPayload).subscribe({
      next: () => alert('Correo enviado correctamente!!'),
      error: (err) => console.error('Error al enviar correo', err),
    });
  }

  selectedParts: File[] = [];

  onMultipleFilesSelected(event: any) {
    this.selectedParts = Array.from(event.target.files);
  }

  reconstructFromSelectedParts() {
    if (this.selectedParts.length === 0) return;

    const formData = new FormData();
    this.selectedParts.forEach((file) => formData.append('parts', file));

    this.uploadService.reconstructFromParts(formData).subscribe({
      next: (blob) => {
        const a = document.createElement('a');
        const url = window.URL.createObjectURL(blob);
        a.href = url;
        a.download = this.extractOriginalName(this.selectedParts[0].name); // ej: documento.jpg
        a.click();
        window.URL.revokeObjectURL(url);
      },
      error: (err) => console.error('Error reconstruyendo desde partes', err),
    });
  }

  extractOriginalName(partName: string): string {
    return partName.split('.').slice(0, -1).join('.');
  }

  trackByIndex(index: number, _item: any): number {
    return index;
  }
  
}
