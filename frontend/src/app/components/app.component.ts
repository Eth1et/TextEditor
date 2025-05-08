import { Component } from '@angular/core';
import { MatToolbarModule } from '@angular/material/toolbar';
import { Router, RouterOutlet } from '@angular/router';
import { Observable } from 'rxjs';
import { UserService } from '../services/backend/user.service';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { ToastService } from '../services/helper/toast.service';
import { LoadingButtonComponent } from "./reusable/loading-button.component";

@Component({
  selector: 'app-root',
  imports: [
    RouterOutlet,
    CommonModule,
    MatToolbarModule,
    MatButtonModule,
    MatIconModule,
    LoadingButtonComponent
],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss'
})
export class AppComponent {
  public isLoggedIn: Observable<boolean>;

  constructor(
    private userService: UserService,
    private router: Router,
    private toast: ToastService
  ) {
    this.isLoggedIn = this.userService.isLoggedIn();
  }

  gotoDocuments = async () => await this.navigateTo("documents");
  gotoOrgs = async () => await this.navigateTo("orgs");
  gotoProfile = async () => await this.navigateTo("profile");

  async navigateTo(url: string) {
    try {
      const result = await this.router.navigateByUrl(url);
      if (!result) {
        this.toast.showError("Couldn't navigate to " + url);
      }
      else {
        this.router.navigateByUrl(url);
      }
    } 
    catch (error) {
      this.toast.showError(error);
    }
  }

  isActive(route: string): boolean {
    return this.router.url === `/${route}`;
  }

  logoutAction = async () => await this.logout();

  async logout() {
    this.userService.logout().subscribe({
      next: (response) => {
        this.toast.showSuccess(response);
        this.router.navigateByUrl("login");
      },
      error: (error) => {
        this.toast.showError(error);
      },
    });
  }
}
