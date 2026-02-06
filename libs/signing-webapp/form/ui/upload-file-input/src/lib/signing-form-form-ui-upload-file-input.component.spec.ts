import { ComponentFixture, TestBed } from '@angular/core/testing';
import { SigningFormFormUiUploadFileInputComponent } from './signing-form-form-ui-upload-file-input.component';

describe('SigningFormFormUiUploadFileInputComponent', () => {
  let component: SigningFormFormUiUploadFileInputComponent;
  let fixture: ComponentFixture<SigningFormFormUiUploadFileInputComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SigningFormFormUiUploadFileInputComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(
      SigningFormFormUiUploadFileInputComponent,
    );
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
