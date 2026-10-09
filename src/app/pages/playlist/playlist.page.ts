import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { onAuthStateChanged } from 'firebase/auth';
import { addIcons } from 'ionicons';
import { heart } from 'ionicons/icons';
import {
  IonContent,
  IonHeader,
  IonTitle,
  IonToolbar,
  IonList,
  IonItem,
  IonThumbnail,
  IonLabel,
  IonButton,
  IonIcon,
  IonSpinner,
} from '@ionic/angular';
import { auth } from '../../firebase';
import { FavoritesService } from '../../services/favorites.service';
import { PlaylistService } from '../../services/playlist.service';
import { Movie } from '../../models/movie.model';

// TEMPORAIRE : identifiant de test tant que la connexion d'Eya n'existe pas
const TEST_UID = 'test-user-mariem';

@Component({
  selector: 'app-playlist',
  templateUrl: './playlist.page.html',
  styleUrls: ['./playlist.page.scss'],
  imports: [
    IonContent,
    IonHeader,
    IonTitle,
    IonToolbar,
    IonList,
    IonItem,
    IonThumbnail,
    IonLabel,
    IonButton,
    IonIcon,
    IonSpinner,
    RouterLink,
    CommonModule,
    FormsModule,
  ],
})
export class PlaylistPage {
  private favoritesService = inject(FavoritesService);
  private playlistService = inject(PlaylistService);

  movies = signal<Movie[]>([]);
  loading = signal(true);
  error = signal('');

  uid = signal<string | null>(null);

  constructor() {
    addIcons({ heart });

    onAuthStateChanged(auth, (user) => {
      this.uid.set(user?.uid ?? TEST_UID);
      this.loadPlaylist();
    });
  }

  // Se relance à chaque fois qu'on arrive sur cette page
  ionViewWillEnter() {
    this.loadPlaylist();
  }

  async loadPlaylist() {
    const uid = this.uid();
    if (!uid) return;

    this.loading.set(true);
    this.error.set('');

    try {
      const ids = await this.favoritesService.getFavorites(uid);
      const list = await this.playlistService.getMoviesByIds(ids);
      this.movies.set(list);
      console.log('Playlist :', list); // test temporaire
    } catch (err) {
      console.warn('Playlist non chargée :', err);
      this.error.set('Impossible de charger votre playlist.');
    } finally {
      this.loading.set(false);
    }
  }

  async removeFromPlaylist(movie: Movie, event: Event) {
    // Empêche le clic d'ouvrir la page détails
    event.stopPropagation();
    event.preventDefault();

    const uid = this.uid();
    if (!uid) return;

    const before = this.movies();
    this.movies.set(before.filter((m) => m.id !== movie.id)); // disparaît tout de suite

    try {
      await this.favoritesService.removeFavorite(uid, movie.id);
    } catch (err) {
      console.warn('Favori non retiré :', err);
      this.movies.set(before); // le film revient
    }
  }
}