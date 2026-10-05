import { ComponentFixture, TestBed } from '@angular/core/testing';
import { AdminAddMoviePage } from './admin-add-movie.page';

describe('AdminAddMoviePage', () => {
  let component: AdminAddMoviePage;
  let fixture: ComponentFixture<AdminAddMoviePage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(AdminAddMoviePage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
