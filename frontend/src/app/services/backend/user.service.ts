// src/app/services/user.service.ts

import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';
import { z } from 'zod';

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
    return new Error(msg);
  }

  async login(dto: LoginDto): Promise<string> {
    loginSchema.parse(dto);
    return await firstValueFrom(
      this.http.post(
        `${this.API}/login`,
        dto,
        { withCredentials: true, responseType: 'text' }
      )
    ).catch(err => Promise.reject(this.handleError(err)));
  }

  async logout(): Promise<string> {
    return await firstValueFrom(
      this.http.post(
        `${this.API}/logout`,
        {},
        { withCredentials: true, responseType: 'text' }
      )
    ).catch(err => Promise.reject(this.handleError(err)));
  }

  async register(dto: RegisterDto): Promise<string> {
    registerSchema.parse(dto);
    return await firstValueFrom(
      this.http.post<string>(
        `${this.API}/register`,
        dto,
        { withCredentials: true }
      )
    ).catch(err => Promise.reject(this.handleError(err)));
  }

  async updatePassword(dto: UpdatePasswordDto): Promise<string> {
    updatePasswordSchema.parse(dto);
    return await firstValueFrom(
      this.http.patch(
        `${this.API}/update-password`,
        dto,
        { withCredentials: true, responseType: 'text' }
      )
    ).catch(err => Promise.reject(this.handleError(err)));
  }

  async deleteUser(dto: DeleteUserDto): Promise<string> {
    deleteUserSchema.parse(dto);
    return await firstValueFrom(
      this.http.request(
        'delete',
        `${this.API}/delete-user`,
        { body: dto, withCredentials: true, responseType: 'text' }
      )
    ).catch(err => Promise.reject(this.handleError(err)));
  }

  async isLoggedIn(): Promise<boolean> {
    try {
      await firstValueFrom(
        this.http.get(
          `${this.API}/auth-check`,
          { withCredentials: true, responseType: 'text' }
        )
      );
      return true;
    } catch {
      return false;
    }
  }
}
