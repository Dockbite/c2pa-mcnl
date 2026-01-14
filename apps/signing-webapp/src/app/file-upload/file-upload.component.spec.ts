import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FileUploadComponent } from './file-upload.component';
import { vi } from 'vitest';

describe('FileUploadComponent', () => {
  let component: FileUploadComponent;
  let fixture: ComponentFixture<FileUploadComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FileUploadComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(FileUploadComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should have default accepted mime types', () => {
    expect(component.acceptedMimeTypes()).toEqual([
      'image/jpeg',
      'image/png',
      'image/heic',
      'image/heif',
      'video/mp4',
      'audio/mpeg',
    ]);
  });

  it('should have default max file size of 1GB', () => {
    expect(component.maxFileSizeBytes()).toBe(1024 * 1024 * 1024);
  });

  it('should compute accept attribute from mime types', () => {
    expect(component.acceptAttribute()).toBe(
      'image/jpeg,image/png,image/heic,image/heif,video/mp4,audio/mpeg',
    );
  });

  it('should initially have no selected file', () => {
    expect(component.selectedFile()).toBeNull();
    expect(component.errorMessage()).toBe('');
  });

  it('should handle valid file selection via onFileSelected', () => {
    const file = new File(['content'], 'test.jpg', { type: 'image/jpeg' });
    const emitSpy = vi.spyOn(component.fileSelected, 'emit');
    const event = {
      target: {
        files: [file],
      },
    } as any;

    component.onFileSelected(event);

    expect(component.selectedFile()).toBe(file);
    expect(component.errorMessage()).toBe('');
    expect(emitSpy).toHaveBeenCalledWith(file);
  });

  it('should reject file with invalid mime type', () => {
    const file = new File(['content'], 'test.txt', { type: 'text/plain' });
    const emitSpy = vi.spyOn(component.uploadError, 'emit');
    const event = {
      target: {
        files: [file],
      },
    } as any;

    component.onFileSelected(event);

    expect(component.selectedFile()).toBeNull();
    expect(component.errorMessage()).toContain('not supported');
    expect(emitSpy).toHaveBeenCalled();
  });

  it('should reject file exceeding size limit', () => {
    const largeSize = 2 * 1024 * 1024 * 1024; // 2GB
    const file = new File(['x'], 'large.mp4', { type: 'video/mp4' });
    Object.defineProperty(file, 'size', { value: largeSize });
    const emitSpy = vi.spyOn(component.uploadError, 'emit');
    const event = {
      target: {
        files: [file],
      },
    } as any;

    component.onFileSelected(event);

    expect(component.selectedFile()).toBeNull();
    expect(component.errorMessage()).toContain('File size exceeds');
    expect(emitSpy).toHaveBeenCalled();
  });

  it('should handle file input change event', () => {
    const file = new File(['content'], 'test.png', { type: 'image/png' });
    const event = {
      target: {
        files: [file],
      },
    } as any;
    const emitSpy = vi.spyOn(component.fileSelected, 'emit');

    component.onFileSelected(event);

    expect(emitSpy).toHaveBeenCalledWith(file);
  });

  it('should not process when no files in input', () => {
    const event = {
      target: {
        files: [],
      },
    } as any;
    const emitSpy = vi.spyOn(component.fileSelected, 'emit');

    component.onFileSelected(event);

    expect(emitSpy).not.toHaveBeenCalled();
  });

  it('should handle drag over event', () => {
    const event = {
      preventDefault: vi.fn(),
      stopPropagation: vi.fn(),
    } as any as DragEvent;

    component.onDragOver(event);

    expect(event.preventDefault).toHaveBeenCalled();
    expect(event.stopPropagation).toHaveBeenCalled();
    expect(component.isDragging()).toBe(true);
  });

  it('should handle drag leave event', () => {
    component.isDragging.set(true);
    const event = {
      preventDefault: vi.fn(),
      stopPropagation: vi.fn(),
    } as any as DragEvent;

    component.onDragLeave(event);

    expect(event.preventDefault).toHaveBeenCalled();
    expect(event.stopPropagation).toHaveBeenCalled();
    expect(component.isDragging()).toBe(false);
  });

  it('should handle file drop', () => {
    const file = new File(['content'], 'dropped.jpg', { type: 'image/jpeg' });
    const event = {
      preventDefault: vi.fn(),
      stopPropagation: vi.fn(),
      dataTransfer: {
        files: [file],
      },
    } as any;
    const emitSpy = vi.spyOn(component.fileSelected, 'emit');

    component.onDrop(event);

    expect(event.preventDefault).toHaveBeenCalled();
    expect(event.stopPropagation).toHaveBeenCalled();
    expect(component.isDragging()).toBe(false);
    expect(emitSpy).toHaveBeenCalledWith(file);
  });

  it('should remove selected file when using the remove button', () => {
    const file = new File(['content'], 'test.jpg', { type: 'image/jpeg' });
    const event = {
      target: {
        files: [file],
      },
    } as any;
    component.onFileSelected(event);

    component.removeFile();

    expect(component.selectedFile()).toBeNull();
    expect(component.errorMessage()).toBe('');
  });

  it('should open file explorer when choosing new file', () => {
    const mockInput = document.createElement('input');
    const clickSpy = vi.spyOn(mockInput, 'click');
    vi.spyOn(component, 'fileInput' as any).mockReturnValue({
      nativeElement: mockInput,
    });

    component.chooseNewFile();

    expect(clickSpy).toHaveBeenCalled();
  });

  it('should format file size correctly', () => {
    expect(component.formatFileSize(500)).toBe('500 Bytes');
    expect(component.formatFileSize(1024)).toBe('1 KB');
    expect(component.formatFileSize(1048576)).toBe('1 MB');
    expect(component.formatFileSize(1073741824)).toBe('1 GB');
  });

  it('should clear error message when selecting valid file', () => {
    component.errorMessage.set('Previous error');
    const file = new File(['content'], 'test.jpg', { type: 'image/jpeg' });
    const event = {
      target: {
        files: [file],
      },
    } as any;

    component.onFileSelected(event);

    expect(component.errorMessage()).toBe('');
  });

  it('should update accept attribute when mime types change', () => {
    fixture.componentRef.setInput('acceptedMimeTypes', ['image/jpeg']);
    fixture.detectChanges();

    expect(component.acceptAttribute()).toBe('image/jpeg');
  });

  it('should check for the max file size', () => {
    const customSize = 500 * 1024 * 1024; // 500MB
    fixture.componentRef.setInput('maxFileSizeBytes', customSize);
    fixture.detectChanges();

    const largeFile = new File(['x'], 'large.mp4', { type: 'video/mp4' });
    Object.defineProperty(largeFile, 'size', { value: 600 * 1024 * 1024 });
    const event = {
      target: {
        files: [largeFile],
      },
    } as any;

    component.onFileSelected(event);

    expect(component.errorMessage()).toContain('File size exceeds');
  });
});
