import { Injectable } from '@angular/core'
import { Animal } from '../models/animal.model'
import { TabId } from '../models/settings.model'

const BASE_PATHS = {
  neonProtest: 'assets/animals/neon_protest',
  prideProtest: 'assets/animals/pride_protest',
} as const;

const NEON_PROTEST_NAMES = [
  'BUDGIE',
  'BUMBLEBEE',
  'CHIMPANZEE',
  'COW_HORNED',
  'COW_POLLED',
  'DOG_BEAGLE',
  'DOG_BOSTON_TERRIER',
  'DOVE',
  'DUCK',
  'FERRET',
  'FISH',
  'GOOSE',
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

export type NeonProtestName = (typeof NEON_PROTEST_NAMES)[number];

const PRIDE_PROTEST_NAMES = [
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

export type PrideProtestName = (typeof PRIDE_PROTEST_NAMES)[number];

@Injectable({ providedIn: 'root' })
export class AnimalService {
  private readonly neonProtestAnimals: ReadonlyArray<Animal>;
  private readonly prideProtestAnimals: ReadonlyArray<Animal>;

  constructor() {
    this.neonProtestAnimals = this.buildAnimals(
      NEON_PROTEST_NAMES,
      BASE_PATHS.neonProtest,
      'jpg'
    );
    this.prideProtestAnimals = this.buildAnimals(
      PRIDE_PROTEST_NAMES,
      BASE_PATHS.prideProtest,
      'png'
    );
  }

  public getAll(tabId: TabId): ReadonlyArray<Animal> {
    return tabId === 'NEON_PROTEST'
      ? this.neonProtestAnimals
      : this.prideProtestAnimals;
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
