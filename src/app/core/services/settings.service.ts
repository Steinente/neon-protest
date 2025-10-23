import { Injectable } from '@angular/core'
import { BehaviorSubject, Subscription } from 'rxjs'
import { AppSettingsPerTab, AppState, TabId } from '../models/settings.model'
import { StorageService } from './storage.service'

@Injectable({ providedIn: 'root' })
export class SettingsService {
  private state$: BehaviorSubject<AppState>;

  constructor(private storage: StorageService) {
    const loaded = this.storage.load();
    const state = this.migrateOrDefault(loaded);
    this.state$ = new BehaviorSubject<AppState>(state);
  }

  get state(): AppState {
    return this.state$.value;
  }

  get activeTabId(): TabId {
    return this.state.activeTabId;
  }

  get lang(): AppState['lang'] {
    return this.state.lang;
  }

  setLang(lang: AppState['lang']): void {
    const next: AppState = { ...this.state, lang };
    this.state$.next(next);
    this.storage.save(next);
  }

  getFor(tabId: TabId): AppSettingsPerTab {
    return this.state.tabs[tabId];
  }

  subscribe(fn: (state: AppState) => void): Subscription {
    return this.state$.subscribe(fn);
  }

  setActiveTab(tabId: TabId): void {
    if (tabId === this.state.activeTabId) return;
    const next: AppState = { ...this.state, activeTabId: tabId };
    this.state$.next(next);
    this.storage.save(next);
  }

  updateFor(tabId: TabId, partial: Partial<AppSettingsPerTab>): void {
    const cur = this.getFor(tabId);
    const nextTab = { ...cur, ...partial };
    const next: AppState = {
      ...this.state,
      tabs: { ...this.state.tabs, [tabId]: nextTab },
    };
    this.state$.next(next);
    this.storage.save(next);
  }

  setFor(tabId: TabId, settings: AppSettingsPerTab): void {
    const next: AppState = {
      ...this.state,
      tabs: { ...this.state.tabs, [tabId]: settings },
    };
    this.state$.next(next);
    this.storage.save(next);
  }

  private migrateOrDefault(raw: any): AppState {
    if (raw && raw.activeTabId && raw.tabs && typeof raw.lang === 'string') {
      return raw as AppState;
    }

    if (raw && raw.activeTabId && raw.tabs) {
      const active: TabId = raw.activeTabId || 'NEON_PROTEST';
      const fromActive = raw.tabs?.[active]?.lang;
      const fallback =
        raw.tabs?.NEON_PROTEST?.lang || raw.tabs?.PRIDE_PROTEST?.lang || 'en';

      const strip = (t: any): AppSettingsPerTab => ({
        format: t.format || 'PROFILE',
        date: t.date || new Date().toISOString().slice(0, 10),
        from: t.from || '13:00',
        to: t.to || '16:00',
        place: t.place || '',
        animal: t.animal || '',
        elements: t.elements || [],
      });

      return {
        activeTabId: active,
        lang: fromActive || fallback,
        tabs: {
          NEON_PROTEST: strip(raw.tabs.NEON_PROTEST || {}),
          PRIDE_PROTEST: strip(raw.tabs.PRIDE_PROTEST || {}),
        },
      };
    }

    if (raw && (raw.tabId || raw.format || raw.date)) {
      const lang = raw.lang || 'en';
      const neonProtest: AppSettingsPerTab = {
        format: raw.format || 'PROFILE',
        date: raw.date || new Date().toISOString().slice(0, 10),
        from: raw.from || '13:00',
        to: raw.to || '16:00',
        place: raw.place || '',
        animal: raw.animal || '',
        elements: raw.elements || [],
      };
      return {
        activeTabId: raw.tabId || 'NEON_PROTEST',
        lang,
        tabs: { NEON_PROTEST: neonProtest, PRIDE_PROTEST: this.makeDefaultPerTab() },
      };
    }

    return this.getDefaultState();
  }

  private getDefaultState(): AppState {
    return {
      activeTabId: 'NEON_PROTEST',
      lang: 'en',
      tabs: {
        NEON_PROTEST: this.makeDefaultPerTab(),
        PRIDE_PROTEST: this.makeDefaultPerTab(),
      },
    };
  }

  private makeDefaultPerTab(): AppSettingsPerTab {
    return {
      format: 'PROFILE',
      date: new Date().toISOString().slice(0, 10),
      from: '13:00',
      to: '16:00',
      place: '',
      animal: '',
      elements: [],
    };
  }
}
