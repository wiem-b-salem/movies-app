import { Component, OnInit, inject, signal } from '@angular/core';
import {
  IonAvatar, IonContent, IonHeader, IonItem, IonLabel, IonNote,
  IonSpinner, IonTitle, IonToolbar,
} from '@ionic/angular';
import { AuthService } from '../../services/auth.service';
import { MatchingService } from '../../services/matching.service';
import { Match, MATCH_THRESHOLD } from '../../utils/find-matches';
import { DecimalPipe } from '@angular/common';
@Component({
  selector: 'app-matching',
  templateUrl: './matching.page.html',
  styleUrls: ['./matching.page.scss'],
  imports: [DecimalPipe,IonAvatar, IonContent, IonHeader, IonItem, IonLabel, IonNote, IonSpinner, IonTitle, IonToolbar],
})
export class MatchingPage implements OnInit {
  private auth = inject(AuthService);
  private matching = inject(MatchingService);

  readonly threshold = MATCH_THRESHOLD;
  readonly matches = signal<Match[]>([]);
  readonly loading = signal(true);
  readonly error = signal(false);

  async ngOnInit() {
    try {
      await this.auth.ready;
      const uid = this.auth.profile()?.uid;
      if (uid) this.matches.set(await this.matching.getMatches(uid));
    } catch {
      this.error.set(true);
    } finally {
      this.loading.set(false);
    }
  }
}
