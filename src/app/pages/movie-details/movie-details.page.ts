import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { firstValueFrom } from 'rxjs';
import { onAuthStateChanged } from 'firebase/auth';
import { addIcons } from 'ionicons';
import { heart, heartOutline } from 'ionicons/icons';
import {
  IonContent,
  IonHeader,
  IonTitle,
  IonToolbar,
  IonButtons,
  IonBackButton,
  IonSpinner,
  IonButton,
  IonIcon,
} from '@ionic/angular';
import { auth } from '../../firebase';
import { MovieService } from '../../services/movie.service';
import { FirebaseMovieService } from '../../services/firebase-movie.service';
import { FavoritesService } from '../../services/favorites.service';
import { Movie } from '../../models/movie.model';

// TEMPORAIRE : identifiant de test tant que la connexion d'Eya n'existe pas
const TEST_UID = 'test-user-mariem';

@Component({
  selector: 'app-movie-details',
  templateUrl: './movie-details.page.html',
  styleUrls: ['./movie-details.page.scss'],
  imports: [
    IonContent,
    IonHeader,
    IonTitle,
    IonToolbar,
    IonButtons,
    IonBackButton,
    IonSpinner,
    IonButton,
    IonIcon,
    CommonModule,
    FormsModule,
  ],
})
export class MovieDetailsPage implements OnInit {
  private route = inject(ActivatedRoute);
  private movieService = inject(MovieService);
  private firebaseMovieService = inject(FirebaseMovieService);
  private favoritesService = inject(FavoritesService);

  // L'id vient de l'adresse : "tmdb_550" ou "fb_Ab12Cd"
  private movieId = this.route.snapshot.paramMap.get('id') ?? '';

  movie = signal<Movie | null>(null);
  loading = signal(true);
  error = signal('');

  uid = signal<string | null>(null);
  isFavorite = signal(false);
  favError = signal('');

  constructor() {
    addIcons({ heart, heartOutline });

    onAuthStateChanged(auth, (user) => {
      this.uid.set(user?.uid ?? TEST_UID);
      this.loadFavoriteState();
    });
  }

  ngOnInit() {
    this.loadMovie();
  }

  async loadMovie() {
    this.loading.set(true);
    this.error.set('');

    try {
      let result: Movie | null = null;

      if (this.movieId.startsWith('tmdb_')) {
        const tmdbId = Number(this.movieId.replace('tmdb_', ''));
        result = await firstValueFrom(this.movieService.getMovieDetails(tmdbId));
      } else if (this.movieId.startsWith('fb_')) {
        result = await this.firebaseMovieService.getMovieById(this.movieId.replace('fb_', ''));
      }

      if (result) {
        this.movie.set(result);
      } else {
        this.error.set('Film introuvable.');
      }
    } catch {
      this.error.set('Impossible de charger ce film.');
    } finally {
      this.loading.set(false);
    }
  }

  // Le cœur est-il plein ? (le film est-il dans les favoris)
  async loadFavoriteState() {
    const uid = this.uid();
    if (!uid) return;

    try {
      const ids = await this.favoritesService.getFavorites(uid);
      this.isFavorite.set(ids.includes(this.movieId));
    } catch (err) {
      console.warn('Favoris non chargés :', err);
    }
  }

  async toggleFavorite() {
    const uid = this.uid();
    if (!uid) return;

    const wasFavorite = this.isFavorite();
    this.isFavorite.set(!wasFavorite); // le cœur change tout de suite
    this.favError.set('');

    try {
      if (wasFavorite) {
        await this.favoritesService.removeFavorite(uid, this.movieId);
      } else {
        await this.favoritesService.addFavorite(uid, this.movieId);
      }
    } catch (err) {
      console.warn('Favori non enregistré :', err);
      this.isFavorite.set(wasFavorite); // on remet le cœur comme avant
      this.favError.set('Impossible de mettre à jour les favoris.');
    }
  }
}