import { Route } from '@angular/router';

export const appRoutes: Route[] = [
  {
    path: '',
    loadComponent: async () =>
      (await import('@c2pa-mcnl/signing-webapp/feature-signing-form'))
        .SigningWebappFeatureSigningFormComponent,
    pathMatch: 'full',
  },
  {
    path: '**',
    redirectTo: '',
  },
];
