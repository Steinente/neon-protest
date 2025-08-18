import { CommonModule } from '@angular/common'
import { Component, Input, OnChanges, OnDestroy, OnInit } from '@angular/core'
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms'
import { MatButtonToggleModule } from '@angular/material/button-toggle'
import { MatDatepickerModule } from '@angular/material/datepicker'
import { MatFormFieldModule } from '@angular/material/form-field'
import { MatIconModule } from '@angular/material/icon'
import { MatInputModule } from '@angular/material/input'
import { MatSelectModule } from '@angular/material/select'
import { TranslateModule } from '@ngx-translate/core'
import { Subject, takeUntil } from 'rxjs'
import { TabId } from '../../../core/models/settings.model'
import { SettingsService } from '../../../core/services/settings.service'
import { AnimalDialogComponent } from '../../../shared/animal-dialog/animal-dialog.component'

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
export class ContentTabComponent implements OnInit, OnChanges, OnDestroy {
  @Input() public tabId!: TabId;
  public form!: FormGroup;
  public times: string[] = [];
  public animalDialogOpen: boolean = false;
  public selectedAnimal: string = '';
  private destroy$ = new Subject<void>();

  constructor(private fb: FormBuilder, private settings: SettingsService) {
    this.times = this.getTimes();
  }

  public ngOnInit(): void {
    this.setupForm();
  }

  public ngOnChanges(): void {
    if (this.form) this.patchFromState();
  }

  public ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  public openAnimalDialog(): void {
    this.animalDialogOpen = true;
  }

  public selectAnimal(animal: any): void {
    this.settings.updateFor(this.tabId, { animal: animal.name });
    this.selectedAnimal = animal.name;
    this.animalDialogOpen = false;
  }

  public formatTime(value: string): string {
    const [hours, minutes] = value.split(':').map(Number);
    const date = new Date();
    date.setHours(hours, minutes);
    const lang = this.settings.state.lang;
    return new Intl.DateTimeFormat(lang === 'en' ? 'en-US' : 'de-DE', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: lang === 'en',
    }).format(date);
  }

  private setupForm(): void {
    const s = this.settings.getFor(this.tabId);
    this.form = this.fb.group({
      format: [s.format],
      date: [s.date ?? this.currentDate],
      from: [s.from],
      to: [s.to],
      place: [s.place],
      animal: [s.animal],
    });
    this.selectedAnimal = s.animal;
    this.form.valueChanges.pipe(takeUntil(this.destroy$)).subscribe((val) => {
      this.settings.updateFor(this.tabId, val);
    });
  }

  private patchFromState(): void {
    if (!this.form) return;
    const s = this.settings.getFor(this.tabId);

    this.form.patchValue(
      {
        format: s.format,
        date: s.date ?? this.currentDate,
        from: s.from,
        to: s.to,
        place: s.place,
        animal: s.animal,
      },
      { emitEvent: false }
    );

    this.selectedAnimal = s.animal;
  }

  private getTimes(): string[] {
    const res: string[] = [];
    for (let h = 0; h < 24; h++)
      for (let m = 0; m < 60; m += 15)
        res.push(`${('0' + h).slice(-2)}:${('0' + m).slice(-2)}`);
    return res;
  }

  public get animalName(): string {
    return this.settings.getFor(this.tabId).animal;
  }

  private get currentDate(): string {
    return new Date().toISOString().slice(0, 10);
  }
}
