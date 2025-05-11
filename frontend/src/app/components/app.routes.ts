import { Routes } from '@angular/router';
import { AuthGuard } from '../guards/auth.guard';
import { UnauthGuard } from '../guards/unauth.guard';
import { ToastService } from '../services/helper/toast.service';
import { DocumentsService } from '../services/backend/docs.service';

export const routes: Routes = [
    { 
        path: "documents", 
        loadComponent: () => import('./documents/documents.component').then(c => c.DocumentsComponent),
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
