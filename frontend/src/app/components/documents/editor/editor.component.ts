import { Component } from '@angular/core';
import { MatButtonToggleModule } from '@angular/material/button-toggle';
import { LoadingButtonComponent } from "../../reusable/loading-button.component";
import { MatIconModule } from '@angular/material/icon';
import { ActivatedRoute, Router } from '@angular/router';
import { ToastService } from 'src/app/services/helper/toast.service';
import { OrgService } from 'src/app/services/backend/org.service';
import { FormBuilder } from '@angular/forms';
import { ValidatorService } from 'src/app/services/helper/validator.service';

@Component({
  selector: 'app-editor',
  imports: [
    MatButtonToggleModule,
    MatIconModule,
    LoadingButtonComponent
  ],
  templateUrl: './editor.component.html',
  styleUrl: './editor.component.scss'
})
export class EditorComponent {

  constructor(
    private route: ActivatedRoute,
    private toast: ToastService,
    private router: Router,
    private orgService: OrgService,
    private fb: FormBuilder,
    public valid: ValidatorService
  ) {

  }

  async initOrgData(docID: string) {
    // this.orgDetails = await this.orgService.details({ orgID: orgID });
    // this.members = await this.orgService.queryMembers({ orgID: orgID });

    // this.orgDetails.createdAt = new Date(this.orgDetails.createdAt);
    // this.orgDetails.updatedAt = new Date(this.orgDetails.updatedAt);
    // this.updateForm.get('name')?.setValue(this.orgDetails.name);
    // this.updateForm.get('description')?.setValue(this.orgDetails.description);
    // this.membershipForm.get('action')?.setValue("ADD");
  }

  async ngOnInit() {
    try {
      const docID = this.route.snapshot.queryParamMap.get('docID');
      if (!docID) {
        throw Error("No organization ID provided");
      }
      await this.initOrgData(docID);
    }
    catch (error) {
      this.toast.showError(error);
      this.router.navigateByUrl('orgs');
    }
  }

  openSettings = async () => {

  }

  onSave = async () => {

  }

  closeDoc = async () => {

  }
}
