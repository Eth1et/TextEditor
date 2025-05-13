import { Injectable } from '@angular/core';
import { AbstractControl, FormGroup, ValidationErrors, ValidatorFn } from '@angular/forms';

@Injectable({
    providedIn: 'root'
})
export class ValidatorService {
    getControlErrors(form: FormGroup, name: string): string[] {
        const ctrl = form.get(name);

        if (!ctrl || !ctrl.errors) return [];

        const errs = [];
        if (ctrl.hasError('required')) {
            errs.push('This field is required');
        }
        else if (ctrl.hasError('minlength')) {
            errs.push(
                `Must be at least ${ctrl.errors!['minlength'].requiredLength} characters`
            );
        }
        else if (ctrl.hasError('maxlength')) {
            errs.push(
                `Must be at most ${ctrl.errors!['maxlength'].requiredLength} characters`
            );
        }
        else if (ctrl.hasError('mustMatch')) {
            errs.push(ctrl.getError('mustMatch'));
        }
        else if (ctrl.hasError('notInSet')) {
            const e = ctrl.getError('notInSet');
            errs.push(`Invalid value: ${e.value}, valid options: ${e.allowedValues}`);
        }
        return errs;
    }

    mustMatch(controlName: string, matchingControlName: string, notMacthingMessage: string): ValidatorFn {
        return (formGroup: AbstractControl): ValidationErrors | null => {
            const group = formGroup as FormGroup;
            const control = group.controls[controlName];
            const matchingControl = group.controls[matchingControlName];

            if (!control || !matchingControl) return null;

            if (control.value !== matchingControl.value) {
                matchingControl.setErrors({
                    mustMatch: notMacthingMessage
                });
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
                control.setErrors({
                    notInSet: {
                        value,
                        allowed: allowedValues
                    }
                });
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
