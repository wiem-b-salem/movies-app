import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { firstValueFrom } from 'rxjs';
import { onAuthStateChanged } from 'firebase/auth';
import { addIcons } from 'ionicons';
import { heart, heartOutline } from 'ionicons/icons';
import {
  IonContent,
  IonHeader,
  IonTitle,
  IonToolbar,
  IonCard,
  IonCardHeader,
  IonCardTitle,
  IonCardSubtitle,
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
  selector: 'app-movies',
  templateUrl: './movies.page.html',
  styleUrls: ['./movies.page.scss'],
  imports: [
    IonContent,
    IonHeader,
    IonTitle,
    IonToolbar,
    IonCard,
    IonCardHeader,
    IonCardTitle,
    IonCardSubtitle,
    IonSpinner,
    IonButton,
    IonIcon,
    RouterLink,
    CommonModule,
    FormsModule,
  ],
})
export class MoviesPage implements OnInit {
  private movieService = inject(MovieService);
  private firebaseMovieService = inject(FirebaseMovieService);
  private favoritesService = inject(FavoritesService);

  movies = signal<Movie[]>([]);
  loading = signal(true);
  error = signal('');

  uid = signal<string | null>(null);
  favoriteIds = signal<string[]>([]);

  constructor() {
    addIcons({ heart, heartOutline });

    onAuthStateChanged(auth, (user) => {
      this.uid.set(user?.uid ?? TEST_UID);
      this.loadFavorites();
    });
  }

  ngOnInit() {
    this.loadMovies();
  }

  // Se relance à chaque retour sur cette page (par exemple depuis les détails)
  ionViewWillEnter() {
    this.loadFavorites();
  }

  async loadMovies() {
    this.loading.set(true);
    this.error.set('');

    try {
      const [tmdbMovies, firebaseMovies] = await Promise.all([
        firstValueFrom(this.movieService.getPopularMovies()),
        this.firebaseMovieService.getMovies().catch((err) => {
          console.warn('Films Firebase non chargés :', err);
          return [] as Movie[];
        }),
      ]);

      // Films de l'admin en premier, puis ceux de TMDB
      this.movies.set([...firebaseMovies, ...tmdbMovies]);
    } catch {
      this.error.set('Impossible de charger les films.');
    } finally {
      this.loading.set(false);
    }
  }

  async loadFavorites() {
    const uid = this.uid();
    if (!uid) return;

    try {
      this.favoriteIds.set(await this.favoritesService.getFavorites(uid));
    } catch (err) {
      console.warn('Favoris non chargés :', err);
    }
  }

  isFavorite(movieId: string): boolean {
    return this.favoriteIds().includes(movieId);
  }

  async toggleFavorite(movie: Movie, event: Event) {
    // Empêche le clic d'ouvrir la page détails
    event.stopPropagation();
    event.preventDefault();

    const uid = this.uid();
    if (!uid) return;

    const before = this.favoriteIds();
    const wasFavorite = before.includes(movie.id);

    // Le cœur change tout de suite
    this.favoriteIds.set(
      wasFavorite ? before.filter((id) => id !== movie.id) : [...before, movie.id]
    );

    try {
      if (wasFavorite) {
        await this.favoritesService.removeFavorite(uid, movie.id);
      } else {
        await this.favoritesService.addFavorite(uid, movie.id);
      }
    } catch (err) {
      console.warn('Favori non enregistré :', err);
      this.favoriteIds.set(before); // on remet le cœur comme avant
    }
  }
}