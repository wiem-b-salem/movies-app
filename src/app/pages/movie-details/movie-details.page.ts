import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { firstValueFrom } from 'rxjs';
import {
  IonContent,
  IonHeader,
  IonTitle,
  IonToolbar,
  IonButtons,
  IonBackButton,
  IonSpinner,
  IonButton,
} from '@ionic/angular';
import { MovieService } from '../../services/movie.service';
import { FirebaseMovieService } from '../../services/firebase-movie.service';
import { Movie } from '../../models/movie.model';

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
    CommonModule,
    FormsModule,
  ],
})
export class MovieDetailsPage implements OnInit {
  private route = inject(ActivatedRoute);
  private movieService = inject(MovieService);
  private firebaseMovieService = inject(FirebaseMovieService);

  movie = signal<Movie | null>(null);
  loading = signal(true);
  error = signal('');

  ngOnInit() {
    this.loadMovie();
  }

  async loadMovie() {
    this.loading.set(true);
    this.error.set('');

    // L'id vient de l'adresse : "tmdb_550" ou "fb_Ab12Cd"
    const id = this.route.snapshot.paramMap.get('id') ?? '';

    try {
      let result: Movie | null = null;

      if (id.startsWith('tmdb_')) {
        const tmdbId = Number(id.replace('tmdb_', ''));
        result = await firstValueFrom(this.movieService.getMovieDetails(tmdbId));
      } else if (id.startsWith('fb_')) {
        result = await this.firebaseMovieService.getMovieById(id.replace('fb_', ''));
      }

      if (result) {
        this.movie.set(result);
        console.log('Film chargé :', result); // test temporaire
      } else {
        this.error.set('Film introuvable.');
      }
    } catch {
      this.error.set('Impossible de charger ce film.');
    } finally {
      this.loading.set(false);
    }
  }
}