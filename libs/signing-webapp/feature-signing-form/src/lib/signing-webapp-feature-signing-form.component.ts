import { Component, effect, inject } from '@angular/core';
import { SigningWebappFeatureSigningFormService } from './signing-webapp-feature-signing-form.service';
import { form } from '@angular/forms/signals';
import { UiUploadFileInputComponent } from '@c2pa-mcnl/signing-webapp/ui-upload-file-input';
import { SigningFormModel } from './signing-form.model';
import {
  ASSET_MAX_SIZE,
  ASSET_MIME_TYPES,
  CERTIFICATE_MAX_SIZE,
  CERTIFICATE_MIME_TYPES,
  DID_MAX_SIZE,
  DID_MIME_TYPES,
  SigningFormOptions,
} from './signing-form.options';

@Component({
  standalone: true,
  selector: 'lib-signing-webapp-feature-signing-form',
  imports: [UiUploadFileInputComponent],
  templateUrl: './signing-webapp-feature-signing-form.component.html',
  providers: [SigningWebappFeatureSigningFormService],
})
export class SigningWebappFeatureSigningFormComponent {
  private readonly service = inject(SigningWebappFeatureSigningFormService);

  certificateMimeTypes = CERTIFICATE_MIME_TYPES;
  certificateMaxSize = CERTIFICATE_MAX_SIZE;
  didMimeTypes = DID_MIME_TYPES;
  didMaxSize = DID_MAX_SIZE;
  assetMimeTypes = ASSET_MIME_TYPES;
  assetMaxSize = ASSET_MAX_SIZE;

  signingModel = SigningFormModel;
  signingForm = form(this.signingModel, SigningFormOptions);

  constructor() {
    effect(() => {
      console.log(this.signingModel());
      console.log(this.signingForm().valid());
    });
  }
}
