import { Injectable, inject } from '@angular/core'
import { DateAdapter } from '@angular/material/core'

@Injectable({ providedIn: 'root' })
export class DateLocaleService {
  private dateAdapter = inject(DateAdapter);

  setLocale(lang: string) {
    const map: Record<string, string> = {
      de: 'de-DE',
      en: 'en-GB',
      fr: 'fr-FR',
      is: 'en-GB', // is-IS does not work
    };
    const locale = map[lang] ?? lang;
    this.dateAdapter.setLocale(locale);
  }
}
