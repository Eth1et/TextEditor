import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  FormBuilder,
  FormGroup,
  Validators,
} from '@angular/forms';
import { ReactiveFormsModule } from '@angular/forms';

import { MatTabsModule } from '@angular/material/tabs';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MAX_PASSWORD_LENGTH, MIN_PASSWORD_LENGTH } from '@shared/constants';
import { UserService } from 'src/app/services/backend/user.service';
import { ToastService } from 'src/app/services/helper/toast.service';
import { LoadingButtonComponent } from "../reusable/loading-button.component";
import { Router } from '@angular/router';

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
    LoadingButtonComponent
],
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss'],
})
export class HomeComponent {
  loginForm: FormGroup;
  registerForm: FormGroup;

  constructor(
    private fb: FormBuilder,
    private userService: UserService,
    private toast: ToastService,
    private router: Router
  ) {
    this.loginForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: [
        '',
        [
          Validators.required,
          Validators.minLength(MIN_PASSWORD_LENGTH),
          Validators.maxLength(MAX_PASSWORD_LENGTH),
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
            Validators.minLength(MIN_PASSWORD_LENGTH),
            Validators.maxLength(MAX_PASSWORD_LENGTH),
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

  loginAction = async () => this.onLogin();

  onLogin() {
    if (this.loginForm.valid) {
      this.userService.login(this.loginForm.value).subscribe({
        next: (response) => {
          this.toast.showSuccess(response);
          this.loginForm.reset();
          this.router.navigateByUrl("documents");
        },
        error: (error) => {
          this.toast.showError(error);
        },
      });
    }
  }

  registerAction = async () => this.onRegister();

  onRegister() {
    if (this.registerForm.valid) {
      this.userService.register(this.registerForm.value).subscribe({
        next: (response) => {
          this.toast.showSuccess(response);
          this.registerForm.reset();
          this.router.navigateByUrl("documents");
        },
        error: (error) => {
          this.toast.showError(error);
        },
      });
    }
  }
}
