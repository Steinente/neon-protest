// animal-dialog.component.ts
import { CommonModule } from '@angular/common'
import {
  Component,
  EventEmitter,
  Input,
  OnChanges,
  OnDestroy,
  OnInit,
  Output,
  SimpleChanges,
} from '@angular/core'
import { TranslateModule, TranslateService } from '@ngx-translate/core'
import { Subscription, firstValueFrom } from 'rxjs'
import { Animal } from '../../core/models/animal.model'
import { TabId } from '../../core/models/settings.model'
import { AnimalService } from '../../core/services/animal.service'

@Component({
  selector: 'app-animal-dialog',
  standalone: true,
  imports: [CommonModule, TranslateModule],
  templateUrl: './animal-dialog.component.html',
  styleUrl: './animal-dialog.component.scss',
})
export class AnimalDialogComponent implements OnInit, OnChanges, OnDestroy {
  @Output() public select = new EventEmitter<Animal>();
  @Output() public close = new EventEmitter<void>();
  @Input() public selectedAnimal: string = '';
  @Input({ required: true }) tabId!: TabId;

  public list: ReadonlyArray<Animal> = [];

  private langSub?: Subscription;
  private collator = new Intl.Collator(undefined, {
    usage: 'sort',
    sensitivity: 'base',
    numeric: true,
    ignorePunctuation: true,
  });

  constructor(
    private animalService: AnimalService,
    private translate: TranslateService
  ) {}

  public async ngOnInit(): Promise<void> {
    await this.loadAndSort();
    this.langSub = this.translate.onLangChange.subscribe(async () => {
      this.rebuildCollator();
      await this.sortListByTranslation();
    });
    document.body.style.overflow = 'hidden';
  }

  public async ngOnChanges(changes: SimpleChanges): Promise<void> {
    if (changes['tabId'] && this.tabId) {
      await this.loadAndSort();
    }
  }

  public ngOnDestroy(): void {
    this.langSub?.unsubscribe();
    document.body.style.overflow = '';
  }

  public selectAnimal(animal: Animal): void {
    this.selectedAnimal = animal.name;
    this.select.emit(animal);
    this.close.emit();
  }

  private async loadAndSort(): Promise<void> {
    this.list = this.animalService.getAll(this.tabId);
    this.rebuildCollator();
    await this.sortListByTranslation();
  }

  private async sortListByTranslation(): Promise<void> {
    if (!this.list.length) return;
    const keys = this.list.map((a) => `ANIMALS.${this.tabId}.${a.name}`);
    const translations = await firstValueFrom(this.translate.get(keys));

    this.list = [...this.list].sort((a, b) => {
      const ta = (translations[`ANIMALS.${this.tabId}.${a.name}`] ?? a.name)
        .toString()
        .trim();
      const tb = (translations[`ANIMALS.${this.tabId}.${b.name}`] ?? b.name)
        .toString()
        .trim();
      return this.collator.compare(ta, tb);
    });
  }

  private rebuildCollator(): void {
    const locale = this.translate.currentLang || 'en';
    this.collator = new Intl.Collator(locale, {
      usage: 'sort',
      sensitivity: 'base',
      numeric: true,
      ignorePunctuation: true,
    });
  }
}
