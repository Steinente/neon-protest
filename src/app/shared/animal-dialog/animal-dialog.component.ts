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
import { TranslateModule } from '@ngx-translate/core'
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

  constructor(private animalService: AnimalService) {}

  public ngOnInit(): void {
    this.list = this.animalService.getAll(this.tabId);
    document.body.style.overflow = 'hidden';
  }

  public ngOnChanges(changes: SimpleChanges): void {
    if (changes['tabId'] && this.tabId) {
      this.list = this.animalService.getAll(this.tabId);
    }
  }

  public ngOnDestroy(): void {
    document.body.style.overflow = '';
  }

  public selectAnimal(animal: Animal): void {
    this.selectedAnimal = animal.name;
    this.select.emit(animal);
    this.close.emit();
  }
}
