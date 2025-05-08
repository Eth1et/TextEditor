import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  FormBuilder,
  FormGroup,
  Validators,
  AbstractControl,
} from '@angular/forms';
import { ReactiveFormsModule } from '@angular/forms';

import { MatTabsModule } from '@angular/material/tabs';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { environment } from '../environments/environment';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatTabsModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatCardModule,
  ],
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss'],
})
export class HomeComponent {
  readonly minPass = environment.MIN_PASSWORD_LENGTH;
  readonly maxPass = environment.MAX_PASSWORD_LENGTH;

  loginForm: FormGroup;
  registerForm: FormGroup;

  constructor(private fb: FormBuilder) {
    this.loginForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: [
        '',
        [
          Validators.required,
          Validators.minLength(this.minPass),
          Validators.maxLength(this.maxPass),
        ],
      ],
    });

    this.registerForm = this.fb.group(
      {
        email: ['', [Validators.required, Validators.email]],
        password: [
          '',
          [
            Validators.required,
            Validators.minLength(this.minPass),
            Validators.maxLength(this.maxPass),
          ],
        ],
        rePassword: ['', [Validators.required]],
      },
      { validators: this.mustMatch("password", "rePassword") }
    );
  }

  mustMatch(controlName: string, matchingControlName: string) {
    return (formGroup: FormGroup) => {
      const control = formGroup.controls[controlName];
      const matchingControl = formGroup.controls[matchingControlName];

      if (matchingControl.errors && matchingControl.errors['mustMatch']) {
        return;
      }

      if (control.value !== matchingControl.value) {
        matchingControl.setErrors({ mustMatch: true });
      } else {
        matchingControl.setErrors(null);
      }
    }
  }

  getControlErrors(form: FormGroup, name: string): string[] {
    const ctrl = form.get(name);
    
    if (!ctrl || !ctrl.errors) return [];

    const errs = [];
    if (ctrl.hasError('required')) {
      errs.push('This field is required');
    }
    else if (ctrl.hasError('email')) {
      errs.push('Please enter a valid email address');
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
      errs.push('Passwords do not match');
    }
    return errs;
  }

  onLogin() {
    if (this.loginForm.valid) {
      console.log('Logging in with', this.loginForm.value);
    }
  }

  onRegister() {
    if (this.registerForm.valid) {
      console.log('Registering with', this.registerForm.value);
    }
  }
}
