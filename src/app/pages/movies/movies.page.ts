import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { firstValueFrom } from 'rxjs';
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
} from '@ionic/angular';
import { MovieService } from '../../services/movie.service';
import { FirebaseMovieService } from '../../services/firebase-movie.service';
import { Movie } from '../../models/movie.model';

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
    CommonModule,
    FormsModule,
  ],
})
export class MoviesPage implements OnInit {
  private movieService = inject(MovieService);
  private firebaseMovieService = inject(FirebaseMovieService);

  movies = signal<Movie[]>([]);
  loading = signal(true);
  error = signal('');

  ngOnInit() {
    this.loadMovies();
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
}