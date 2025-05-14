import { Component } from '@angular/core';
import { MatButtonToggleChange, MatButtonToggleModule } from '@angular/material/button-toggle';
import { LoadingButtonComponent } from "../../reusable/loading-button.component";
import { MatIconModule } from '@angular/material/icon';
import { ActivatedRoute, Router } from '@angular/router';
import { ToastService } from 'src/app/services/helper/toast.service';
import { OrgService } from 'src/app/services/backend/org.service';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { ValidatorService } from 'src/app/services/helper/validator.service';
import { CommonModule } from '@angular/common';
import { MatInputModule } from '@angular/material/input';
import { MatCardModule } from '@angular/material/card';
import { Access, accessOptions, accessValues } from '@shared/access';
import { DocumentDetails, QueriedOrg, QueriedOverride } from '@shared/response_models';
import { addOverrideDto, DocumentsService, removeOverrideDto, saveDto, updateDto, updateOverrideDto } from 'src/app/services/backend/docs.service';
import { MatSelectModule } from '@angular/material/select';
import { NgxEditorComponent, NgxEditorMenuComponent, Editor, Toolbar } from 'ngx-editor';
import { DomSanitizer } from '@angular/platform-browser';
import { MatTabsModule } from '@angular/material/tabs';

@Component({
  selector: 'app-editor',
  imports: [
    MatButtonToggleModule,
    MatIconModule,
    LoadingButtonComponent,
    NgxEditorComponent,
    NgxEditorMenuComponent,
    ReactiveFormsModule,
    MatInputModule,
    MatTabsModule,
    MatSelectModule,
    MatCardModule,
    CommonModule,
    FormsModule
  ],
  templateUrl: './editor.component.html',
  styleUrl: './editor.component.scss'
})
export class EditorComponent {
  windowMode: 'editor' | 'preview' | 'both' = 'preview';

  settingsWindowOpen: boolean = false;
  settingsForm: FormGroup;
  accessOptions: typeof accessOptions = [];
  orgOptions: Array<Record<"orgID" | "name", string>> = [{ orgID: "null", name: "None" }];
  orgs: Array<QueriedOrg> = [];
  accessOverrides: Array<QueriedOverride> = [];

  accessActionOptions = ['Add', 'Remove', 'Modify'];
  accessOverrideForm: FormGroup;

  deleteForm: FormGroup;

  editor!: Editor;
  editorContent = '';
  toolbar: Toolbar = [
    ['bold', 'italic'],
    ['underline', 'strike'],
    ['code', 'blockquote'],
    ['ordered_list', 'bullet_list'],
    [{ heading: ['h1', 'h2', 'h3', 'h4', 'h5', 'h6'] }],
    ['link', 'image'],
    ['text_color', 'background_color'],
    ['align_left', 'align_center', 'align_right', 'align_justify'],
    ['horizontal_rule', 'format_clear', 'indent', 'outdent'],
    ['superscript', 'subscript'],
    ['undo', 'redo'],
  ];

  docDetails: DocumentDetails = {
    docID: "unknown",
    orgName: "unknown",
    orgID: "null",
    title: "unknown",
    text: "unknown",
    createdAt: new Date(),
    updatedAt: new Date(),
    creator: "unknown",
    isCreator: false,
    access: Access.Editor,
    publicAccess: Access.None,
    orgAccess: Access.Editor
  };

  constructor(
    private route: ActivatedRoute,
    private toast: ToastService,
    private router: Router,
    private orgService: OrgService,
    private fb: FormBuilder,
    private docService: DocumentsService,
    public valid: ValidatorService,
    private sanitizer: DomSanitizer
  ) {
    this.accessOptions = accessOptions;

    this.settingsForm = fb.group({
      publicAccess: [0, [Validators.required]],
      orgID: ['', [Validators.required]],
      orgAccess: [0, []]
    });
    this.settingsForm.setValidators([
      this.valid.inSetValidator('publicAccess', accessValues, false),
      this.valid.inSetValidator('orgAccess', accessValues, true),
      this.valid.inSetValidatorDynamic('orgID', () => this.orgs.map(org => org.orgID).concat(["null"]), false),
    ]);
    this.settingsForm.get('orgID')?.valueChanges.subscribe(value => {
      const orgAccessControl = this.settingsForm.get('orgAccess');
      if (value === 'null') {
        orgAccessControl?.disable();
      } else {
        orgAccessControl?.enable();
      }
    });

    this.accessOverrideForm = fb.group({
      action: ['Add', [Validators.required]],
      email: ['', [Validators.required, Validators.email]],
      access: [Access.None, [Validators.required]],
      password: ['', [Validators.required]]
    });
    this.accessOverrideForm.setValidators([
      this.valid.inSetValidator('action', this.accessActionOptions, false),
      this.valid.inSetValidator('access', accessValues, false),
    ]);

    this.deleteForm = fb.group({
      password: ['', [Validators.required]]
    });
  }

