// src/app/services/user.service.ts

import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';

import { z } from 'zod';
import { Observable, throwError, of, map } from 'rxjs';
import { catchError } from 'rxjs/operators';

import {
  loginSchema,
  registerSchema,
  updatePasswordSchema,
  deleteUserSchema
} from '@shared/route_schemas';

import { environment } from '../../environments/environment';

export type LoginDto = z.infer<typeof loginSchema>;
export type RegisterDto = z.infer<typeof registerSchema>;
export type UpdatePasswordDto = z.infer<typeof updatePasswordSchema>;
export type DeleteUserDto = z.infer<typeof deleteUserSchema>;


@Injectable({
  providedIn: 'root',
})
export class UserService {
  private readonly API = environment.SERVER_URL;

  constructor(private http: HttpClient) { }

  private handleError(err: HttpErrorResponse) {
    const msg = err.error instanceof ErrorEvent
      ? `Network error: ${err.error.message}`
      : (typeof err.error === 'string' ? err.error : err.message || `Error ${err.status}`);
    return throwError(() => new Error(msg));
  }

  login(dto: LoginDto): Observable<string> {
    loginSchema.parse(dto);
    return this.http
      .post(
        `${this.API}/login`,
        dto,
        { withCredentials: true, responseType: 'text' }
      )
      .pipe(
        catchError(err => this.handleError(err))
      );
  }

  logout(): Observable<string> {
    return this.http
      .post(
        `${this.API}/logout`,
        {}, // empty body
        {
          responseType: 'text',
          withCredentials: true
        }
      )
      .pipe(catchError(err => this.handleError(err)));
  }

  register(dto: RegisterDto): Observable<string> {
    registerSchema.parse(dto);
    return this.http
      .post<string>(
        `${this.API}/register`,
        dto,
        { withCredentials: true }
      )
      .pipe(
        catchError(err => this.handleError(err))
      );
  }

  updatePassword(dto: UpdatePasswordDto): Observable<string> {
    updatePasswordSchema.parse(dto);
    return this.http
      .patch(
        `${this.API}/update-password`,
        dto,
        {
          responseType: 'text',
          withCredentials: true
        }
      )
      .pipe(
        catchError(err => this.handleError(err))
      );
  }

  deleteUser(dto: DeleteUserDto): Observable<string> {
    deleteUserSchema.parse(dto);
    return this.http
      .request(
        'delete',
        `${this.API}/delete-user`,
        {
          body: dto,
          responseType: 'text',
          withCredentials: true
        }
      )
      .pipe(
        catchError(err => this.handleError(err))
      );
  }

  isLoggedIn(): Observable<boolean> {
    return this.http
      .get(`${this.API}/auth-check`, { withCredentials: true, responseType: 'text'})
      .pipe(
        map(() => true),
        catchError(() => of(false))
      );
  }
}
