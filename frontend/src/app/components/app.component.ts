import { Component } from '@angular/core';
import { MatToolbarModule } from '@angular/material/toolbar';
import { NavigationEnd, Router, RouterOutlet } from '@angular/router';
import { UserService } from '../services/backend/user.service';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { ToastService } from '../services/helper/toast.service';
import { LoadingButtonComponent } from "./reusable/loading-button.component";
import { Subscription, filter } from 'rxjs';

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
  public isLoggedIn: boolean = false;
  private routeSub: Subscription | null = null;

  constructor(
    private userService: UserService,
    private router: Router,
    private toast: ToastService
  ) {
    this.isLoggedIn = false;
  }

  async ngOnInit() {
    await this.setLoggedIn();

    this.routeSub = this.router.events
      .pipe(filter(event => event instanceof NavigationEnd))
      .subscribe(async () => {
        await this.setLoggedIn();
      });
  }

  ngOnDestroy() {
    this.routeSub?.unsubscribe();
  }

  async setLoggedIn() {
    try {
      this.isLoggedIn = await this.userService.isLoggedIn();
    }
    catch (error) {
      console.log(error);
      this.isLoggedIn = false;
    }
  }

  gotoDocuments = async () => {await this.navigateTo("documents")};
  gotoOrgs = async () => {await this.navigateTo("orgs")};
  gotoProfile = async () => {await this.navigateTo("profile")};

  async navigateTo(url: string) {
    try {
      const result = await this.router.navigateByUrl(url);
      if (!result) {
        this.toast.showError("Couldn't navigate to " + url);
      }
    }
    catch (error) {
      this.toast.showError(error);
    }
  }

  isActive(route: string): boolean {
    return this.router.url === `/${route}`;
  }

  logout = async () => {
    try {
      const response = await this.userService.logout();
      this.toast.showSuccess(response);
      this.router.navigateByUrl("login");
    }
    catch (error) {
      this.toast.showError(error);
    }
  }
}
