import { signal } from '@angular/core';

export interface FormData {
  leafCertificate: File | null;
  leafPrivateKey: File | null;
  intermediateCertificate: File | null;
  didFile: File | null;
  assetFile: File | null;
}

export const FormModel = signal<FormData>({
  leafCertificate: null,
  leafPrivateKey: null,
  intermediateCertificate: null,
  didFile: null,
  assetFile: null,
});
