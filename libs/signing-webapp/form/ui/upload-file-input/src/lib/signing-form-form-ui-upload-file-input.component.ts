import { Component, input } from '@angular/core';
import { FileUploadComponent } from '@c2pa-mcnl/shared/ui/file-upload';
import { FieldTree, FormField } from '@angular/forms/signals';

@Component({
  selector: 'lib-ui-upload-file-input',
  standalone: true,
  imports: [FileUploadComponent, FormField],
  templateUrl: './signing-form-form-ui-upload-file-input.component.html',
})
export class SigningFormFormUiUploadFileInputComponent {
  // UI Inputs
  label = input.required<string>();
  inputId = input.required<string>();
  description = input<string>();
  required = input(false);

  // Passthrough Inputs for File Upload
  acceptedMimeTypes = input.required<string[]>();
  maxFileSizeBytes = input.required<number>();
  control = input.required<FieldTree<File | null>>();
}
