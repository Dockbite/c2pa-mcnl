import { Component, effect, inject, signal } from '@angular/core';
import { SigningWebappFeatureSigningFormService } from './signing-webapp-feature-signing-form.service';
import { form, required } from '@angular/forms/signals';
import { UiUploadFileInputComponent } from '@c2pa-mcnl/signing-webapp/ui-upload-file-input';
import { pemCertificateValidator } from '@c2pa-mcnl/shared/util-form-validators';

interface SigningData {
  leafCertificate: File | null;
  leafPrivateKey: File | null;
  intermediateCertificate: File | null;
  didFile: File | null;
  assetFile: File | null;
}

@Component({
  selector: 'lib-signing-webapp-feature-signing-form',
  imports: [UiUploadFileInputComponent],
  templateUrl: './signing-webapp-feature-signing-form.component.html',
  providers: [SigningWebappFeatureSigningFormService],
})
export class SigningWebappFeatureSigningFormComponent {
  private readonly service = inject(SigningWebappFeatureSigningFormService);

  readonly signingModel = signal<SigningData>({
    leafCertificate: null,
    leafPrivateKey: null,
    intermediateCertificate: null,
    didFile: null,
    assetFile: null,
  });

  readonly signingForm = form(this.signingModel, (schemaPath) => {
    required(schemaPath.leafCertificate);
    pemCertificateValidator(schemaPath.leafCertificate);
    required(schemaPath.leafPrivateKey);
    required(schemaPath.intermediateCertificate);
    required(schemaPath.assetFile);
  });

  readonly acceptedMimeTypes: {
    certificate: string[];
    did: string[];
    asset: string[];
  } = {
    certificate: ['application/x-x509-ca-cert', 'application/x-pem-file'],
    did: ['application/json', 'application/ld+json'],
    asset: [
      'image/jpeg',
      'image/png',
      'image/heic',
      'image/heif',
      'video/mp4',
      'audio/mpeg',
    ],
  };

  readonly maxFileSizeBytes: {
    certificate: number;
    did: number;
    asset: number;
  } = {
    certificate: 5 * 1024 * 1024, // 5 MB
    did: 2 * 1024 * 1024, // 2 MB
    asset: 1024 * 1024 * 1024, // 1 GB
  };

  uploadedFile: File | null = null;

  constructor() {
    effect(() => {
      console.log(this.signingModel());
      console.log(this.signingForm().valid());
      console.log(this.signingForm.leafCertificate().errors());
    });
  }
}
