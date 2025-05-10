import { CommonModule } from "@angular/common";
import { Component } from "@angular/core";
import { FormsModule } from "@angular/forms";
import { MatButtonModule } from "@angular/material/button";
import { MatCardModule } from "@angular/material/card";
import { MatFormFieldModule } from "@angular/material/form-field";
import { MatGridListModule } from "@angular/material/grid-list";
import { MatIconModule } from "@angular/material/icon";
import { MatInputModule } from "@angular/material/input";
import { LoadingButtonComponent } from "../reusable/loading-button.component";
import { QueriedDocument } from "@shared/response_models";
import { DocumentsService } from "src/app/services/backend/docs.service";
import { ToastService } from "src/app/services/helper/toast.service";
import { Access } from "@shared/access";

@Component({
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatFormFieldModule,
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

  constructor(private docService: DocumentsService, private toast: ToastService) {

  }

  async search() {
    try {
      this.documents = await this.docService.query({ filter: this.searchTerm });
    }
    catch (error) {
      console.log(error);
      this.toast.showError(error);
    }
  }

  async new() {

  }

  isEditor(access: Access) {
    return access >= Access.Editor;
  }
}