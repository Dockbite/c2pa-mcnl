import { SchemaPath, validate } from '@angular/forms/signals';

export function fileMimeTypeValidator(
  field: SchemaPath<unknown>,
  allowedMimeTypes: string[],
) {
  validate(field, ({ value }) => {
    if (!value()) {
      return null;
    }

    const file = value();
    if (!(file instanceof File)) {
      return { kind: 'fileMimeType', message: 'Must be a file' };
    }

    const normalizedFileType = file.type.toLowerCase();
    const isAllowed = allowedMimeTypes.some((allowedType) => {
      const normalizedAllowedType = allowedType.toLowerCase();

      // Exact match
      if (normalizedFileType === normalizedAllowedType) {
        return true;
      }

      // Wildcard match (e.g., image/*)
      if (normalizedAllowedType.endsWith('/*')) {
        const baseType = normalizedAllowedType.slice(0, -2);
        return normalizedFileType.startsWith(baseType + '/');
      }

      return false;
    });

    if (!isAllowed) {
      return {
        kind: 'fileMimeType',
        message: `File type must be one of: ${allowedMimeTypes.join(', ')}`,
      };
    }

    return null;
  });
}
