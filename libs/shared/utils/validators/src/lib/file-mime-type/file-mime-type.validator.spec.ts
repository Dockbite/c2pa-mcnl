import { TestBed } from '@angular/core/testing';
import { signal } from '@angular/core';
import { form } from '@angular/forms/signals';
import { fileMimeTypeValidator } from './file-mime-type.validator';

// Helper to create a File with specific MIME type
function createTestFile(
  name: string,
  type: string,
  content = 'test content',
): File {
  const blob = new Blob([content], { type });
  return new File([blob], name, { type });
}

describe('fileMimeTypeValidator', () => {
  let fileModel: ReturnType<typeof signal<{ file: File | null }>>;
  let fileForm: ReturnType<typeof form<{ file: File | null }>>;

  async function flushAsync() {
    await TestBed.tick();
    await new Promise((resolve) => setTimeout(resolve, 0));
    await TestBed.tick();
  }

  function setupValidator(options: { allowedMimeTypes: string[] }) {
    TestBed.runInInjectionContext(() => {
      fileModel = signal<{ file: File | null }>({ file: null });
      fileForm = form(fileModel, (schemaPath) => {
        fileMimeTypeValidator(schemaPath.file, options.allowedMimeTypes);
      });
    });
  }

  beforeEach(() => {
    TestBed.configureTestingModule({});
  });

  describe('basic validation', () => {
    beforeEach(() => {
      setupValidator({ allowedMimeTypes: ['application/pdf'] });
    });

    it('should return no errors for empty value', async () => {
      fileModel.set({ file: null });
      await flushAsync();

      expect(fileForm.file().errors()).toEqual([]);
    });

    it('should return error for non-file value', async () => {
      fileModel.set({ file: 'not a file' as any });
      await flushAsync();

      expect(fileForm.file().errors()).toContainEqual(
        expect.objectContaining({
          kind: 'fileMimeType',
          message: 'Must be a file',
        }),
      );
    });
  });

  describe('single MIME type validation', () => {
    beforeEach(() => {
      setupValidator({ allowedMimeTypes: ['application/pdf'] });
    });

    it('should return no errors for file with allowed MIME type', async () => {
      const validFile = createTestFile('document.pdf', 'application/pdf');
      fileModel.set({ file: validFile });
      await flushAsync();

      expect(fileForm.file().errors()).toEqual([]);
    });

    it('should return error for file with disallowed MIME type', async () => {
      const invalidFile = createTestFile('image.jpg', 'image/jpeg');
      fileModel.set({ file: invalidFile });
      await flushAsync();

      expect(fileForm.file().errors()).toContainEqual(
        expect.objectContaining({
          kind: 'fileMimeType',
          message: expect.stringContaining('File type must be'),
        }),
      );
    });
  });

  describe('multiple MIME types validation', () => {
    beforeEach(() => {
      setupValidator({
        allowedMimeTypes: ['image/jpeg', 'image/png', 'image/gif'],
      });
    });

    it('should return no errors for file with first allowed MIME type', async () => {
      const validFile = createTestFile('photo.jpg', 'image/jpeg');
      fileModel.set({ file: validFile });
      await flushAsync();

      expect(fileForm.file().errors()).toEqual([]);
    });

    it('should return no errors for file with middle allowed MIME type', async () => {
      const validFile = createTestFile('photo.png', 'image/png');
      fileModel.set({ file: validFile });
      await flushAsync();

      expect(fileForm.file().errors()).toEqual([]);
    });

    it('should return no errors for file with last allowed MIME type', async () => {
      const validFile = createTestFile('photo.gif', 'image/gif');
      fileModel.set({ file: validFile });
      await flushAsync();

      expect(fileForm.file().errors()).toEqual([]);
    });

    it('should return error for file with disallowed MIME type', async () => {
      const invalidFile = createTestFile('document.pdf', 'application/pdf');
      fileModel.set({ file: invalidFile });
      await flushAsync();

      expect(fileForm.file().errors()).toContainEqual(
        expect.objectContaining({
          kind: 'fileMimeType',
          message: expect.stringContaining('File type must be'),
        }),
      );
    });
  });

  describe('wildcard MIME type validation', () => {
    beforeEach(() => {
      setupValidator({ allowedMimeTypes: ['image/*'] });
    });

    it('should return no errors for any image MIME type', async () => {
      const imageTypes = [
        createTestFile('photo.jpg', 'image/jpeg'),
        createTestFile('photo.png', 'image/png'),
        createTestFile('photo.gif', 'image/gif'),
        createTestFile('photo.webp', 'image/webp'),
      ];

      for (const file of imageTypes) {
        fileModel.set({ file });
        await flushAsync();
        expect(fileForm.file().errors()).toEqual([]);
      }
    });

    it('should return error for non-image MIME type', async () => {
      const invalidFile = createTestFile('document.pdf', 'application/pdf');
      fileModel.set({ file: invalidFile });
      await flushAsync();

      expect(fileForm.file().errors()).toContainEqual(
        expect.objectContaining({
          kind: 'fileMimeType',
          message: expect.stringContaining('File type must be'),
        }),
      );
    });
  });

  describe('mixed specific and wildcard MIME types', () => {
    beforeEach(() => {
      setupValidator({
        allowedMimeTypes: ['application/pdf', 'image/*', 'text/plain'],
      });
    });

    it('should return no errors for specific allowed MIME type', async () => {
      const pdfFile = createTestFile('document.pdf', 'application/pdf');
      fileModel.set({ file: pdfFile });
      await flushAsync();

      expect(fileForm.file().errors()).toEqual([]);
    });

    it('should return no errors for wildcard matching MIME type', async () => {
      const imageFile = createTestFile('photo.jpg', 'image/jpeg');
      fileModel.set({ file: imageFile });
      await flushAsync();

      expect(fileForm.file().errors()).toEqual([]);
    });

    it('should return no errors for another specific allowed MIME type', async () => {
      const textFile = createTestFile('notes.txt', 'text/plain');
      fileModel.set({ file: textFile });
      await flushAsync();

      expect(fileForm.file().errors()).toEqual([]);
    });

    it('should return error for disallowed MIME type', async () => {
      const invalidFile = createTestFile('video.mp4', 'video/mp4');
      fileModel.set({ file: invalidFile });
      await flushAsync();

      expect(fileForm.file().errors()).toContainEqual(
        expect.objectContaining({
          kind: 'fileMimeType',
          message: expect.stringContaining('File type must be'),
        }),
      );
    });
  });

  describe('case sensitivity', () => {
    beforeEach(() => {
      setupValidator({ allowedMimeTypes: ['application/pdf'] });
    });

    it('should handle lowercase MIME type', async () => {
      const file = createTestFile('document.pdf', 'application/pdf');
      fileModel.set({ file });
      await flushAsync();

      expect(fileForm.file().errors()).toEqual([]);
    });

    it('should handle uppercase MIME type', async () => {
      const file = createTestFile('document.pdf', 'APPLICATION/PDF');
      fileModel.set({ file });
      await flushAsync();

      expect(fileForm.file().errors()).toEqual([]);
    });

    it('should handle mixed case MIME type', async () => {
      const file = createTestFile('document.pdf', 'Application/PDF');
      fileModel.set({ file });
      await flushAsync();

      expect(fileForm.file().errors()).toEqual([]);
    });
  });
});
