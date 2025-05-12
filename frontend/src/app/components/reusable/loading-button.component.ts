import { Component, Input } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatIconModule } from '@angular/material/icon';
import { CommonModule } from '@angular/common';
import { TupleType } from 'typescript';

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
  @Input() externalDisabled = false;
  @Input() buttonType: 'button' | 'submit' | 'reset' = 'button';
  @Input() colorTheme: 'primary' | 'accent' | 'warn' = 'primary';
  @Input() clickAction: () => Promise<any> = async () => {};
  @Input() reuseDelay = 0.5;

  lastClick = 0;
  isLoading = false;

  constructor() { }

  get disabled(): boolean {
    return this.externalDisabled || this.isLoading;
  }

  async onClick() {
    if (this.isLoading) return;

    const now = Date.now();
    if (now - this.lastClick < this.reuseDelay * 1000) return;
    this.lastClick = now;

    this.isLoading = true;
    await Promise.resolve();

    try {
      await this.clickAction();
    } finally {
      this.isLoading = false;
    }
  }
}