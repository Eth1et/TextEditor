import { Injectable, inject } from '@angular/core';
import {
    CanActivate,
    Router,
    UrlTree,
} from '@angular/router';
import { Observable, of } from 'rxjs';
import { map, catchError, tap } from 'rxjs/operators';
import { UserService } from '../services/backend/user.service';

@Injectable({ providedIn: 'root' })
export class UnauthGuard implements CanActivate {
    private router = inject(Router);
    private userService = inject(UserService);

    async canActivate(): Promise<boolean | UrlTree> {
        try {
            const isLoggedIn = await this.userService.isLoggedIn();
            if (isLoggedIn) return this.router.createUrlTree(['documents']);
            return true;
        } catch (error) {
            console.log(error)
            return true;
        }
    }
}