  async initData(docID: string) {
    try {
      this.docDetails = await this.docService.details({ docID });

      this.docDetails.createdAt = new Date(this.docDetails.createdAt);
      this.docDetails.updatedAt = new Date(this.docDetails.updatedAt);
      this.settingsForm.get('publicAccess')?.setValue(this.docDetails.publicAccess);
      this.settingsForm.get('orgAccess')?.setValue(this.docDetails.orgAccess);
      this.settingsForm.get('orgID')?.setValue(this.docDetails.orgID);
      this.editorContent = this.docDetails.text;
      this.accessOverrideForm.get('access')?.setValue(Access.None);
      this.accessOverrideForm.get('action')?.setValue('Add');
    }
    catch (error) {
      this.toast.showError(error);
      this.router.navigateByUrl('documents');
    }
  }

  async updateOverrides(docID: string) {
    try {
      this.accessOverrides = await this.docService.queryOverrides({ docID });
      if (this.accessOverrides.length == 0) {
        this.accessOverrides = [{
          access: Access.None,
          email: "No Results, example: yudsu@mail.com",
          addedBy: "somone@mail.com"
        }];
      }
    }
    catch (error) {
      this.toast.showError(error);
      this.closeSettings();
    }
  }

  sanitized() {
    return this.sanitizer.bypassSecurityTrustHtml(this.editorContent || '');
  }

  async ngOnInit() {
    try {
      const docID = this.route.snapshot.queryParamMap.get('docID');
      if (!docID) {
        throw Error("No document ID provided");
      }
      this.editor = new Editor({
        history: true,

      });
      await this.initData(docID);
    }
    catch (error) {
      this.toast.showError(error);
      this.router.navigateByUrl('documents');
    }
  }

  ngOnDestroy(): void {
    this.editor?.destroy();
  }

  onWindowModeChange = (event: MatButtonToggleChange) => {
    this.windowMode = event.value;
  }

  openSettings = async () => {
    if (this.settingsWindowOpen) return;

    try {
      await this.updateOverrides(this.docDetails.docID);
      this.orgs = await this.orgService.query();
      this.orgOptions = this.orgs.map(org => ({ "orgID": org.orgID, "name": org.name }));
      this.orgOptions.push({ orgID: "null", name: "None" });

      this.settingsWindowOpen = true;
    }
    catch (error) {
      this.toast.showError(error);
      this.settingsWindowOpen = false;
    }
  }
  closeSettings = async () => {
    this.settingsWindowOpen = false;
  }
  commitSettings = async () => {
    if (this.settingsForm.invalid) return;
    try {
      let doc: updateDto = this.settingsForm.value;
      if (doc.orgID === "null") {
        doc.orgID = undefined;
        doc.orgAccess = Access.None;
      }
      doc.docID = this.docDetails.docID;
      const success = await this.docService.update(doc);
      this.toast.showSuccess(success);
      await this.initData(this.docDetails.docID);
    }
    catch (error) {
      this.toast.showError(error);
    }
  }

  onSave = async () => {
    try {
      const saveData: saveDto = {
        docID: this.docDetails.docID,
        title: this.docDetails.title,
        text: this.editorContent
      };
      const result = await this.docService.save(saveData);
      this.toast.showSuccess(result);
    }
    catch (error) {
      this.toast.showError(error);
    }
  }

  isEditor() {
    return this.docDetails.access >= Access.Editor;
  }

  isCreator() {
    return this.docDetails.isCreator;
  }

  onAccessOverride = async () => {
    if (this.accessOverrideForm.invalid) return;
    try {
      const data = this.accessOverrideForm.value;
      const action = data.action;
      delete data.action;
      let result: string = "Success";

      if (action == 'Add') {
        const dto: addOverrideDto = {
          password: data.password,
          docID: this.docDetails.docID,
          email: data.email,
          access: data.access
        };
        result = await this.docService.addOverride(dto);
      }
      else if (action == 'Modify') {
        const dto: updateOverrideDto = {
          password: data.password,
          docID: this.docDetails.docID,
          email: data.email,
          access: data.access
        };
        result = await this.docService.updateOverride(dto);
      }
      else {
        const dto: removeOverrideDto = {
          password: data.password,
          docID: this.docDetails.docID,
          email: data.email
        };
        result = await this.docService.removeOverride(dto);
      }
      this.toast.showSuccess(result);
      this.accessOverrideForm.reset();
      this.initData(this.docDetails.docID);
      await this.updateOverrides(this.docDetails.docID);
    }
    catch (error) {
      this.toast.showError(error);
    }
  }

  onDelete = async () => {
    if (this.deleteForm.invalid) return;
    try {
      const docID = this.docDetails.docID;
      const result = await this.docService.delete({ docID, password: this.deleteForm.get('password')?.value });
      this.toast.showSuccess(result);
      this.router.navigateByUrl('documents');
    }
    catch (error) {
      this.toast.showError(error);
    }
  }

  accessToString(access: Access) {
    if (access >= Access.Editor) {
      return "Editor";
    }
    else if (access >= Access.Viewer) {
      return "Viewer";
    }
    return "Banned";
  }

  closeDoc = async () => {
    try {
      const res = this.router.navigateByUrl('documents');
      if (!res) {
        this.toast.showError('Failed to open /documents');
      }
    }
    catch (error) {
      this.toast.showError(error);
    }
  }
}
