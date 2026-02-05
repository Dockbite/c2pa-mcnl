import { SchemaPath, validate } from '@angular/forms/signals';

export function fileMimeTypeValidator(
  field: SchemaPath<unknown>,
  acceptedMimeTypes: string[],
) {
  validate(field, ({ value }) => {
    if (!value()) {
      return null;
    }

    const file = value();
    if (!(file instanceof File)) {
      return { kind: 'fileSize', message: 'Must be a file' };
    }

    if (!acceptedMimeTypes.includes(file.type)) {
      return {
        kind: 'fileMimeType',
        message: `File type must be one of: ${acceptedMimeTypes.join(', ')}`,
      };
    }

    return null;
  });
}
