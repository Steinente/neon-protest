import { Injectable } from '@angular/core'
import { AppSettings } from '../models/settings.model'

const STORAGE_KEY = 'neon_black_app_settings';

@Injectable({ providedIn: 'root' })
export class StorageService {
  load(): AppSettings | null {
    const json = localStorage.getItem(STORAGE_KEY);
    return json ? JSON.parse(json) : null;
  }

  save(settings: AppSettings): void {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
  }
}
