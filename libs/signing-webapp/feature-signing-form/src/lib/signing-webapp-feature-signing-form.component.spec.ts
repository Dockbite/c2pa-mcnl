import { ComponentFixture, TestBed } from '@angular/core/testing';
import { SigningWebappFeatureSigningFormComponent } from './signing-webapp-feature-signing-form.component';

describe('SigningWebappFeatureSigningFormComponent', () => {
  let component: SigningWebappFeatureSigningFormComponent;
  let fixture: ComponentFixture<SigningWebappFeatureSigningFormComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SigningWebappFeatureSigningFormComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(SigningWebappFeatureSigningFormComponent);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
