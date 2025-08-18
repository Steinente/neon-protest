// storage.service.ts
import { Injectable } from '@angular/core'

const STORAGE_KEY = 'neon_black_app_settings';

@Injectable({ providedIn: 'root' })
export class StorageService {
  load<T = unknown>(): T | null {
    const json = localStorage.getItem(STORAGE_KEY);
    try {
      return json ? (JSON.parse(json) as T) : null;
    } catch {
      return null;
    }
  }

  save<T>(state: T): void {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  }

  clear(): void {
    localStorage.removeItem(STORAGE_KEY);
  }
}
