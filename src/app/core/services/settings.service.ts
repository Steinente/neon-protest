import { Injectable } from '@angular/core'
import { BehaviorSubject, Subscription } from 'rxjs'
import { AppSettings } from '../models/settings.model'
import { StorageService } from './storage.service'

@Injectable({ providedIn: 'root' })
export class SettingsService {
  private settings$: BehaviorSubject<AppSettings>;

  constructor(private storage: StorageService) {
    const loaded = this.storage.load();
    this.settings$ = new BehaviorSubject<AppSettings>(
      loaded || this.getDefault()
    );
  }

  get value(): AppSettings {
    return this.settings$.value;
  }

  subscribe(fn: (settings: AppSettings) => void): Subscription {
    return this.settings$.subscribe(fn);
  }

  update(partial: Partial<AppSettings>): void {
    const newSettings = { ...this.value, ...partial };
    this.settings$.next(newSettings);
    this.storage.save(newSettings);
  }

  set(settings: AppSettings): void {
    this.settings$.next(settings);
    this.storage.save(settings);
  }

  getDefault(): AppSettings {
    return {
      format: 'profile',
      date: new Date().toISOString().slice(0, 10),
      from: '13:00',
      to: '16:00',
      place: '',
      animal: '',
      lang: 'de',
      elements: [],
    };
  }
}
