import { Component, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import {
  IonButton, IonContent, IonHeader, IonInput, IonSpinner,
  IonTitle, IonToolbar, ToastController,
} from '@ionic/angular';
import { AuthService, authErrorMessage } from '../../services/auth.service';

@Component({
  selector: 'app-login',
  templateUrl: './login.page.html',
  imports: [
    ReactiveFormsModule, RouterLink, IonHeader, IonToolbar, IonTitle,
    IonContent, IonInput, IonButton, IonSpinner,
  ],
})
export class LoginPage {
  private fb = inject(FormBuilder);
  private authService = inject(AuthService);
  private router = inject(Router);
  private toastCtrl = inject(ToastController);

  loading = signal(false);

  form = this.fb.nonNullable.group({
    email: ['', [Validators.required, Validators.email]],
    password: ['', Validators.required],
  });

  async submit() {
    if (this.form.invalid) return this.toast('Email et mot de passe requis.');
    this.loading.set(true);
    try {
      const { email, password } = this.form.getRawValue();
      await this.authService.login(email.trim(), password);
      this.router.navigateByUrl('/tabs/movies', { replaceUrl: true });
    } catch (e) {
      this.toast(authErrorMessage(e));
    } finally {
      this.loading.set(false);
    }
  }

  private async toast(message: string) {
    (await this.toastCtrl.create({ message, duration: 3000 })).present();
  }
}