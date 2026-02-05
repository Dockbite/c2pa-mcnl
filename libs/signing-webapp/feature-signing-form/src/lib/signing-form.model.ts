import { signal } from '@angular/core';

export interface SigningFormData {
  leafCertificate: File | null;
  leafPrivateKey: File | null;
  intermediateCertificate: File | null;
  didFile: File | null;
  assetFile: File | null;
}

export const SigningFormModel = signal<SigningFormData>({
  leafCertificate: null,
  leafPrivateKey: null,
  intermediateCertificate: null,
  didFile: null,
  assetFile: null,
});
