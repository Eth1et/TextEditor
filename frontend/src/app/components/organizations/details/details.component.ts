import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { ActivatedRoute, Router } from '@angular/router';
import { OrgDetails } from '@shared/response_models';
import { OrgService } from 'src/app/services/backend/org.service';
import { ToastService } from 'src/app/services/helper/toast.service';
import { LoadingButtonComponent } from '../../reusable/loading-button.component';
import { MatTabsModule } from '@angular/material/tabs';
import { MatInputModule } from '@angular/material/input';
import { MatIconModule } from '@angular/material/icon';
import { ValidatorService } from 'src/app/services/helper/validator.service';
import { MAX_PASSWORD_LENGTH, MIN_PASSWORD_LENGTH } from '@shared/constants';

@Component({
  selector: 'app-details',
  imports: [
    MatFormFieldModule,
    ReactiveFormsModule,
    LoadingButtonComponent,
    MatTabsModule,
    CommonModule,
    MatInputModule,
    MatIconModule
  ],
  templateUrl: './details.component.html',
  styleUrl: './details.component.scss'
})
export class DetailsComponent {
  deleteForm: FormGroup;
  updateForm: FormGroup;
  membershipForm: FormGroup;
  orgDetails!: OrgDetails;

  constructor(
    private route: ActivatedRoute,
    private toast: ToastService,
    private router: Router,
    private orgService: OrgService,
    private fb: FormBuilder,
    public valid: ValidatorService
  ) {
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

    this.membershipForm = fb.group({
      password: ['', [Validators.required, Validators.minLength(MIN_PASSWORD_LENGTH), Validators.maxLength(MAX_PASSWORD_LENGTH)]],
      rePassword: ['', [Validators.required, Validators.minLength(MIN_PASSWORD_LENGTH), Validators.maxLength(MAX_PASSWORD_LENGTH)]],
    });
    this.membershipForm.setValidators([this.valid.mustMatch("password", "rePassword", "Passwords do not match")]);
  }

  async ngOnInit() {
    try {
      const orgID = this.route.snapshot.queryParamMap.get('orgID');
      if (!orgID) {
        throw Error("No organization ID provided");
      }
      this.orgDetails = await this.orgService.details({ orgID: orgID });
      this.orgDetails.createdAt = new Date(this.orgDetails.createdAt);
      this.orgDetails.updatedAt = new Date(this.orgDetails.updatedAt);
    }
    catch (error) {
      this.toast.showError(error);
      this.router.navigateByUrl('orgs');
    }
  }

  onUpdate = async () => {
    if (this.updateForm.invalid) return;
    try {
      //this.toast.showSuccess(await this.orgService.update(this.updateForm.value));
      this.updateForm.reset();
    } catch (error) {
      this.toast.showError(error);
    }
  }

  onDelete = async () => {
    if (this.deleteForm.invalid) return;

    try {
      //this.toast.showSuccess(await this.userService.deleteUser(this.deleteForm.value));
      this.updateForm.reset();
      await this.router.navigateByUrl('login');
    } catch (error) {
      this.toast.showError(error);
    }
  }

  onMembership = async() => {
    if (this.membershipForm.invalid) return;
  }
}
