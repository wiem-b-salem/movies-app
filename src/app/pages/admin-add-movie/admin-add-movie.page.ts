import { Component, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import {
  IonButton, IonContent, IonHeader, IonInput, IonItem,
  IonLabel, IonTextarea, IonTitle, IonToolbar,
} from '@ionic/angular';
import { FirebaseMovieService } from '../../services/firebase-movie.service';

@Component({
  selector: 'app-admin-add-movie',
  templateUrl: './admin-add-movie.page.html',
  styleUrls: ['./admin-add-movie.page.scss'],
  imports: [
    IonButton, IonContent, IonHeader, IonInput, IonItem,
    IonLabel, IonTextarea, IonTitle, IonToolbar, FormsModule,
  ],
})
export class AdminAddMoviePage {
  private movies = inject(FirebaseMovieService);

  title = '';
  overview = '';
  posterUrl = '';
  releaseDate = '';
  rating: number | null = null;

  readonly saving = signal(false);
  readonly message = signal('');
  readonly isError = signal(false);

  get valid(): boolean {
    return (
      this.title.trim().length > 0 &&
      this.rating !== null && this.rating >= 0 && this.rating <= 10
    );
  }

  async submit() {
    if (!this.valid || this.saving()) return;
    this.saving.set(true);
    this.message.set('');
    try {
      await this.movies.addMovie({
        title: this.title.trim(),
        overview: this.overview.trim(),
        posterUrl: this.posterUrl.trim(),
        releaseDate: this.releaseDate,
        rating: this.rating as number,
      });
      this.isError.set(false);
      this.message.set('Film ajouté.');
      this.title = this.overview = this.posterUrl = this.releaseDate = '';
      this.rating = null;
    } catch {
      this.isError.set(true);
      this.message.set("Erreur lors de l'ajout. Réessayez.");
    } finally {
      this.saving.set(false);
    }
  }
}
