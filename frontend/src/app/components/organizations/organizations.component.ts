import { CommonModule } from "@angular/common";
import { Component } from "@angular/core";
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from "@angular/forms";
import { MatButtonModule } from "@angular/material/button";
import { MatCardModule } from "@angular/material/card";
import { MatFormFieldModule } from "@angular/material/form-field";
import { MatGridListModule } from "@angular/material/grid-list";
import { MatIconModule } from "@angular/material/icon";
import { MatInputModule } from "@angular/material/input";
import { LoadingButtonComponent } from "../reusable/loading-button.component";
import { ToastService } from "src/app/services/helper/toast.service";
import { Router } from "@angular/router";
import { createDto, OrgService } from "src/app/services/backend/org.service";
import { ValidatorService } from "src/app/services/helper/validator.service";
import { MatSelectModule } from "@angular/material/select";
import { MatOptionModule } from "@angular/material/core";
import { QueriedOrg } from "@shared/response_models";
import { MAX_ORG_DESC_LENGTH, MAX_ORG_NAME_LENGTH, MIN_ORG_NAME_LENGTH } from "@shared/constants";

@Component({
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatSelectModule,
    MatOptionModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule,
    MatGridListModule,
    MatCardModule,
    LoadingButtonComponent
  ],
  providers: [
    ToastService
  ],
  selector: 'app-documents',
  templateUrl: './organizations.component.html',
  styleUrls: ['./organizations.component.scss']
})
export class OrganizationsComponent {
  searchTerm = '';
  orgs: Array<QueriedOrg> = [];
  newWindowOpen: boolean = false;
  newOrgForm: FormGroup;

  constructor(
    private toast: ToastService,
    private fb: FormBuilder,
    public valid: ValidatorService,
    private router: Router,
    private orgService: OrgService
  ) {

    this.newOrgForm = this.fb.group({
      name: ['', [Validators.required, Validators.minLength(MIN_ORG_NAME_LENGTH), Validators.maxLength(MAX_ORG_NAME_LENGTH)]],
      description: ['', [Validators.maxLength(MAX_ORG_DESC_LENGTH)]],
    });
  }

  async ngOnInit() {
    try {
      this.orgs = await this.orgService.query();
    } catch (error) {
      this.toast.showError(error);
    }
  }

  openNewOrg = async () => {
    if (this.newWindowOpen) return;

    try {
      this.orgs = await this.orgService.query();
      this.newWindowOpen = true;
    } catch (error) {
      this.toast.showError(error);
      this.newWindowOpen = false;
    }
  }

  closeNewOrg = async () => {
    this.newWindowOpen = false;
  }

  createOrg = async () => {
    if (this.newOrgForm.invalid) return;

    try {
      let org: createDto = this.newOrgForm.value;
      const id = await this.orgService.create(org);
      await this.openOrg(id);
    } catch (error) {
      this.toast.showError(error);
    }
  }

  getOpenOrg = (orgID: string): (() => Promise<void>) => {
    return async () => { await this.openOrg(orgID) };
  }

  openOrg = async (orgID: string) => {
    try {
      const result = await this.router.navigate(['orgs', 'details'], { queryParams: { orgID: orgID } });
      if (!result) {
        this.toast.showError("Couldn't open organization!");
      }
    }
    catch (error) {
      this.toast.showError(error);
    }
  }
}
