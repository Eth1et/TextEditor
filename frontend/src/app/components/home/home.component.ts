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
import { ValidatorService } from 'src/app/services/helper/validator.service';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatTabsModule,
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
    public valid: ValidatorService,
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
      }
    );
    this.registerForm.setValidators(this.valid.mustMatch("password", "rePassword", "Passwords do not match"));
  }

  onLogin = async () => {
    if (this.loginForm && this.loginForm.valid) {
      try {
        const response = await this.userService.login(this.loginForm.value);
        const result = await this.router.navigateByUrl("documents");
        if (result) {
          this.toast.showSuccess(response);
        }
      }
      catch (error) {
        this.toast.showError(error);
      }
    }
  }

  onRegister = async () => {
    if (this.registerForm && this.registerForm.valid) {
      try {
        const response = await this.userService.register(this.registerForm.value);
        const result = await this.router.navigateByUrl("documents");
        if (result) {
          this.toast.showSuccess(response);
        }
      }
      catch (error) {
        this.toast.showError(error);
      }
    }
  }
}
