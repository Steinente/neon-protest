import { Injectable } from '@angular/core'
import { Animal } from '../models/animal.model'
import { TabId } from '../models/settings.model'

const BASE_PATHS = {
  neonBlack: 'assets/animals/neon_black',
  neon: 'assets/animals/neon',
} as const;

const NEON_BLACK_NAMES = [
  'BUDGIE',
  'BUMBLEBEE',
  'CHIMPANZEE',
  'COW_HORNED',
  'COW_POLLED',
  'DOG_BEAGLE',
  'DOG_BOSTON_TERRIER',
  'DUCK',
  'FERRET',
  'FISH',
  'GUINEA_PIG',
  'HORSE',
  'LAMB',
  'LOBSTER',
  'MOUSE',
  'OCTOPUS',
  'PIGLET',
  'CAT',
  'RABBIT',
  'RAM',
  'RED_DEER',
  'ROOSTER',
  'SHEEP',
  'TURKEY',
  'WILD_BOAR',
] as const;

export type NeonBlackName = (typeof NEON_BLACK_NAMES)[number];

const NEON_NAMES = [
  'BIRD',
  'COW_AND_CALF',
  'DOG',
  'FISH',
  'GOAT',
  'HORSE',
  'MOUSE',
  'PIG',
  'RABBIT',
  'ROOSTER',
  'SHEEP',
] as const;

export type NeonName = (typeof NEON_NAMES)[number];

@Injectable({ providedIn: 'root' })
export class AnimalService {
  private readonly neonBlackAnimals: ReadonlyArray<Animal>;
  private readonly neonAnimals: ReadonlyArray<Animal>;

  constructor() {
    this.neonBlackAnimals = this.buildAnimals(
      NEON_BLACK_NAMES,
      BASE_PATHS.neonBlack,
      'jpg'
    );
    this.neonAnimals = this.buildAnimals(NEON_NAMES, BASE_PATHS.neon, 'png');
  }

  public getAll(tabId: TabId): ReadonlyArray<Animal> {
    return tabId === 'NEON_BLACK' ? this.neonBlackAnimals : this.neonAnimals;
  }

  public getByName(tabId: TabId, name: string): Animal | undefined {
    const list = this.getAll(tabId);
    return list.find((a) => a.name.toLowerCase() === name.toLowerCase());
  }

  private buildAnimals(
    names: readonly string[],
    basePath: string,
    extension: string
  ): ReadonlyArray<Animal> {
    return names.map((name) => ({
      name,
      image: `${basePath}/${name.toLowerCase()}.${extension}`,
    }));
  }
}
