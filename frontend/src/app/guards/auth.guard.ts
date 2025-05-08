import { Injectable, inject } from '@angular/core';
import {
    CanActivate,
    Router,
    UrlTree,
} from '@angular/router';
import { Observable, of } from 'rxjs';
import { map, catchError, tap } from 'rxjs/operators';
import { UserService } from '../services/backend/user.service';

@Injectable({
    providedIn: 'root',
})
export class AuthGuard implements CanActivate {
    private userService = inject(UserService);
    private router = inject(Router);

    canActivate(): Observable<boolean | UrlTree> {
        return this.userService.isLoggedIn().pipe(
            map(() => true),
            catchError(() => of(this.router.createUrlTree(['login'])))
        );
    }
}
