import { Component } from '@angular/core';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { LoadingButtonComponent } from '../reusable/loading-button.component';
import { MatTabsModule } from '@angular/material/tabs';
import { MatIconModule } from '@angular/material/icon';
import { MAX_PASSWORD_LENGTH, MIN_PASSWORD_LENGTH } from '@shared/constants';
import { ValidatorService } from 'src/app/services/helper/validator.service';
import { MatInputModule } from '@angular/material/input';
import { CommonModule } from '@angular/common';
import { ToastService } from 'src/app/services/helper/toast.service';
import { UserService } from 'src/app/services/backend/user.service';
import { UserDetails } from '@shared/response_models';
import { Router } from '@angular/router';

@Component({
  selector: 'app-profile',
  imports: [
    MatFormFieldModule,
    ReactiveFormsModule,
    LoadingButtonComponent,
    MatTabsModule,
    CommonModule,
    MatInputModule,
    MatIconModule
  ],
  templateUrl: './profile.component.html',
  styleUrl: './profile.component.scss'
})
export class ProfileComponent {
  deleteForm: FormGroup;
  updateForm: FormGroup;
  details: UserDetails = {
    email: "unknown@textedit.com",
    createdAt: new Date(),
    updatedAt: new Date()
  };

  constructor(private router: Router, private fb: FormBuilder, public valid: ValidatorService, private toast: ToastService, private userService: UserService) {
    this.deleteForm = fb.group({
      password: ['', [Validators.required, Validators.minLength(MIN_PASSWORD_LENGTH), Validators.maxLength(MAX_PASSWORD_LENGTH)]],
      rePassword: ['', [Validators.required, Validators.minLength(MIN_PASSWORD_LENGTH), Validators.maxLength(MAX_PASSWORD_LENGTH)]],
    });
    this.deleteForm.setValidators([this.valid.mustMatch("password", "rePassword", "Passwords do not match")]);

    this.updateForm = this.fb.group(
      {
        oldPassword: ['', [Validators.required, Validators.minLength(MIN_PASSWORD_LENGTH), Validators.maxLength(MAX_PASSWORD_LENGTH)]],
        newPassword: ['', [Validators.required, Validators.minLength(MIN_PASSWORD_LENGTH), Validators.maxLength(MAX_PASSWORD_LENGTH)]],
        newRePassword: ['', [Validators.required, Validators.minLength(MIN_PASSWORD_LENGTH), Validators.maxLength(MAX_PASSWORD_LENGTH)]],
      }
    );
    this.updateForm.setValidators([this.valid.mustMatch("newPassword", "newRePassword", "New Passwords do not match")]);
  }

  async ngOnInit() {
    try {
      this.details = await this.userService.getDetails();
      this.details.createdAt = new Date(this.details.createdAt);
      this.details.updatedAt = new Date(this.details.updatedAt);
    } catch { }
  }

  onUpdate = async () => {
    if (this.updateForm.invalid) return;
    try {
      this.toast.showSuccess(await this.userService.updatePassword(this.updateForm.value));
      this.updateForm.reset();
    } catch (error) {
      this.toast.showError(error);
    }
  }

  onDelete = async () => {
    if (this.deleteForm.invalid) return;

    try {
      this.toast.showSuccess(await this.userService.deleteUser(this.deleteForm.value));
      this.updateForm.reset();
      await this.router.navigateByUrl('login');
    } catch (error) {
      this.toast.showError(error);
    }
  }
}
