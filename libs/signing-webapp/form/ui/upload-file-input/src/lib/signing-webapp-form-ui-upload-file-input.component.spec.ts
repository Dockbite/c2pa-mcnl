import { ComponentFixture, TestBed } from '@angular/core/testing';
import { SigningWebappFormUiUploadFileInputComponent } from './signing-webapp-form-ui-upload-file-input.component';

describe('SigningWebappFormUiUploadFileInputComponent', () => {
  let component: SigningWebappFormUiUploadFileInputComponent;
  let fixture: ComponentFixture<SigningWebappFormUiUploadFileInputComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SigningWebappFormUiUploadFileInputComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(
      SigningWebappFormUiUploadFileInputComponent,
    );
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
