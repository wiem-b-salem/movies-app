import { Component, OnInit, computed, inject, signal } from '@angular/core';
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
  IonSearchbar,
  IonSegment,
  IonSegmentButton,
  IonLabel,
} from '@ionic/angular';
import { auth } from '../../firebase';
import { MovieService } from '../../services/movie.service';
import { FirebaseMovieService } from '../../services/firebase-movie.service';
import { FavoritesService } from '../../services/favorites.service';
import { Movie } from '../../models/movie.model';

// TEMPORAIRE : identifiant de test tant que la connexion d'Eya n'existe pas
const TEST_UID = 'test-user-mariem';

type SourceFilter = 'all' | 'tmdb' | 'firebase';

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
    IonSearchbar,
    IonSegment,
    IonSegmentButton,
    IonLabel,
    RouterLink,
    CommonModule,
    FormsModule,
  ],
})
export class MoviesPage implements OnInit {
  private movieService = inject(MovieService);
  private firebaseMovieService = inject(FirebaseMovieService);
  private favoritesService = inject(FavoritesService);

  // --- Sources de films ---
  tmdbMovies = signal<Movie[]>([]);
  firebaseMovies = signal<Movie[]>([]);
  private popularMovies: Movie[] = []; // pour revenir aux populaires sans redemander

  // --- Recherche et filtre ---
  searchText = signal('');
  sourceFilter = signal<SourceFilter>('all');
  searching = signal(false);
  searchError = signal('');
  private searchTimer: ReturnType<typeof setTimeout> | undefined;
  private lastRequestId = 0;

  // --- État de la page ---
  loading = signal(true);
  error = signal('');

  // --- Favoris ---
  uid = signal<string | null>(null);
  favoriteIds = signal<string[]>([]);

  // Liste affichée : se recalcule toute seule quand une information change
  movies = computed(() => {
    const query = this.searchText().trim().toLowerCase();
    const filter = this.sourceFilter();

    let fb = this.firebaseMovies();
    if (query) {
      fb = fb.filter((m) => m.title.toLowerCase().includes(query));
    }
    const tmdb = this.tmdbMovies();

    if (filter === 'tmdb') return tmdb;
    if (filter === 'firebase') return fb;
    return [...fb, ...tmdb]; // films de l'admin en premier
  });

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
      const [tmdb, fb] = await Promise.all([
        firstValueFrom(this.movieService.getPopularMovies()),
        this.firebaseMovieService.getMovies().catch((err) => {
          console.warn('Films Firebase non chargés :', err);
          return [] as Movie[];
        }),
      ]);

      this.popularMovies = tmdb;
      this.tmdbMovies.set(tmdb);
      this.firebaseMovies.set(fb);

      // Si une recherche était déjà tapée, on la relance
      if (this.searchText().trim()) {
        this.searchTmdb();
      }
    } catch {
      this.error.set('Impossible de charger les films.');
    } finally {
      this.loading.set(false);
    }
  }

  // --- Recherche ---

  // Appelée à chaque lettre tapée dans la barre de recherche
  onSearch(event: Event) {
    const value = ((event as CustomEvent).detail.value ?? '') as string;
    this.searchText.set(value);
    this.searching.set(value.trim() !== '');

    // On attend 0,5 s après la dernière lettre avant de contacter TMDB
    clearTimeout(this.searchTimer);
    this.searchTimer = setTimeout(() => this.searchTmdb(), 500);
  }

  private async searchTmdb() {
    const query = this.searchText().trim();
    const requestId = ++this.lastRequestId;
    this.searchError.set('');

    // Recherche vide : on remet les films populaires
    if (!query) {
      this.tmdbMovies.set(this.popularMovies);
      this.searching.set(false);
      return;
    }

    this.searching.set(true);
    try {
      const results = await firstValueFrom(this.movieService.searchMovies(query));
      if (requestId !== this.lastRequestId) return; // réponse trop ancienne : on l'ignore
      this.tmdbMovies.set(results);
    } catch {
      if (requestId !== this.lastRequestId) return;
      this.tmdbMovies.set([]);
      this.searchError.set('La recherche a échoué. Réessayez.');
    } finally {
      if (requestId === this.lastRequestId) {
        this.searching.set(false);
      }
    }
  }

  // --- Filtre ---
  onFilterChange(event: Event) {
    const value = (event as CustomEvent).detail.value as SourceFilter;
    this.sourceFilter.set(value);
  }

  // --- Favoris ---
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