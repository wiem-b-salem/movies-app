import { Component, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import {
  IonAvatar, IonButton, IonContent, IonHeader, IonIcon, IonInput,
  IonSpinner, IonTitle, IonToolbar, ToastController,
} from '@ionic/angular';
import { addIcons } from 'ionicons';
import { camera, personCircle } from 'ionicons/icons';
import { AuthService, authErrorMessage } from '../../services/auth.service';
import { PhotoService } from '../../services/photo.service';

@Component({
  selector: 'app-register',
  templateUrl: './register.page.html',
  imports: [
    ReactiveFormsModule, RouterLink, IonHeader, IonToolbar, IonTitle, IonContent,
    IonInput, IonButton, IonIcon, IonAvatar, IonSpinner,
  ],
})
export class RegisterPage {
  private fb = inject(FormBuilder);
  private authService = inject(AuthService);
  private photoService = inject(PhotoService);
  private router = inject(Router);
  private toastCtrl = inject(ToastController);

  photo = signal('');
  loading = signal(false);

  form = this.fb.nonNullable.group({
    nom: ['', Validators.required],
    prenom: ['', Validators.required],
    age: [null as number | null, [Validators.required, Validators.min(1), Validators.max(120)]],
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required, Validators.minLength(6)]],
  });

  constructor() {
    addIcons({ camera, personCircle });
  }

  async takePhoto() {
    const p = await this.photoService.takePhoto();
    if (p) this.photo.set(p);
  }

  async submit() {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return this.toast('Remplissez tous les champs correctement.');
    }
    if (!this.photo()) return this.toast('Ajoutez une photo de profil.');

    this.loading.set(true);
    try {
      const v = this.form.getRawValue();
      await this.authService.register({
        nom: v.nom.trim(), prenom: v.prenom.trim(), age: Number(v.age),
        email: v.email.trim(), password: v.password, photo: this.photo(),
      });
      this.router.navigateByUrl('/movies', { replaceUrl: true });
    } catch (e) {
      this.toast(authErrorMessage(e));
    } finally {
      this.loading.set(false);
    }
  }

  private async toast(message: string) {
    (await this.toastCtrl.create({ message, duration: 2500 })).present();
  }
}