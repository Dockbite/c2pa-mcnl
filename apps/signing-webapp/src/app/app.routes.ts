import { Route } from '@angular/router';

export const appRoutes: Route[] = [
  {
    path: '',
    loadComponent: async () =>
      (await import('@c2pa-mcnl/signing-webapp/form/feature/detail'))
        .SigningWebappFormFeatureDetailComponent,
    pathMatch: 'full',
  },
  {
    path: '**',
    redirectTo: '',
  },
];
