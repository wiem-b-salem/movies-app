import { Component, inject } from '@angular/core';
import { Router } from '@angular/router';
import {
  IonAvatar, IonBackButton, IonButton, IonButtons, IonContent, IonHeader,
  IonItem, IonLabel, IonList, IonTitle, IonToolbar,
} from '@ionic/angular';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-profile',
  templateUrl: './profile.page.html',
  imports: [
    IonHeader, IonToolbar, IonTitle, IonButtons, IonBackButton, IonContent,
    IonAvatar, IonList, IonItem, IonLabel, IonButton,
  ],
})
export class ProfilePage {
  private authService = inject(AuthService);
  private router = inject(Router);

  profile = this.authService.profile;

  async logout() {
    await this.authService.logout();
    this.router.navigateByUrl('/login', { replaceUrl: true });
  }
}