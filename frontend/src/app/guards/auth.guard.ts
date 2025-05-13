import { Injectable, inject } from '@angular/core';
import {
    CanActivate,
    Router,
    UrlTree,
} from '@angular/router';
import { UserService } from '../services/backend/user.service';

@Injectable({
    providedIn: 'root',
})
export class AuthGuard implements CanActivate {
    private userService = inject(UserService);
    private router = inject(Router);

    async canActivate(): Promise<boolean | UrlTree> {
        try {
            const isLoggedIn = await this.userService.isLoggedIn();
            if (isLoggedIn) return true;
            return this.router.createUrlTree(['login']);
        } catch (error) {
            return this.router.createUrlTree(['login']);
        }
    }
}
