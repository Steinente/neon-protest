import { CommonModule } from '@angular/common'
import { Component, EventEmitter, Input, Output } from '@angular/core'
import { TranslateModule } from '@ngx-translate/core'
import { Animal } from '../../core/models/animal.model'
import { AnimalService } from '../../core/services/animal.service'

@Component({
  selector: 'app-animal-dialog',
  standalone: true,
  imports: [CommonModule, TranslateModule],
  templateUrl: './animal-dialog.component.html',
  styleUrl: './animal-dialog.component.scss',
})
export class AnimalDialogComponent {
  @Output() select = new EventEmitter<any>();
  @Output() close = new EventEmitter<void>();
  @Input() selectedAnimal: string = '';

  animals: Animal[] = [];

  constructor(private animalService: AnimalService) {}

  ngOnInit() {
    this.animals = this.animalService.getAll();
    // Disable body scroll when dialog opens
    document.body.style.overflow = 'hidden';
  }

  ngOnDestroy() {
    // Re-enable body scroll when dialog closes
    document.body.style.overflow = '';
  }

  selectAnimal(animal: any) {
    this.selectedAnimal = animal.name;
    this.select.emit(animal);
    this.close.emit();
  }
}
