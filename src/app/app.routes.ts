import { Routes } from '@angular/router';
import { authGuard } from './guards/auth.guard';
import { adminGuard } from './guards/admin.guard';

export const routes: Routes = [
  { path: '', redirectTo: 'login', pathMatch: 'full' },
  {
    path: 'register',
    loadComponent: () => import('./pages/register/register.page').then((m) => m.RegisterPage),
  },
  {
    path: 'login',
    loadComponent: () => import('./pages/login/login.page').then((m) => m.LoginPage),
  },
  {
    path: 'tabs',
    canActivate: [authGuard],
    loadComponent: () => import('./tabs/tabs.page').then((m) => m.TabsPage),
    children: [
      {
        path: 'movies',
        loadComponent: () => import('./pages/movies/movies.page').then((m) => m.MoviesPage),
      },
      {
        path: 'playlist',
        loadComponent: () => import('./pages/playlist/playlist.page').then((m) => m.PlaylistPage),
      },
      {
        path: 'matching',
        loadComponent: () => import('./pages/matching/matching.page').then((m) => m.MatchingPage),
      },
      {
        path: 'admin-add-movie',
        loadComponent: () => import('./pages/admin-add-movie/admin-add-movie.page').then((m) => m.AdminAddMoviePage),
      },
      {
        path: 'admin-users',
        loadComponent: () => import('./pages/admin-users/admin-users.page').then((m) => m.AdminUsersPage),
      },
      {
        path: 'profile',
        loadComponent: () => import('./pages/profile/profile.page').then((m) => m.ProfilePage),
      },
      {
        path: '',
        redirectTo: 'movies',
        pathMatch: 'full',
      },
    ],
  },
  {
    path: 'profile',
    canActivate: [authGuard],
    loadComponent: () => import('./pages/profile/profile.page').then((m) => m.ProfilePage),
  },
  {
    path: 'movies',
    canActivate: [authGuard],
    loadComponent: () => import('./pages/movies/movies.page').then((m) => m.MoviesPage),
  },
  {
    path: 'movie-details/:id',
    canActivate: [authGuard],
    loadComponent: () => import('./pages/movie-details/movie-details.page').then((m) => m.MovieDetailsPage),
  },
  {
    path: 'playlist',
    canActivate: [authGuard],
    loadComponent: () => import('./pages/playlist/playlist.page').then((m) => m.PlaylistPage),
  },
  {
    path: 'admin-add-movie',
    canActivate: [authGuard, adminGuard],
    loadComponent: () => import('./pages/admin-add-movie/admin-add-movie.page').then((m) => m.AdminAddMoviePage),
  },
  {
    path: 'admin-users',
    canActivate: [authGuard, adminGuard],
    loadComponent: () => import('./pages/admin-users/admin-users.page').then((m) => m.AdminUsersPage),
  },
  {
    path: 'matching',
    canActivate: [authGuard],
    loadComponent: () => import('./pages/matching/matching.page').then((m) => m.MatchingPage),
  },
  {
    path: 'home',
    redirectTo: 'tabs',
    pathMatch: 'full',
  },
];
