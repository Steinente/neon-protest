import { Injectable, inject } from '@angular/core'
import { DateAdapter } from '@angular/material/core'

@Injectable({ providedIn: 'root' })
export class DateLocaleService {
  private dateAdapter = inject(DateAdapter);

  setLocale(lang: string) {
    const locale = lang === 'de' ? 'de-DE' : lang === 'en' ? 'en-GB' : 'fr-FR';

    this.dateAdapter.setLocale(locale);
  }
}
