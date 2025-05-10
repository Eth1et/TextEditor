import { Component, Input } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatIconModule } from '@angular/material/icon';
import { CommonModule } from '@angular/common';

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
  @Input() type?: string;
  @Input() color: 'primary' | 'accent' | 'warn' | undefined = 'primary';
  @Input() clickAction!: () => Promise<any>;;
  @Input() reuseDelay: number = 0.5;

  lastClickedAt = 0;
  isLoading: boolean = false;

  constructor() {
    this.lastClickedAt = 0;
  }

  async onClick() {
    if (this.isLoading) return;

    const now = Date.now();
    if (now - this.lastClickedAt < this.reuseDelay * 1000) return;

    this.lastClickedAt = now;
    this.isLoading = true;

    try {
      await this.clickAction();
    } finally {
      this.isLoading = false;
    }
  }
}