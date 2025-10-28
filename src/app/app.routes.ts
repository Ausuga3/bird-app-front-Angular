import { Routes } from '@angular/router';

import RegisterPageComponent from './core/features/user/presentation/pages/register-page/register-page.component';

export const routes: Routes = [
    {
        path: '',
        loadComponent: () => import('./core/shared/components/landin-page/landin-page.component')
    },
    {
    path: 'register',
    component: RegisterPageComponent
     
    },
    {
    path: 'login',
    loadComponent: () =>
      import('./core/features/user/presentation/pages/login-page/login-page.component')
    },
    {
      path: 'birds/add',
      loadComponent: () =>
         import('./core/features/bird/presentation/components/forms/form-bird/form-bird.component').then(m => m.FormBirdComponent)
    },
    {
      path: 'birds/edit/:id',
      loadComponent: () =>
         import('./core/features/bird/presentation/components/forms/form-bird/form-bird.component').then(m => m.FormBirdComponent)
    },
    {
      path: 'birds',
      loadComponent: () =>
         import('./core/features/bird/presentation/pages/list-bird-page/list-bird-page.component').then(m => m.ListBirdPageComponent)
    },
    
    {
      path: 'sightings',
      loadComponent: () =>
         import('./core/features/sighting/presentation/pages/list-sigthing-page/list-sigthing-page').then(m => m.ListSighting)
    },
    {
      path: 'sightings/add',
      loadComponent: () =>
         import('./core/features/sighting/presentation/pages/sighting-page/sighting-page').then(m => m.SightingPage)
    },
    {
      path:'**',
      redirectTo:''
    }

];
