import { TestBed } from '@angular/core/testing';
import { signal } from '@angular/core';
import { form } from '@angular/forms/signals';
import { fileSizeValidator } from './file-size.validator';

// Helper to create a File
function createTestFile(sizeInBytes: number, name = 'test.txt'): File {
  const content = new Array(sizeInBytes + 1).join('a');
  return new File([content], name, { type: 'text/plain' });
}

describe('fileSizeValidator', () => {
  let fileModel: ReturnType<typeof signal<{ file: File | null }>>;
  let fileForm: ReturnType<typeof form<{ file: File | null }>>;

  async function flushAsync() {
    await TestBed.tick();
    await new Promise((resolve) => setTimeout(resolve, 0));
    await TestBed.tick();
  }

  function setupValidator(options: { minSize?: number; maxSize?: number }) {
    TestBed.runInInjectionContext(() => {
      fileModel = signal<{ file: File | null }>({ file: null });
      fileForm = form(fileModel, (schemaPath) => {
        fileSizeValidator(schemaPath.file, options);
      });
    });
  }

  beforeEach(() => {
    TestBed.configureTestingModule({});
  });

  describe('basic validation', () => {
    beforeEach(() => {
      setupValidator({ maxSize: 1024 });
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
          kind: 'fileSize',
          message: 'Must be a file',
        }),
      );
    });
  });

  describe('max size validation', () => {
    const MAX_SIZE = 1024;

    beforeEach(() => {
      setupValidator({ maxSize: MAX_SIZE });
    });

    it('should return error for file exceeding max size', async () => {
      const largeFile = createTestFile(MAX_SIZE + 100);
      fileModel.set({ file: largeFile });
      await flushAsync();

      expect(fileForm.file().errors()).toContainEqual(
        expect.objectContaining({
          kind: 'fileSize',
          message: expect.stringContaining('File size must be less than'),
        }),
      );
    });

    it('should return no errors for file within size limit', async () => {
      const validFile = createTestFile(MAX_SIZE - 100);
      fileModel.set({ file: validFile });
      await flushAsync();

      expect(fileForm.file().errors()).toEqual([]);
    });

    it('should return no errors for file exactly at size limit', async () => {
      const validFile = createTestFile(MAX_SIZE);
      fileModel.set({ file: validFile });
      await flushAsync();

      expect(fileForm.file().errors()).toEqual([]);
    });
  });

  describe('min size validation', () => {
    const MIN_SIZE = 512;

    beforeEach(() => {
      setupValidator({ minSize: MIN_SIZE });
    });

    it('should return error for file below minimum size', async () => {
      const smallFile = createTestFile(MIN_SIZE - 100);
      fileModel.set({ file: smallFile });
      await flushAsync();

      expect(fileForm.file().errors()).toContainEqual(
        expect.objectContaining({
          kind: 'fileSize',
          message: expect.stringContaining('File size must be greater than'),
        }),
      );
    });

    it('should return no errors for file meeting minimum size', async () => {
      const validFile = createTestFile(MIN_SIZE + 100);
      fileModel.set({ file: validFile });
      await flushAsync();

      expect(fileForm.file().errors()).toEqual([]);
    });

    it('should return no errors for file exactly at minimum size', async () => {
      const validFile = createTestFile(MIN_SIZE);
      fileModel.set({ file: validFile });
      await flushAsync();

      expect(fileForm.file().errors()).toEqual([]);
    });
  });

  describe('combined min and max size validation', () => {
    const MIN_SIZE = 512;
    const MAX_SIZE = 2048;

    beforeEach(() => {
      setupValidator({ minSize: MIN_SIZE, maxSize: MAX_SIZE });
    });

    it('should return no errors for file within range', async () => {
      const validFile = createTestFile(1024);
      fileModel.set({ file: validFile });
      await flushAsync();

      expect(fileForm.file().errors()).toEqual([]);
    });

    it('should return error for file below minimum', async () => {
      const smallFile = createTestFile(MIN_SIZE - 100);
      fileModel.set({ file: smallFile });
      await flushAsync();

      expect(fileForm.file().errors()).toContainEqual(
        expect.objectContaining({
          kind: 'fileSize',
          message: expect.stringContaining('File size must be greater than'),
        }),
      );
    });

    it('should return error for file above maximum', async () => {
      const largeFile = createTestFile(MAX_SIZE + 100);
      fileModel.set({ file: largeFile });
      await flushAsync();

      expect(fileForm.file().errors()).toContainEqual(
        expect.objectContaining({
          kind: 'fileSize',
          message: expect.stringContaining('File size must be less than'),
        }),
      );
    });
  });
});
