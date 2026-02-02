import {
  Component,
  computed,
  ElementRef,
  input,
  output,
  signal,
  viewChild,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { formatFileSize } from '@c2pa-mcnl/shared/utils';

@Component({
  selector: 'lib-shared-ui-file-upload',
  imports: [CommonModule],
  templateUrl: './file-upload.component.html',
  styleUrl: './file-upload.component.css',
})
export class FileUploadComponent {
  readonly formatFileSize = formatFileSize;

  acceptedMimeTypes = input<string[]>([
    'image/jpeg',
    'image/png',
    'image/heic',
    'image/heif',
    'video/mp4',
    'audio/mpeg',
  ]);
  maxFileSizeBytes = input<number>(1024 * 1024 * 1024); // 1GB default
  fileSelected = output<File>();
  uploadError = output<string>();

  isDragging = signal(false);
  selectedFile = signal<File | null>(null);
  errorMessage = signal<string>('');

  fileInput = viewChild<ElementRef<HTMLInputElement>>('fileInput');

  acceptAttribute = computed(() => this.acceptedMimeTypes().join(','));

  onDragOver(event: DragEvent): void {
    event.preventDefault();
    event.stopPropagation();
    this.isDragging.set(true);
  }

  onDragLeave(event: DragEvent): void {
    event.preventDefault();
    event.stopPropagation();
    this.isDragging.set(false);
  }

  onDrop(event: DragEvent): void {
    event.preventDefault();
    event.stopPropagation();
    this.isDragging.set(false);

    const files = event.dataTransfer?.files;
    if (files && files.length > 0) {
      this.handleFile(files[0]);
    }
  }

  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      this.handleFile(input.files[0]);
    }
  }

  private handleFile(file: File): void {
    this.errorMessage.set('');

    // Validate file size
    if (file.size > this.maxFileSizeBytes()) {
      const maxSizeMB = Math.round(this.maxFileSizeBytes() / (1024 * 1024));
      const error = `File size exceeds the maximum limit of ${maxSizeMB}MB`;
      this.errorMessage.set(error);
      this.uploadError.emit(error);
      return;
    }

    // Validate MIME type
    if (
      this.acceptedMimeTypes().length > 0 &&
      !this.acceptedMimeTypes().includes(file.type)
    ) {
      const error = `File type "${file.type}" is not supported. Accepted types: ${this.acceptedMimeTypes().join(', ')}`;
      this.errorMessage.set(error);
      this.uploadError.emit(error);
      return;
    }

    this.selectedFile.set(file);
    this.fileSelected.emit(file);
  }

  removeFile(): void {
    this.selectedFile.set(null);
    this.errorMessage.set('');
    // Clear the file input
    const input = this.fileInput()?.nativeElement;
    if (input) {
      input.value = '';
    }
  }

  chooseNewFile(): void {
    const input = this.fileInput();
    if (input?.nativeElement) {
      input.nativeElement.click();
    }
  }
}
