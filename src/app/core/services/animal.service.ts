import { Injectable } from '@angular/core';
import { Animal } from '../models/animal.model';

@Injectable({ providedIn: 'root' })
export class AnimalService {
  private animals: Animal[] = [
    { name: 'BUDGIE', image: 'assets/animals/budgie.jpg' },
    { name: 'BUMBLEBEE', image: 'assets/animals/bumblebee.jpg' },
    { name: 'CHIMPANZEE', image: 'assets/animals/chimpanzee.jpg' },
    { name: 'COW_HORNED', image: 'assets/animals/cow_horned.jpg' },
    { name: 'COW_POLLED', image: 'assets/animals/cow_polled.jpg' },
    { name: 'DOG_BEAGLE', image: 'assets/animals/dog_beagle.jpg' },
    { name: 'DOG_BOSTON_TERRIER', image: 'assets/animals/dog_boston_terrier.jpg' },
    { name: 'DUCK', image: 'assets/animals/duck.jpg' },
    { name: 'FERRET', image: 'assets/animals/ferret.jpg' },
    { name: 'FISH', image: 'assets/animals/fish.jpg' },
    { name: 'GUINEA_PIG', image: 'assets/animals/guinea_pig.jpg' },
    { name: 'HORSE', image: 'assets/animals/horse.jpg' },
    { name: 'LAMB', image: 'assets/animals/lamb.jpg' },
    { name: 'LOBSTER', image: 'assets/animals/lobster.jpg' },
    { name: 'MOUSE', image: 'assets/animals/mouse.jpg' },
    { name: 'OCTOPUS', image: 'assets/animals/octopus.jpg' },
    { name: 'PIGLET', image: 'assets/animals/piglet.jpg' },
    { name: 'CAT', image: 'assets/animals/cat.jpg' },
    { name: 'RABBIT', image: 'assets/animals/rabbit.jpg' },
    { name: 'RAM', image: 'assets/animals/ram.jpg' },
    { name: 'RED_DEER', image: 'assets/animals/red_deer.jpg' },
    { name: 'ROOSTER', image: 'assets/animals/rooster.jpg' },
    { name: 'SHEEP', image: 'assets/animals/sheep.jpg' },
    { name: 'TURKEY', image: 'assets/animals/turkey.jpg' },
    { name: 'WILD_BOAR', image: 'assets/animals/wild_boar.jpg' },
  ];

  getAll(): Animal[] {
    return this.animals;
  }

  getByName(name: string): Animal | undefined {
    return this.animals.find((a) => a.name === name);
  }
}
