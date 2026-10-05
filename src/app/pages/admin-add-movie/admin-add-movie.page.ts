import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonContent, IonHeader, IonTitle, IonToolbar } from '@ionic/angular';

@Component({
  selector: 'app-admin-add-movie',
  templateUrl: './admin-add-movie.page.html',
  styleUrls: ['./admin-add-movie.page.scss'],
  imports: [IonContent, IonHeader, IonTitle, IonToolbar, CommonModule, FormsModule]
})
export class AdminAddMoviePage implements OnInit {

  constructor() { }

  ngOnInit() {
  }

}
