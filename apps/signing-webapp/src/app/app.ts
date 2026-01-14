import { Component } from '@angular/core';
import { RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FileUploadComponent } from './file-upload/file-upload.component';

@Component({
  imports: [CommonModule, RouterModule, FileUploadComponent],
  selector: 'app-root',
  templateUrl: './app.html',
  styleUrl: './app.css',
})
export class App {
  protected title = 'signing-webapp';

  // Configure accepted MIME types
  acceptedMimeTypes: string[] = [
    'image/jpeg',
    'image/png',
    'image/heic',
    'image/heif',
    'video/mp4',
    'audio/mpeg',
  ];

  // 1GB in bytes
  maxFileSizeBytes = 1024 * 1024 * 1024;

  uploadedFile: File | null = null;

  onFileSelected(file: File): void {
    console.log('File selected:', file);
    this.uploadedFile = file;
    // Process the file here - it's not uploaded to any API
    // You can read it, transform it, etc.
  }

  onUploadError(error: string): void {
    console.error('Upload error:', error);
    this.uploadedFile = null;
  }

  formatFileSize(bytes: number): string {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i];
  }
}
