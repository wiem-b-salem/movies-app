import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
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

  movies = signal<Movie[]>([]);
  loading = signal(true);
  error = signal('');

  ngOnInit() {
    this.loadMovies();
  }

  loadMovies() {
    this.loading.set(true);
    this.error.set('');

    this.movieService.getPopularMovies().subscribe({
      next: (list) => {
        this.movies.set(list);
        this.loading.set(false);
      },
      error: () => {
        this.error.set('Impossible de charger les films.');
        this.loading.set(false);
      },
    });
  }
}