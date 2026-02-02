import { Component } from '@angular/core';
import { RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FileUploadComponent } from '@c2pa-mcnl/shared/ui/file-upload';
import { formatFileSize } from '@c2pa-mcnl/shared/utils';

@Component({
  imports: [CommonModule, RouterModule, FileUploadComponent],
  selector: 'app-root',
  templateUrl: './app.html',
  styleUrl: './app.css',
})
export class App {
  readonly formatFileSize = formatFileSize;
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
}
