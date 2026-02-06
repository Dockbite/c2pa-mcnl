import { SchemaPath, validate } from '@angular/forms/signals';
import { formatFileSize } from '@c2pa-mcnl/shared/utils/helpers';

export function fileSizeValidator(
  field: SchemaPath<unknown>,
  options: { minSize?: number; maxSize?: number },
) {
  validate(field, ({ value }) => {
    if (!value()) {
      return null;
    }

    const file = value();
    if (!(file instanceof File)) {
      return { kind: 'fileSize', message: 'Must be a file' };
    }

    if (options.minSize && file.size < options.minSize) {
      return {
        kind: 'fileSize',
        message: `File size must be greater than ${formatFileSize(options.minSize)}`,
      };
    }

    if (options.maxSize && file.size > options.maxSize) {
      return {
        kind: 'fileSize',
        message: `File size must be less than ${formatFileSize(options.maxSize)}`,
      };
    }

    return null;
  });
}
