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

    canActivate(): Observable<boolean | UrlTree> {
        return this.userService.isLoggedIn().pipe(
            map(loggedIn =>
                loggedIn
                    ? this.router.createUrlTree(['documents'])
                    : true
            ),

            catchError(() => of(true))
        );
    }
}
