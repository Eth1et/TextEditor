import { Injectable } from '@angular/core';
import { AbstractControl, FormGroup, ValidationErrors, ValidatorFn } from '@angular/forms';

@Injectable({
    providedIn: 'root'
})
export class ValidatorService {
    mustMatch(controlName: string, matchingControlName: string): ValidatorFn {
        return (formGroup: AbstractControl): ValidationErrors | null => {
            const group = formGroup as FormGroup;
            const control = group.controls[controlName];
            const matchingControl = group.controls[matchingControlName];

            if (!control || !matchingControl) return null;

            if (control.value !== matchingControl.value) {
                return { mustMatch: true };
            }

            return null;
        };
    }

    inSetValidator<T>(controlName: string, allowedValues: T[], optional: boolean): ValidatorFn {
        return (formGroup: AbstractControl): ValidationErrors | null => {
            const group = formGroup as FormGroup;
            const control = group.controls[controlName];
            if (!control) return null;

            if (optional && (control.value === null || control.value === undefined)) return null;

            const value = control.value;
            if (!allowedValues.includes(value)) {
                return {
                    notInSet: {
                        value,
                        allowed: allowedValues
                    }
                };
            }

            return null;
        };
    }

    inSetValidatorDynamic<T>(controlName: string, allowedValues: () => T[], optional: boolean): ValidatorFn {
        return (formGroup: AbstractControl): ValidationErrors | null => {
            const values = allowedValues();
            return this.inSetValidator(controlName, values, optional)(formGroup);
        };
    }
}
