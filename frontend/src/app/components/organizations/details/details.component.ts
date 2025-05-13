import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { ActivatedRoute, Router } from '@angular/router';
import { OrgDetails, QueriedMember } from '@shared/response_models';
import { addMemberDto, deleteDto, OrgService, removeMemberDto, updateDto, updateMemberDto } from 'src/app/services/backend/org.service';
import { ToastService } from 'src/app/services/helper/toast.service';
import { LoadingButtonComponent } from '../../reusable/loading-button.component';
import { MatTabsModule } from '@angular/material/tabs';
import { MatInputModule } from '@angular/material/input';
import { MatIconModule } from '@angular/material/icon';
import { ValidatorService } from 'src/app/services/helper/validator.service';
import { MAX_ORG_DESC_LENGTH, MAX_ORG_NAME_LENGTH, MAX_PASSWORD_LENGTH, MIN_ORG_NAME_LENGTH, MIN_PASSWORD_LENGTH } from '@shared/constants';
import { MatOptionModule } from '@angular/material/core';
import { MatSelectModule } from '@angular/material/select';
import { MatCardModule } from '@angular/material/card';


@Component({
  selector: 'app-details',
  imports: [
    MatFormFieldModule,
    ReactiveFormsModule,
    LoadingButtonComponent,
    MatTabsModule,
    CommonModule,
    MatOptionModule,
    MatInputModule,
    MatSelectModule,
    MatIconModule,
    MatCardModule
  ],
  templateUrl: './details.component.html',
  styleUrl: './details.component.scss'
})
export class DetailsComponent {
  deleteForm: FormGroup;
  updateForm: FormGroup;
  membershipForm: FormGroup;
  members: Array<QueriedMember> = [];
  orgDetails: OrgDetails = {
    name: "nothing",
    description: "",
    admin: true,
    orgID: "something",
    creator: "someone",
    isCreator: true,
    createdAt: new Date(),
    updatedAt: new Date()
  };

  actions = ["ADD", "MODIFY", "DELETE"];

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
    });

    this.updateForm = this.fb.group({
      name: [this.orgDetails.name, [Validators.required, Validators.minLength(MIN_ORG_NAME_LENGTH), Validators.maxLength(MAX_ORG_NAME_LENGTH)]],
      password: ['', [Validators.required, Validators.minLength(MIN_PASSWORD_LENGTH), Validators.maxLength(MAX_PASSWORD_LENGTH)]],
      description: [this.orgDetails.description, [Validators.maxLength(MAX_ORG_DESC_LENGTH)]],
    });

    this.membershipForm = fb.group({
      password: ['', [Validators.required, Validators.minLength(MIN_PASSWORD_LENGTH), Validators.maxLength(MAX_PASSWORD_LENGTH)]],
      action: ['ADD', [Validators.required]],
      email: ['', [Validators.required, Validators.email]],
      admin: [false, [Validators.required]],
    });
    this.membershipForm.setValidators([
      this.valid.inSetValidator("action", this.actions, false)
    ]);
  }

  async initOrgData(orgID: string) {
    this.orgDetails = await this.orgService.details({ orgID: orgID });
    this.members = await this.orgService.queryMembers({ orgID: orgID });

    this.orgDetails.createdAt = new Date(this.orgDetails.createdAt);
    this.orgDetails.updatedAt = new Date(this.orgDetails.updatedAt);
    this.updateForm.get('name')?.setValue(this.orgDetails.name);
    this.updateForm.get('description')?.setValue(this.orgDetails.description);
    this.membershipForm.get('action')?.setValue("ADD");
  }

  async ngOnInit() {
    try {
      const orgID = this.route.snapshot.queryParamMap.get('orgID');
      if (!orgID) {
        throw Error("No organization ID provided");
      }
      await this.initOrgData(orgID);
    }
    catch (error) {
      this.toast.showError(error);
      this.router.navigateByUrl('orgs');
    }
  }

  onUpdate = async () => {
    if (this.updateForm.invalid) return;
    try {
      let data: updateDto = this.updateForm.value;
      data.orgID = this.orgDetails.orgID;
      this.toast.showSuccess(await this.orgService.update(data));
      this.updateForm.reset();
      this.initOrgData(this.orgDetails.orgID);
    } catch (error) {
      this.toast.showError(error);
    }
  }

  onDelete = async () => {
    if (this.deleteForm.invalid) return;

    try {
      let data: deleteDto = this.deleteForm.value;
      data.orgID = this.orgDetails.orgID;
      this.toast.showSuccess(await this.orgService.delete(data));
      this.router.navigateByUrl('orgs');
      this.deleteForm.reset();
    } catch (error) {
      this.toast.showError(error);
    }
  }

  onMembership = async () => {
    if (this.membershipForm.invalid) return;

    try {
      const data = this.membershipForm.value;
      const action = data.action;
      delete data.action;
      let result: string = "Success";

      if (action == 'ADD') {
        const dto: addMemberDto = {
          password: data.password,
          admin: data.admin,
          orgID: this.orgDetails.orgID,
          email: data.email
        };
        result = await this.orgService.addMember(dto);
      }
      else if (action == 'MODIFY') {
        const dto: updateMemberDto = {
          password: data.password,
          admin: data.admin,
          orgID: this.orgDetails.orgID,
          email: data.email
        };
        result = await this.orgService.updateMember(dto);
      }
      else {
        const dto: removeMemberDto = {
          password: data.password,
          orgID: this.orgDetails.orgID,
          email: data.email
        };
        result = await this.orgService.removeMember(dto);
      }
      this.toast.showSuccess(result);
      this.membershipForm.reset();
      this.initOrgData(this.orgDetails.orgID);
    } catch (error) {
      this.toast.showError(error);
    }
  }
}
