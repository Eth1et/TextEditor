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
import { QueriedDocument, QueriedOrg } from "@shared/response_models";
import { DocumentsService } from "src/app/services/backend/docs.service";
import { ToastService } from "src/app/services/helper/toast.service";
import { Access, accessOptions } from "@shared/access";
import { Router } from "@angular/router";
import { OrgService } from "src/app/services/backend/org.service";
import { ValidatorService } from "src/app/services/helper/validator.service";
import { MatSelectModule } from "@angular/material/select";
import { MatOptionModule } from "@angular/material/core";

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
    ToastService,
    DocumentsService
  ],
  selector: 'app-documents',
  templateUrl: './documents.component.html',
  styleUrls: ['./documents.component.scss']
})
export class DocumentsComponent {
  searchTerm = '';
  documents: Array<QueriedDocument> = [];
  orgs: Array<QueriedOrg> = [];
  newWindowOpen: boolean = false;
  newDocForm: FormGroup;
  accessOptions: typeof accessOptions = [];
  orgOptions: Array<Record<"orgID" | "name", string>> = [{ orgID: "null", name: "None" }];

  constructor(
    private toast: ToastService,
    private docService: DocumentsService,
    private fb: FormBuilder,
    private valid: ValidatorService,
    private router: Router,
    private orgService: OrgService
  ) {

    this.accessOptions = accessOptions;
    this.newDocForm = this.fb.group({
      title: ['', [Validators.required]],
      publicAccess: [0, [Validators.required]],
      orgID: ["", [Validators.required]],
      orgAccess: [0, []]
    });

    this.newDocForm.setValidators([
      this.valid.inSetValidator('publicAccess', Object.values(Access), false),
      this.valid.inSetValidator('orgAccess', Object.values(Access), true),
      this.valid.inSetValidatorDynamic('orgID', () => this.orgs.map(org => org.orgID).concat(["null"]), false),
    ]);
    this.newDocForm.get('orgID')?.valueChanges.subscribe(value => {
      const orgAccessControl = this.newDocForm.get('orgAccess');
      if (value === 'null') {
        orgAccessControl?.disable();
      } else {
        orgAccessControl?.enable();
      }
    });
  }

  getControlErrors = (form: FormGroup, name: string): string[] => {
    const ctrl = form.get(name);

    if (!ctrl || !ctrl.errors) return [];

    const errs = [];
    if (ctrl.hasError('required')) {
      errs.push('This field is required');
    }
    else if (ctrl.hasError('notInSet')) {
      const err = ctrl.getError('notInSet');
      errs.push(`Invalid value: ${err?.get("value")}, valid options: ${err?.get("allowed")}`);
    }
    return errs;
  }

  async ngOnInit() {
    this.searchTerm = '';
    await this.search();
  }

  search = async () => {
    try {
      this.documents = await this.docService.query({ filter: this.searchTerm });
    }
    catch (error) {
      console.log(error);
      this.toast.showError(error);
    }
  }

  newDoc = async () => {
    try {
      this.orgs = await this.orgService.query();
      this.orgOptions = this.orgs.map(org => ({ "orgID": org.orgID, "name": org.name }));
      this.orgOptions.push({ orgID: "null", name: "None" });
      this.newWindowOpen = true;
      console.log("done");
    } catch (error) {
      this.toast.showError(error);
      this.newWindowOpen = false;
    }
  }

  createDoc = async () => {

  }

  open = async () => {

  }

  isEditor(access: Access) {
    return access >= Access.Editor;
  }
}