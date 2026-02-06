import { ComponentFixture, TestBed } from '@angular/core/testing';
import { SigningWebappFormFeatureDetailComponent } from './signing-webapp-form-feature-detail.component';

describe('SigningWebappFormFeatureDetailComponent', () => {
  let component: SigningWebappFormFeatureDetailComponent;
  let fixture: ComponentFixture<SigningWebappFormFeatureDetailComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SigningWebappFormFeatureDetailComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(SigningWebappFormFeatureDetailComponent);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
