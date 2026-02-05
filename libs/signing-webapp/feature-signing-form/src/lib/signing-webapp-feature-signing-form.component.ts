import { Component, effect, inject, signal } from '@angular/core';
import { SigningWebappFeatureSigningFormService } from './signing-webapp-feature-signing-form.service';
import { form, required } from '@angular/forms/signals';
import { UiUploadFileInputComponent } from '@c2pa-mcnl/signing-webapp/ui-upload-file-input';
import {
  fileMimeTypeValidator,
  fileSizeValidator,
  pemCertificateValidator,
} from '@c2pa-mcnl/shared/util-form-validators';
import {
  ASSET_MIME_TYPES,
  CERTIFICATE_MIME_TYPES,
  DID_MIME_TYPES,
} from '@c2pa-mcnl/shared/utils';

interface SigningData {
  leafCertificate: File | null;
  leafPrivateKey: File | null;
  intermediateCertificate: File | null;
  didFile: File | null;
  assetFile: File | null;
}

@Component({
  standalone: true,
  selector: 'lib-signing-webapp-feature-signing-form',
  imports: [UiUploadFileInputComponent],
  templateUrl: './signing-webapp-feature-signing-form.component.html',
  providers: [SigningWebappFeatureSigningFormService],
})
export class SigningWebappFeatureSigningFormComponent {
  private readonly service = inject(SigningWebappFeatureSigningFormService);

  readonly CERTIFICATE_MIME_TYPES = CERTIFICATE_MIME_TYPES;
  readonly DID_MIME_TYPES = DID_MIME_TYPES;
  readonly ASSET_MIME_TYPES = ASSET_MIME_TYPES;

  readonly CERTIFICATE_MAX_SIZE = 5 * 1024 * 1024;
  readonly DID_MAX_SIZE = 2 * 1024 * 1024;
  readonly ASSET_MAX_SIZE = 1024 * 1024 * 1024;

  readonly signingModel = signal<SigningData>({
    leafCertificate: null,
    leafPrivateKey: null,
    intermediateCertificate: null,
    didFile: null,
    assetFile: null,
  });

  readonly signingForm = form(this.signingModel, (schemaPath) => {
    /**
     * START - Leaf Certificate Validations
     */
    required(schemaPath.leafCertificate);
    pemCertificateValidator(schemaPath.leafCertificate);
    fileSizeValidator(schemaPath.leafCertificate, {
      maxSize: this.CERTIFICATE_MAX_SIZE,
    });
    fileMimeTypeValidator(
      schemaPath.leafCertificate,
      this.CERTIFICATE_MIME_TYPES,
    );

    /**
     * START - Leaf Private Key Validations
     */
    required(schemaPath.leafPrivateKey);
    fileSizeValidator(schemaPath.leafPrivateKey, {
      maxSize: this.CERTIFICATE_MAX_SIZE,
    });
    fileMimeTypeValidator(
      schemaPath.leafPrivateKey,
      this.CERTIFICATE_MIME_TYPES,
    );

    /**
     * START - Intermediate Certificate Validations
     */
    required(schemaPath.intermediateCertificate);
    pemCertificateValidator(schemaPath.intermediateCertificate);
    fileSizeValidator(schemaPath.intermediateCertificate, {
      maxSize: this.CERTIFICATE_MAX_SIZE,
    });
    fileMimeTypeValidator(
      schemaPath.intermediateCertificate,
      this.CERTIFICATE_MIME_TYPES,
    );

    /**
     * START - Intermediate Certificate Validations
     */
    required(schemaPath.didFile);
    pemCertificateValidator(schemaPath.didFile);
    fileSizeValidator(schemaPath.didFile, {
      maxSize: this.DID_MAX_SIZE,
    });
    fileMimeTypeValidator(schemaPath.didFile, this.DID_MIME_TYPES);

    /**
     * START - Asset File Validations
     */
    required(schemaPath.assetFile);
    fileSizeValidator(schemaPath.assetFile, {
      maxSize: this.ASSET_MAX_SIZE,
    });
    fileMimeTypeValidator(schemaPath.assetFile, this.ASSET_MIME_TYPES);
  });

  constructor() {
    effect(() => {
      console.log(this.signingModel());
      console.log(this.signingForm().valid());
    });
  }
}
