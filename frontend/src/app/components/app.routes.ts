import { Routes } from '@angular/router';
import { AuthGuard } from '../guards/auth.guard';
import { UnauthGuard } from '../guards/unauth.guard';

export const routes: Routes = [
    {
        path: "documents/editor",
        loadComponent: () => import('./documents/editor/editor.component').then(c => c.EditorComponent),
        canActivate: [AuthGuard]
    },
    {
        path: "documents",
        loadComponent: () => import('./documents/documents.component').then(c => c.DocumentsComponent),
        canActivate: [AuthGuard]
    },
    {
        path: "orgs/details",
        loadComponent: () => import('./organizations/details/details.component').then(c => c.DetailsComponent),
        canActivate: [AuthGuard]
    },
    {
        path: "orgs",
        loadComponent: () => import('./organizations/organizations.component').then(c => c.OrganizationsComponent),
        canActivate: [AuthGuard]
    },
    {
        path: "profile",
        loadComponent: () => import('./profile/profile.component').then(c => c.ProfileComponent),
        canActivate: [AuthGuard]
    },
    {
        path: 'login',
        loadComponent: () => import('./home/home.component').then(c => c.HomeComponent),
        canActivate: [UnauthGuard]
    },
    {
        path: '**',
        redirectTo: 'login'
    },
];
