import { Component, Input } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatIconModule } from '@angular/material/icon';
import { CommonModule } from '@angular/common';
import { LoadingService } from 'src/app/services/helper/loading.service';
import { OnInit } from '@angular/core';
import { Observable } from 'rxjs';

@Component({
  imports: [
    MatButtonModule,
    MatProgressSpinnerModule,
    MatIconModule,
    CommonModule
  ],
  selector: 'app-loading-button',
  templateUrl: './loading-button.component.html',
  styleUrls: ['./loading-button.component.scss']
})
export class LoadingButtonComponent {
  @Input() label?: string;
  @Input() icon?: string;
  @Input() disabled?: boolean;
  @Input() color: 'primary' | 'accent' | 'warn' | undefined = 'primary';
  @Input() loaderName!: string;
  @Input() clickAction!: () => Promise<any>;;

  isLoading!: Observable<boolean>;

  constructor(private loading: LoadingService) {

  }

  ngOnInit() {
    this.isLoading = this.loading.isThisLoading$(this.loaderName);
  }

  async onClick() {
    const started = this.loading.startLoading(this.loaderName);
    if (!started) return;

    try {
      await this.clickAction();
    } finally {
      this.loading.stopLoading(this.loaderName);
    }
  }
}