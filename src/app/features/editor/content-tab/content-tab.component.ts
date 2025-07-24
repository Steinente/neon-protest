import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { MatButtonToggleModule } from '@angular/material/button-toggle';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { TranslateModule } from '@ngx-translate/core';
import { SettingsService } from '../../../core/services/settings.service';
import { AnimalDialogComponent } from '../../../shared/animal-dialog/animal-dialog.component';

@Component({
  selector: 'app-content-tab',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonToggleModule,
    MatDatepickerModule,
    MatSelectModule,
    MatIconModule,
    AnimalDialogComponent,
    TranslateModule,
  ],
  templateUrl: './content-tab.component.html',
  styleUrl: './content-tab.component.scss',
})
export class ContentTabComponent {
  public form: FormGroup;
  public times: string[] = [];
  public animalDialogOpen: boolean = false;
  public selectedAnimal: string = '';

  constructor(private fb: FormBuilder, private settings: SettingsService) {
    const s = this.settings.value;
    this.form = this.fb.group({
      format: [s.format],
      date: [this.currentDate || s.date],
      from: [s.from],
      to: [s.to],
      place: [s.place],
      animal: [s.animal],
      lang: [s.lang],
    });
    this.times = this.getTimes();
    this.form.valueChanges.subscribe((val) => {
      this.settings.update(val);
    });
  }

  public ngOnInit(): void {
    this.selectedAnimal = this.form.get('animal')?.value;
  }

  public openAnimalDialog(): void {
    this.animalDialogOpen = true;
  }

  public selectAnimal(animal: any): void {
    this.settings.update({ animal: animal.name });
    this.selectedAnimal = animal.name;
    this.animalDialogOpen = false;
  }

  public formatTime(value: string): string {
    const [hours, minutes] = value.split(':').map(Number);
    const date = new Date();
    date.setHours(hours, minutes);

    const lang = this.settings.value.lang;

    return new Intl.DateTimeFormat(lang === 'en' ? 'en-US' : 'de-DE', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: lang === 'en',
    }).format(date);
  }

  private getTimes(): string[] {
    const res = [];
    for (let h = 0; h < 24; h++)
      for (let m = 0; m < 60; m += 15)
        res.push(`${('0' + h).slice(-2)}:${('0' + m).slice(-2)}`);
    return res;
  }

  public get animalName(): string {
    return this.settings.value.animal;
  }

  private get currentDate(): string {
    return new Date().toISOString().slice(0, 10);
  }
}
