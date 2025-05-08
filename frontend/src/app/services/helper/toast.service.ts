import { Injectable } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import { HttpErrorResponse } from '@angular/common/http';
import { ZodError } from 'zod';

@Injectable({
    providedIn: 'root'
})
export class ToastService {
    constructor(private snackBar: MatSnackBar) { }

    showSuccess(message?: string) {
        this.snackBar.open(message ?? 'Success', 'Close', {
            duration: 3000,
            panelClass: ['snackbar-success']
        });
    }

    showError(error: unknown) {
        let message = 'An unknown error occurred';
        if (error instanceof ZodError) {
            message = error.message;
        }
        else if (typeof error === 'string') {
            message = error;
        }
        else if (error instanceof HttpErrorResponse) {
            if (typeof error.error === 'string') {
                message = error.error;
            } else if (error.error?.message) {
                message = error.error.message;
            }
        } else if (typeof error === 'object' && error !== null && 'message' in error) {
            message = (error as any).message;
        }

        this.snackBar.open(message, 'Close', {
            duration: 4000,
            panelClass: ['snackbar-error'],
        });
    }

    handleResponse(result: unknown) {
        if (typeof result === 'string') {
            this.showSuccess(result);
        } else {
            this.showSuccess(); // fallback success
        }
    }
}
