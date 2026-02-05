import { ComponentFixture, TestBed } from '@angular/core/testing';
import { UiUploadFileInputComponent } from './ui-upload-file-input.component';

describe('UiUploadFileInput', () => {
  let component: UiUploadFileInputComponent;
  let fixture: ComponentFixture<UiUploadFileInputComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [UiUploadFileInputComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(UiUploadFileInputComponent);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
