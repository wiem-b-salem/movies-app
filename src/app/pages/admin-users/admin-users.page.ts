import { Component, OnInit, inject, signal } from '@angular/core';
import {
  IonAvatar, IonContent, IonHeader, IonItem, IonLabel,
  IonSpinner, IonTitle, IonToggle, IonToolbar,
} from '@ionic/angular';
import { AppUser } from '../../models/user.model';
import { AuthService } from '../../services/auth.service';
import { UsersService } from '../../services/users.service';

@Component({
  selector: 'app-admin-users',
  templateUrl: './admin-users.page.html',
  styleUrls: ['./admin-users.page.scss'],
  imports: [IonAvatar, IonContent, IonHeader, IonItem, IonLabel, IonSpinner, IonTitle, IonToggle, IonToolbar],
})
export class AdminUsersPage implements OnInit {
  private usersService = inject(UsersService);
  private auth = inject(AuthService);

  readonly users = signal<AppUser[]>([]);
  readonly loading = signal(true);
  readonly error = signal(false);

  get myUid(): string | undefined {
    return this.auth.profile()?.uid;
  }

  async ngOnInit() {
    try {
      this.users.set(await this.usersService.getUsers());
    } catch {
      this.error.set(true);
    } finally {
      this.loading.set(false);
    }
  }

  async toggle(user: AppUser, active: boolean) {
    if (user.uid === this.myUid) return;
    this.patch(user.uid, active);
    try {
      await this.usersService.setActive(user.uid, active);
    } catch {
      this.patch(user.uid, !active);
      this.error.set(true);
    }
  }

  private patch(uid: string, active: boolean) {
    this.users.update(list => list.map(u => (u.uid === uid ? { ...u, active } : u)));
  }
}
